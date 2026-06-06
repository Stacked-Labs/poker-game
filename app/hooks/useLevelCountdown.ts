import { useEffect, useState } from 'react';
import type { TournamentClock } from '../interfaces';

export interface LevelCountdown {
    /** True once mounted and ticking (false during SSR / before first tick). */
    ready: boolean;
    remainingMs: number;
    /** mm:ss */
    label: string;
}

function formatMs(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Ticks the current blind level's remaining time down locally between WS pushes.
 * The backend only pushes tournament-clock on level *advance*, so we count down
 * from `receivedAt + remainingMs` and let each push re-sync us.
 */
export function useLevelCountdown(
    clock: TournamentClock | null
): LevelCountdown {
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        if (!clock) {
            setNow(null);
            return;
        }
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [clock]);

    if (!clock) {
        return { ready: false, remainingMs: 0, label: '0:00' };
    }
    if (now === null) {
        // Pre-tick: show the last pushed value so there is no flash of 0:00.
        return {
            ready: false,
            remainingMs: clock.remainingMs,
            label: formatMs(clock.remainingMs),
        };
    }
    const remainingMs = Math.max(0, clock.remainingMs - (now - clock.receivedAt));
    return { ready: true, remainingMs, label: formatMs(remainingMs) };
}
