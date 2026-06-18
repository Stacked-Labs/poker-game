'use client';

import { useEffect, useState } from 'react';
import { listTournaments, type Tournament } from '../../hooks/server_actions';

// Tournaments worth showing on the broadcast: open for registration or already
// playing. Completed/cancelled are dropped. Live events sort first, then the
// soonest upcoming — so the billboard always leads with the most relevant action.
const SHOWCASE_STATUSES = new Set([
    'registration',
    'late_registration',
    'pending',
    'running',
]);

const LIVE_STATUSES = new Set(['running', 'late_registration']);

function rank(t: Tournament): number {
    return LIVE_STATUSES.has(t.status) ? 0 : 1;
}

// The stream runs for hours; re-poll so a freshly scheduled or just-started
// tournament appears without a reload. Kept long — the billboard isn't a clock.
const REFRESH_MS = 60_000;

export interface ShowcaseTournaments {
    tournaments: Tournament[];
    loaded: boolean;
}

// Real tournament data only — never fabricated. When the list is empty the scene
// falls back to the brand value-prop (no invented events/numbers), per the
// "never show fake game data" rule.
export function useShowcaseTournaments(limit = 3): ShowcaseTournaments {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const data = await listTournaments();
                if (cancelled) return;
                const open = (data?.tournaments ?? [])
                    .filter((t) => SHOWCASE_STATUSES.has(t.status))
                    .sort((a, b) => {
                        const r = rank(a) - rank(b);
                        if (r !== 0) return r;
                        return (
                            new Date(a.scheduled_start_at).getTime() -
                            new Date(b.scheduled_start_at).getTime()
                        );
                    })
                    .slice(0, limit);
                setTournaments(open);
            } catch {
                // Leave the last good list in place; the scene handles empty.
            } finally {
                if (!cancelled) setLoaded(true);
            }
        };

        load();
        const id = setInterval(load, REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [limit]);

    return { tournaments, loaded };
}
