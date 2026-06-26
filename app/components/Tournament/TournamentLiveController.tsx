'use client';

import { useTournamentLive } from '../../hooks/useTournamentLive';
import TournamentResultModal from './TournamentResultModal';
import TournamentTableMoveWatcher from './TournamentTableMoveWatcher';
import TournamentMomentWatcher from './TournamentMomentWatcher';

/**
 * Mounted at a tournament table. Drives the live-tournament state slice (clock,
 * players-left, feed, leaderboard) that the watermark, banner and result
 * overlays read, and renders the local-player result card + table-move
 * transition. Renders no felt chrome itself.
 */
export default function TournamentLiveController({
    tournamentId,
    tableNumber,
}: {
    tournamentId: number;
    tableNumber: number;
}) {
    useTournamentLive(tournamentId);
    return (
        <>
            <TournamentResultModal tournamentId={tournamentId} />
            <TournamentMomentWatcher tournamentId={tournamentId} />
            <TournamentTableMoveWatcher
                tournamentId={tournamentId}
                currentTableNumber={tableNumber}
            />
        </>
    );
}
