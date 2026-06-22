const STORAGE_KEY = 'takeSeat:lastUsername';
export const USERNAME_MAX_LENGTH = 9;

// The @ prefix is reserved for linked X handles, so it is never a value we want
// to remember or prefill back into the free-text username field.
const isReserved = (name: string): boolean => name.startsWith('@');

export function readLastUsername(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const trimmed = raw.trim();
        if (!trimmed || isReserved(trimmed)) return null;
        return trimmed.slice(0, USERNAME_MAX_LENGTH);
    } catch {
        return null;
    }
}

export function writeLastUsername(name: string): void {
    if (typeof window === 'undefined') return;
    const trimmed = name.trim();
    if (!trimmed || isReserved(trimmed)) return;
    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            trimmed.slice(0, USERNAME_MAX_LENGTH)
        );
    } catch {
        // ignore storage failures (quota, private mode)
    }
}
