import type { Tournament } from '../../hooks/server_actions';

// Hook-free subset of tournamentFormat.ts. Split out so server components (the
// tournament OG image route, share metadata) can import the formatting logic
// without pulling in React hooks and forcing a "use client" boundary.

// Tournament money is stored as 6-decimal micro-USDC integers. Cash blinds use a
// different scale (chips), so these helpers live apart from types.ts on purpose.
const MICRO = 1_000_000;

export function formatUsdc(
    micro: number,
    opts: { decimals?: number } = {}
): string {
    const value = (micro ?? 0) / MICRO;
    const decimals = opts.decimals ?? (Number.isInteger(value) ? 0 : 2);
    // Pin to en-US so the grouping separator is identical on the server and the
    // client (these amounts render in SSR'd tournament cards; a locale-derived
    // "1,000" vs "1.000" would otherwise hydrate-mismatch). USDC is a USD value,
    // so en-US grouping is the right house style everywhere anyway.
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

// Below $5 we always show cents so a tiny pool never reads as a flat "$0"; at or
// above, whole dollars keep the number compact. Shared so every scoreboard tile
// and money line uses the same cutoff (MoneyHero, the prize-pool tile, etc.).
const SMALL_USDC_THRESHOLD = 5_000_000;

export function formatUsdcAuto(micro: number): string {
    return formatUsdc(micro, {
        decimals: (micro ?? 0) < SMALL_USDC_THRESHOLD ? 2 : 0,
    });
}

// Amounts at or above this (in dollars) get abbreviated so a hero prize display
// never overflows a narrow card. Below it, exact cents are shown.
const COMPACT_USDC_THRESHOLD = 100_000;

export function isLargeUsdc(micro: number): boolean {
    return (micro ?? 0) / MICRO >= COMPACT_USDC_THRESHOLD;
}

// Compact display for hero prize numbers: "$120k", "$1.2M". Returns the exact
// formatUsdc string for anything below the threshold.
export function formatUsdcCompact(micro: number): string {
    const value = (micro ?? 0) / MICRO;
    if (value >= 1_000_000) {
        return `${(value / 1_000_000)
            .toLocaleString('en-US', { maximumFractionDigits: 2 })
            .replace(/\.0+$/, '')}M`;
    }
    if (value >= COMPACT_USDC_THRESHOLD) {
        return `${(value / 1_000)
            .toLocaleString('en-US', { maximumFractionDigits: 1 })
            .replace(/\.0$/, '')}k`;
    }
    return formatUsdc(micro);
}

export function isFreePlay(t: Tournament): boolean {
    return (t.buy_in_usdc ?? 0) === 0;
}

export interface TournamentMoneyDisplay {
    label: string;
    value: string;
    usdc: boolean;
    suffix?: string;
    // The entry buy-in, surfaced as a secondary line only when the hero value is a
    // pool/guarantee (so it isn't a redundant echo of the hero). Undefined for the
    // buy-in hero itself and for Free Play.
    buyIn?: string;
}

// Lead with the prize pool / guarantee, then the buy-in — same precedence used
// by TournamentLobbyCard, shared here so the OG image and metadata description
// agree with what the card itself shows.
export function getTournamentMoney(t: Tournament): TournamentMoneyDisplay {
    if (isFreePlay(t)) return { label: 'Entry', value: 'Free', usdc: false };
    const buyIn =
        t.buy_in_usdc > 0 ? `$${formatUsdc(t.buy_in_usdc)}` : undefined;
    if (t.guarantee_usdc > 0) {
        return {
            label: 'Guaranteed pool',
            value: `$${formatUsdc(t.guarantee_usdc, { decimals: t.guarantee_usdc < 5_000_000 ? 2 : 0 })}`,
            suffix: 'GTD',
            usdc: true,
            buyIn,
        };
    }
    if (t.prize_pool_usdc > 0) {
        return {
            label: 'Prize pool',
            value: `$${formatUsdc(t.prize_pool_usdc, { decimals: t.prize_pool_usdc < 5_000_000 ? 2 : 0 })}`,
            usdc: true,
            buyIn,
        };
    }
    return {
        label: 'Buy-in',
        value: `$${formatUsdc(t.buy_in_usdc)}`,
        usdc: true,
    };
}

// Entry/registration count line shared by the OG card and share metadata so they
// never disagree. While registration is open we show progress toward the cap
// ("47 / 200 registered"); once running/finished the cap is irrelevant, so we show
// the plain field size ("1,342 entries") rather than a misleading "1342 / 100".
export function getEntriesLine(t: Tournament): string {
    const count = t.registered_count ?? 0;
    const showProgress =
        (t.status === 'registration' || t.status === 'pending') &&
        t.max_entries > 0;
    if (showProgress) {
        return `${count.toLocaleString('en-US')} / ${t.max_entries.toLocaleString('en-US')} registered`;
    }
    return `${count.toLocaleString('en-US')} ${count === 1 ? 'entry' : 'entries'}`;
}

export function formatTournamentStart(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export function formatCountdown(diffMs: number): string {
    if (diffMs <= 0) return 'now';
    const totalMinutes = Math.floor(diffMs / 60_000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'under a minute';
}

export type StatusTone =
    | 'open'
    | 'live'
    | 'done'
    | 'cancelled'
    | 'setup'
    | 'refund';

// Recreational-friendly labels for the backend's free-form status string.
export function getStatusDescriptor(status: string): {
    label: string;
    tone: StatusTone;
} {
    switch (status) {
        case 'registration':
            return { label: 'Registering', tone: 'open' };
        case 'running':
            return { label: 'Live', tone: 'live' };
        case 'completed':
            return { label: 'Final', tone: 'done' };
        case 'cancelled':
            return { label: 'Cancelled', tone: 'cancelled' };
        case 'pending':
            return { label: 'Not open yet', tone: 'setup' };
        case 'emergency_refund':
            return { label: 'Refunds open', tone: 'refund' };
        default: {
            // Unmapped backend status: humanize it so a raw token like
            // "seating_break" never leaks onto a public share card as "Seating_break".
            const words = status ? status.replace(/_/g, ' ').trim() : '';
            return {
                label: words
                    ? words[0].toUpperCase() + words.slice(1)
                    : 'Unknown',
                tone: 'setup',
            };
        }
    }
}

// Finishing-position ordinal: 1 → "1st", 2 → "2nd", 11 → "11th".
export function ordinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

// Block-explorer origin for a tournament's chain (mainnet vs Sepolia testnet).
export function explorerBase(chain?: string): string {
    return chain === 'base'
        ? 'https://basescan.org'
        : 'https://sepolia.basescan.org';
}
