'use client';

import { useMomentDetector } from './useMomentDetector';

interface RankHistoryResult {
    improved: boolean;
    previousRank: number | null;
}

// Rank-up detection, now a thin wrapper over the generalized `useMomentDetector` (Viral §5 / #358).
// Same semantics (fires when the rank number decreases). The snapshot key gains the shared
// `moment:last:` prefix, so the very first load after this ships re-seeds the snapshot once (no
// false positive — a moment never fires without a prior snapshot).
export function useRankHistory(
    address: string | undefined,
    currentRank: number | undefined,
    // Namespace the seen-marker per surface so two surfaces (leaderboard + profile hub)
    // each get their own fire-once climb detection instead of the first to mount
    // consuming it for both.
    keyPrefix = 'leaderboard'
): RankHistoryResult {
    const { triggered, previous } = useMomentDetector({
        storageKey: address ? `${keyPrefix}:rank:${address.toLowerCase()}` : undefined,
        value: currentRank,
        trigger: (prev, curr) => curr < prev,
    });
    return { improved: triggered, previousRank: previous };
}
