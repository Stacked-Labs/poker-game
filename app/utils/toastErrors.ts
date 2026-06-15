// Shared normalization for the messy strings wallets, RPC providers, and our
// backend throw, so toasts never surface a raw stack trace or provider blob.
// Three existing call sites grew their own copies of this logic (useWithdraw,
// useDepositAndJoin, useWalletAuth) — this is the single source of truth.

export interface FriendlyToast {
    title: string;
    description?: string;
}

// Wallet-rejection phrasing only — deliberately narrow so backend/domain copy
// like "Seat request denied." or "Tournament cancelled" is NOT misread as a
// wallet dismissal. Code-based detection (4001/ACTION_REJECTED) covers the rest.
const REJECTION_RE =
    /\buser (?:rejected|denied|cancell?ed|refused)\b|\b(?:rejected|denied|cancell?ed) (?:the )?(?:transaction|request|signature|message|connection|by user)\b|\baction[ _]?rejected\b/i;
const GAS_RE = /insufficient funds|exceeds balance|gas required exceeds/i;

// One canonical gas-shortage line. Used both as a toast (via friendlyError) and
// as the single-string `error` state some hooks expose.
export const GAS_SHORTAGE_TITLE = 'Not enough ETH for gas';
export const GAS_SHORTAGE_DESCRIPTION =
    'Add a little ETH on Base to your wallet to cover the network fee, then try again.';
export const GAS_SHORTAGE_MESSAGE = `${GAS_SHORTAGE_TITLE}. ${GAS_SHORTAGE_DESCRIPTION}`;

// Pull a human-readable message out of whatever was thrown/returned.
export function errorMessage(err: unknown): string | undefined {
    if (!err) return undefined;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object') {
        const m = (err as { message?: unknown }).message;
        if (typeof m === 'string') return m;
    }
    return undefined;
}

// True when the user dismissed the request in their wallet (MetaMask 4001 etc.).
export function isUserRejection(err: unknown): boolean {
    const code = (err as { code?: number | string } | null | undefined)?.code;
    if (code === 4001 || code === 'ACTION_REJECTED') return true;
    return REJECTION_RE.test(errorMessage(err) ?? '');
}

export function isGasShortage(err: unknown): boolean {
    return GAS_RE.test(errorMessage(err) ?? '');
}

// Map an ON-CHAIN/wallet error to player-facing toast copy. Wallet rejection and
// gas shortage get canonical copy; anything else falls back to the caller's
// generic copy so we never leak a raw RPC/provider blob. Use this for wallet/
// contract calls (withdraw, refund, etc.).
export function friendlyError(err: unknown, fallback: FriendlyToast): FriendlyToast {
    if (isUserRejection(err)) {
        return {
            title: 'Request cancelled',
            description: 'You dismissed the request in your wallet.',
        };
    }
    if (isGasShortage(err)) {
        return {
            title: GAS_SHORTAGE_TITLE,
            description: GAS_SHORTAGE_DESCRIPTION,
        };
    }
    return fallback;
}

// For BACKEND/server-authored errors (API result.message, WS error events): map a
// genuine wallet rejection/gas error to canonical copy, but otherwise PRESERVE the
// server's own message as the description — it is player-facing domain copy (e.g.
// "Tournament is full", "Seat request denied"). Only when there is no message do
// we use the caller's generic fallback. Unlike friendlyError, this never discards
// a useful backend reason.
export function friendlyMessage(err: unknown, fallback: FriendlyToast): FriendlyToast {
    if (isUserRejection(err)) {
        return {
            title: 'Request cancelled',
            description: 'You dismissed the request in your wallet.',
        };
    }
    if (isGasShortage(err)) {
        return {
            title: GAS_SHORTAGE_TITLE,
            description: GAS_SHORTAGE_DESCRIPTION,
        };
    }
    const message = errorMessage(err)?.trim();
    return { title: fallback.title, description: message || fallback.description };
}
