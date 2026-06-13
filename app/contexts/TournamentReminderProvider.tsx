'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
    getMyTournamentRegistrations,
    listTournaments,
    type Tournament,
} from '../hooks/server_actions';
import { useTournamentReminderStore } from '../stores/tournamentReminders';

/**
 * Seeds and keeps the tournament-reminder store fresh for the signed-in player.
 * No UI of its own. Polls the player's registrations on an adaptive cadence
 * (relaxed when nothing is close, tightening as the nearest start approaches)
 * so the felt-strip banner has accurate countdowns without a lobby socket.
 */
export function TournamentReminderProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { isAuthenticated, userAddress } = useAuth();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancelledRef = useRef(false);

    useEffect(() => {
        const store = useTournamentReminderStore.getState();

        // Logged out: drop everything and stop polling.
        if (!isAuthenticated || !userAddress) {
            store.clear();
            return;
        }

        cancelledRef.current = false;
        store.loadDismissals(userAddress);

        const clearTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const fetchAndApply = async () => {
            const { tournament_ids } = await getMyTournamentRegistrations();
            if (cancelledRef.current) return;

            // A malformed/partial response (no array) is NOT "zero registrations":
            // keep the current banner rather than wiping it on a bad payload.
            if (!Array.isArray(tournament_ids)) return;

            if (tournament_ids.length === 0) {
                useTournamentReminderStore
                    .getState()
                    .updateRegistrations([], {});
                return;
            }

            const { tournaments } = await listTournaments();
            if (cancelledRef.current) return;

            const byId: Record<number, Tournament | undefined> = {};
            for (const t of tournaments) byId[t.id] = t;

            useTournamentReminderStore
                .getState()
                .updateRegistrations(tournament_ids, byId);
        };

        const doPoll = async () => {
            try {
                await fetchAndApply();
            } catch {
                // Fail quiet: a missed poll just keeps the last good state. The
                // next tick re-arms below regardless.
            }

            if (cancelledRef.current) return;
            // Re-arm with the freshest interval so the cadence tightens as the
            // nearest deadline approaches.
            const next = useTournamentReminderStore
                .getState()
                .adaptPollInterval();
            clearTimer();
            timerRef.current = setTimeout(doPoll, next);
        };

        doPoll();

        return () => {
            cancelledRef.current = true;
            clearTimer();
        };
    }, [isAuthenticated, userAddress]);

    return <>{children}</>;
}

export default TournamentReminderProvider;
