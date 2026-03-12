'use client';

import { useEffect, useRef, useState } from 'react';

interface RankHistoryResult {
    improved: boolean;
    previousRank: number | null;
}

export function useRankHistory(
    address: string | undefined,
    currentRank: number | undefined
): RankHistoryResult {
    const [result, setResult] = useState<RankHistoryResult>({
        improved: false,
        previousRank: null,
    });
    const didRun = useRef(false);

    useEffect(() => {
        if (!address || currentRank == null || didRun.current) return;
        didRun.current = true;

        const key = `leaderboard:lastRank:${address.toLowerCase()}`;
        const stored = localStorage.getItem(key);
        const previousRank = stored ? parseInt(stored, 10) : null;

        // Write current rank back regardless
        localStorage.setItem(key, String(currentRank));

        if (previousRank !== null && currentRank < previousRank) {
            setResult({ improved: true, previousRank });
        }
    }, [address, currentRank]);

    return result;
}
