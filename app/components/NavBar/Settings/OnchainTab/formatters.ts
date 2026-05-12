const USDC_DECIMALS = 6;
export const CHIPS_PER_USDC = 100;

export function formatUsdc(
    micro: bigint | null | undefined,
    fractionDigits: number = 2
): string {
    if (micro === null || micro === undefined) return '0.00';
    const value = Number(micro) / 10 ** USDC_DECIMALS;
    return value.toLocaleString('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

export function formatChips(chips: bigint | null | undefined): string {
    if (chips === null || chips === undefined) return '0';
    return Number(chips).toLocaleString('en-US');
}

export function chipsToUsdc(chips: bigint): bigint {
    return chips * BigInt(10_000);
}

export function truncateAddress(addr: string | undefined | null): string {
    if (!addr) return '';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function truncateHash(hash: string | undefined | null): string {
    if (!hash) return '';
    if (hash.length <= 14) return hash;
    return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 30, unit: 'day' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

const relTimeFormat =
    typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl
        ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
        : null;

export function formatRelativeTime(targetMs: number, nowMs: number = Date.now()): string {
    const diffSeconds = (targetMs - nowMs) / 1000;
    let duration = diffSeconds;
    for (const div of RELATIVE_DIVISIONS) {
        if (Math.abs(duration) < div.amount) {
            if (relTimeFormat) {
                return relTimeFormat.format(Math.round(duration), div.unit);
            }
            return `${Math.round(duration)} ${div.unit}s`;
        }
        duration /= div.amount;
    }
    return '';
}

export function formatDuration(seconds: number): string {
    if (seconds <= 0) return '0s';
    const days = Math.floor(seconds / 86_400);
    const hours = Math.floor((seconds % 86_400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}
