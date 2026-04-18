const STORAGE_PREFIX = 'takeSeat:lastBuyIn:';

const keyFor = (tableId: string): string => `${STORAGE_PREFIX}${tableId}`;

export function readLastBuyIn(tableId: string | null | undefined): number | null {
    if (!tableId || typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(keyFor(tableId));
        if (!raw) return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } catch {
        return null;
    }
}

export function writeLastBuyIn(
    tableId: string | null | undefined,
    chips: number
): void {
    if (!tableId || typeof window === 'undefined') return;
    if (!Number.isFinite(chips) || chips <= 0) return;
    try {
        window.localStorage.setItem(keyFor(tableId), String(Math.round(chips)));
    } catch {
        // ignore storage failures (quota, private mode)
    }
}
