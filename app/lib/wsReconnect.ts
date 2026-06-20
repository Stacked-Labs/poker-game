/**
 * Pure decision logic for the table WebSocket's auth "upgrade" reconnect.
 *
 * The table socket may open BEFORE SIWE has settled (it opens as a spectator). Once the cookie
 * session becomes authenticated, the socket must reconnect so the backend upgrades it (re-binds
 * the seat via TryReclaimSeat). The question this answers is: "given the auth state captured when
 * the socket opened vs the current auth state, should we force that reconnect?"
 *
 * CRITICAL: the decision is based ONLY on the cookie identity — `isAuthenticated` and
 * `sessionWallet` (server truth) — never on the connected wallet (`useActiveAccount().address`).
 * The connected wallet is re-resolved by thirdweb's <AutoConnect> on every cold load and can lag,
 * vanish, or flicker; keying the reconnect on it makes the address jitter tear the socket down on
 * a loop, which silently blanks the socket-gated action footer (bet/fold/raise). By construction
 * — the connected wallet is not even a parameter here — that jitter cannot drive a reconnect.
 *
 * See `app/lib/walletSession.ts` for the same "cookie is the source of truth" model and
 * `.claude/skills/web3-thirdweb-siwe/references/auth-flow.md` for the full rationale.
 */

import { normalizeAddr } from './walletSession';

export interface WsAuthSnapshot {
    /** Whether the SIWE cookie session is authenticated (server truth). */
    isAuthenticated: boolean;
    /** Wallet the SIWE cookie is bound to, or null when unauthenticated. NOT the connected wallet. */
    sessionWallet: string | null | undefined;
}

/**
 * True when the open socket should force a reconnect to (re)sync its server-side auth.
 *
 * Fires on exactly two cookie-identity transitions:
 *  1. Spectator → authenticated: opened unauthenticated, the cookie is now authenticated.
 *  2. Re-bind: still authenticated, but the session is now a DIFFERENT wallet than at connect
 *     (e.g. a switch that re-ran SIWE while the socket stayed open).
 *
 * It deliberately does NOT fire on auth LOSS (authenticated → unauthenticated): dropping back to
 * a spectator socket is owned by a separate effect. And it cannot fire on connected-wallet jitter,
 * because the connected wallet is not part of the decision.
 */
export function shouldReconnectForAuthUpgrade(
    atConnect: WsAuthSnapshot,
    current: WsAuthSnapshot
): boolean {
    // (1) Gained auth since the socket opened → upgrade the spectator connection.
    if (!atConnect.isAuthenticated && current.isAuthenticated) return true;

    // (2) Still authenticated, but bound to a different valid session wallet → re-bind.
    if (atConnect.isAuthenticated && current.isAuthenticated) {
        const before = normalizeAddr(atConnect.sessionWallet);
        const now = normalizeAddr(current.sessionWallet);
        return Boolean(before && now && before !== now);
    }

    // Auth lost, or never authenticated → not this effect's job.
    return false;
}
