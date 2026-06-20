/**
 * Pure decision logic for reconciling the two INDEPENDENT notions of identity the app holds:
 *
 *  - `sessionWallet`  — the wallet the server's SIWE auth cookie (JWT) is bound to. This is the
 *    source of truth for "who am I authenticated as". It survives reloads and new tabs (it's a
 *    cookie) and is what the WebSocket authenticates with. Read from `GET /isAuth` → `{ isAuth,
 *    address }`.
 *  - `connectedWallet` — the wallet thirdweb currently has active (`useActiveAccount`). This is
 *    in-memory, re-hydrated by `<AutoConnect>` on every cold load, and can lag, vanish, or
 *    silently switch when the user changes account *inside* their wallet extension (Rabby /
 *    MetaMask emit `accountsChanged`, not a thirdweb-driven event).
 *
 * The whole family of "wallet connection lost" and "didn't log out on switch" bugs comes from
 * treating `connectedWallet` as the source of truth and reacting only to its *transitions*
 * (which are timing- and event-order-dependent). This function instead derives the security
 * decision from a CONTINUOUS comparison of the two values, so it is independent of event
 * ordering and AutoConnect hydration timing.
 */

export type ConnectionStatus =
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'unknown';

export interface WalletSessionInput {
    /** Wallet bound to the SIWE JWT cookie, or null/undefined when there is no valid session. */
    sessionWallet: string | null | undefined;
    /** thirdweb active account address, or null/undefined when no wallet is connected. */
    connectedWallet: string | null | undefined;
    /** thirdweb connection status — distinguishes "still auto-connecting" from "settled, no wallet". */
    connectionStatus: ConnectionStatus;
}

export type WalletSessionDecision =
    /** Cookie wallet === connected wallet. Fully signed in. */
    | { status: 'authenticated'; wallet: string }
    /** Cookie says X, wallet is Y. SECURITY: drop X's session before Y can act. */
    | { status: 'mismatch'; sessionWallet: string; connectedWallet: string }
    /** Session valid, wallet not connected yet, AutoConnect still in flight — wait, keep session. */
    | { status: 'wallet-reconnecting'; sessionWallet: string }
    /** Session valid, wallet absent and AutoConnect settled — keep session, offer reconnect. */
    | { status: 'wallet-disconnected'; sessionWallet: string }
    /** No session, but a wallet is connected — needs SIWE. */
    | { status: 'needs-auth'; connectedWallet: string }
    /** No session, no wallet, still hydrating. */
    | { status: 'connecting' }
    /** No session, no wallet. */
    | { status: 'unauthenticated' };

/**
 * Normalize an address for comparison. Returns '' for anything that is not a syntactically
 * valid 0x-prefixed 20-byte hex address, so malformed/empty/whitespace values can never
 * compare equal to each other or to a real address.
 */
export function normalizeAddr(a: string | null | undefined): string {
    if (typeof a !== 'string') return '';
    const t = a.trim().toLowerCase();
    return /^0x[0-9a-f]{40}$/.test(t) ? t : '';
}

export function reconcileWalletSession(
    input: WalletSessionInput
): WalletSessionDecision {
    const session = normalizeAddr(input.sessionWallet);
    const connected = normalizeAddr(input.connectedWallet);
    // 'unknown' is the pre-AutoConnect state — treat it like 'connecting' so a valid session is
    // never prematurely declared disconnected during hydration.
    const settling =
        input.connectionStatus === 'connecting' ||
        input.connectionStatus === 'unknown';

    if (session) {
        if (connected) {
            if (session === connected) {
                return { status: 'authenticated', wallet: session };
            }
            // SECURITY: the cookie is bound to `session` but a different wallet is now active.
            // The caller must clear the session before the new wallet is allowed to act.
            return {
                status: 'mismatch',
                sessionWallet: session,
                connectedWallet: connected,
            };
        }
        // Session valid, no wallet connected. Keep the session either way — never clear the JWT
        // just because thirdweb has not (re)hydrated the wallet.
        return settling
            ? { status: 'wallet-reconnecting', sessionWallet: session }
            : { status: 'wallet-disconnected', sessionWallet: session };
    }

    // No valid session.
    if (connected) return { status: 'needs-auth', connectedWallet: connected };
    if (settling) return { status: 'connecting' };
    return { status: 'unauthenticated' };
}

/** True only when the caller MUST clear the server session (logout) before proceeding. */
export function decisionRequiresLogout(d: WalletSessionDecision): boolean {
    return d.status === 'mismatch';
}
