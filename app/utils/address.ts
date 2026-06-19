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

// True when `name` is itself a pre-shortened form of `address`. The backend hands
// some surfaces a wallet as the display name — tournament players without a linked
// X handle, and any spectator (poker-server Client.GetDisplayName → ShortWallet,
// "0x1a2b...3c4d"). Detect that (either ellipsis style) by matching the visible
// head/tail against the full address, so we can re-shorten it our way and link it.
function isShortenedWalletOf(name: string, address?: string | null): boolean {
    if (!address || !name.toLowerCase().startsWith('0x')) return false;
    const sep = name.includes('…') ? '…' : name.includes('...') ? '...' : '';
    if (!sep) return false;
    const [head, tail] = name.split(sep);
    if (!head || !tail) return false;
    const a = address.toLowerCase();
    return a.startsWith(head.toLowerCase()) && a.endsWith(tail.toLowerCase());
}

// The label to show for a player/author given the backend's display name and full
// wallet. Real identities — @handles and chosen nicknames — pass through untouched;
// a bare wallet (or a name the backend already shortened) renders as our canonical
// short form. The full `address` is kept by callers for explorer links.
export function playerDisplayName(
    username?: string | null,
    address?: string | null
): string {
    const name = (username ?? '').trim();
    if (name && !isShortenedWalletOf(name, address)) return name;
    if (address) return shortenAddress(address);
    return name;
}

// Classifies a player's identity so callers can both label and link it: an X
// handle links to the profile, a wallet (bare or backend-shortened) links to the
// block explorer, and a chosen nickname links nowhere. Pure — URL building lives
// in the link layer so this stays free of chain/explorer config.
export type PlayerIdentity =
    | { kind: 'x'; handle: string; label: string }
    | { kind: 'wallet'; address: string; label: string }
    | { kind: 'name'; label: string };

export function resolvePlayerIdentity(
    username?: string | null,
    address?: string | null
): PlayerIdentity {
    const name = (username ?? '').trim();
    if (name.startsWith('@')) {
        return { kind: 'x', handle: name.slice(1), label: name };
    }
    const label = playerDisplayName(username, address);
    if (address && label === shortenAddress(address)) {
        return { kind: 'wallet', address, label };
    }
    return { kind: 'name', label };
}
