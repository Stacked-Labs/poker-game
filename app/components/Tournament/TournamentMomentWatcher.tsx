'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import MomentCelebration from '@/app/components/Moments/MomentCelebration';
import type { MomentParams } from '@/app/lib/moments';

// Detects the live event Share Moments (Viral §5 / #358) at a tournament table: winning the
// tournament and making a deep run / final table. Unlike the status moments (snapshot-on-load),
// these change live during play, so each uses a within-session fire-once guard backed by
// localStorage — a deep run can't re-fire as the field shrinks toward heads-up, and a reload
// mid-final-table won't replay it.

const FINAL_TABLE_SIZE = 9;

function alreadyFired(key: string): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(key) === '1';
}
function markFired(key: string) {
    if (typeof window !== 'undefined') localStorage.setItem(key, '1');
}

export default function TournamentMomentWatcher({ tournamentId }: { tournamentId: number }) {
    const { appState } = useContext(AppContext);
    const live = appState.tournamentLive;
    const address = appState.address?.toLowerCase();
    const [moment, setMoment] = useState<MomentParams | null>(null);

    const meta = live?.meta ?? null;
    const playersActive = live?.playersActive ?? null;
    const myResult = live?.myResult ?? null;
    const fieldSize = (live?.leaderboard.length || meta?.registeredCount) ?? 0;

    // Am I still alive in this tournament? (finish_pos 0 = not yet busted)
    const myRow = live?.leaderboard.find(
        (p) =>
            (address && p.wallet?.toLowerCase() === address) ||
            p.uuid === appState.clientID
    );
    const iAmAlive = !myRow || myRow.finish_pos === 0;

    // Won the tournament.
    useEffect(() => {
        if (!address || myResult?.kind !== 'win') return;
        const key = `moment:done:win:${address}:${tournamentId}`;
        if (alreadyFired(key)) return;
        markFired(key);
        setMoment({
            type: 'win',
            address,
            tournamentId,
            tournamentName: meta?.name,
            fieldSize: fieldSize || undefined,
            position: 1,
            isFreePlay: meta?.isFreePlay,
        });
    }, [address, myResult, tournamentId, meta?.name, meta?.isFreePlay, fieldSize]);

    // Deep run — the field has shrunk to the final table while I'm still in it. Only celebrate when
    // the tournament actually had more than a final table to begin with.
    useEffect(() => {
        if (!address || playersActive == null || !iAmAlive) return;
        // The leaderboard's finish_pos only refreshes on the 15s poll, but playersActive updates
        // instantly on each elimination — so a just-busted 10th-place finisher can briefly read
        // iAmAlive=true with playersActive=9. The authoritative bust signal closes that window.
        if (myResult?.kind === 'bust') return;
        // Field-size gate: skip if the event never had more than a final table. Use the derived
        // fieldSize (leaderboard length, falling back to registeredCount) rather than
        // registeredCount alone — when registered_count is absent it is 0, and `0 <= 9` would
        // otherwise silently eat a legit deep run in a full event.
        if (fieldSize && fieldSize <= FINAL_TABLE_SIZE) return;
        if (playersActive > FINAL_TABLE_SIZE) return;
        const key = `moment:done:deeprun:${address}:${tournamentId}`;
        if (alreadyFired(key)) return;
        markFired(key);
        setMoment((prev) =>
            prev?.type === 'win'
                ? prev // a win outranks a deep run — don't overwrite
                : {
                      type: 'deeprun',
                      address,
                      tournamentId,
                      tournamentName: meta?.name,
                      fieldSize: fieldSize || undefined,
                      isFreePlay: meta?.isFreePlay,
                  }
        );
    }, [address, playersActive, iAmAlive, myResult, tournamentId, meta, fieldSize]);

    return <MomentCelebration moment={moment} />;
}
