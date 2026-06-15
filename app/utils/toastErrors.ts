// Shared normalization for the messy strings wallets, RPC providers, and our
// backend throw, so toasts never surface a raw stack trace or provider blob.
// Three existing call sites grew their own copies of this logic (useWithdraw,
// useDepositAndJoin, useWalletAuth) — this is the single source of truth.

export interface FriendlyToast {
    title: string;
    description?: string;
}

const REJECTION_RE = /rejected|denied|cancell?ed/i;
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

// Map an unknown error to player-facing toast copy. Known failure modes get
// canonical copy; anything else falls back to the caller's copy so we never leak
// a raw provider/backend string into the UI.
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
