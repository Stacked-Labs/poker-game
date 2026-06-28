// Compact relative time ("just now", "5m", "3h", "2d", "3w", "4mo", "1y") for activity
// ledgers. Pair with the absolute timestamp in a title/tooltip for precision.
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const sec = Math.max(0, Math.round((now - then) / 1000));
    if (sec < 45) return 'just now';
    const min = Math.round(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.round(hr / 24);
    if (day < 7) return `${day}d`;
    const wk = Math.round(day / 7);
    if (wk < 5) return `${wk}w`;
    const mo = Math.round(day / 30);
    if (mo < 12) return `${mo}mo`;
    return `${Math.round(day / 365)}y`;
}

export function absoluteTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
