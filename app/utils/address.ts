// One canonical wallet shortener for the whole app. Display surfaces should never
// hand-roll their own slice()/ellipsis — import from here so every shortened
// address reads identically (0x1a2b…3c4d) and the full address stays available
// for explorer links.

// Single ellipsis char (…), 6 leading (incl. 0x) + 4 trailing — the agreed format.
export function shortenAddress(addr?: string | null): string {
    if (!addr) return '';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// The label to show for a player/author. Fallback chain (#340): X display name →
// @handle → short wallet. The display name (e.g. "Mike Dawson") is warmer than the
// @handle for a recreational audience and is rendered as-is, never prefixed with "@".
// `username` is the @handle (already including "@" by convention) or a chosen nickname,
// or empty for a wallet-only player, always paired with the full `address` for links.
export function playerDisplayName(
    username?: string | null,
    address?: string | null,
    displayName?: string | null
): string {
    const dn = (displayName ?? '').trim();
    if (dn) return dn; // X display name — render as-is, no "@"
    const name = (username ?? '').trim();
    if (name) return name; // @handle or nickname
    if (address) return shortenAddress(address);
    return '';
}

// Classifies a player's identity so callers can both label and link it: an X handle
// links to the profile, a wallet (empty username + an address) links to the block
// explorer, and a chosen nickname links nowhere. Pure — URL building lives in the link
// layer so this stays free of chain/explorer config.
export type PlayerIdentity =
    | { kind: 'x'; handle: string; label: string }
    | { kind: 'wallet'; address: string; label: string }
    | { kind: 'name'; label: string };

export function resolvePlayerIdentity(
    username?: string | null,
    address?: string | null,
    displayName?: string | null
): PlayerIdentity {
    const dn = (displayName ?? '').trim();
    const name = (username ?? '').trim();
    // An X handle still links to x.com/<handle>, but the LABEL prefers the display name (#340).
    if (name.startsWith('@')) {
        return { kind: 'x', handle: name.slice(1), label: dn || name };
    }
    if (dn) {
        return { kind: 'name', label: dn };
    }
    if (name) {
        return { kind: 'name', label: name };
    }
    if (address) {
        return { kind: 'wallet', address, label: shortenAddress(address) };
    }
    return { kind: 'name', label: '' };
}
