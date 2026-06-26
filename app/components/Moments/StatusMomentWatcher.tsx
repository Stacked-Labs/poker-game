'use client';

import { useMemo } from 'react';
import { useMomentDetector } from '@/app/hooks/useMomentDetector';
import { getTier } from '@/app/components/Leaderboard/tierUtils';
import MomentCelebration from './MomentCelebration';
import type { MomentParams } from '@/app/lib/moments';

// Detects the status Share Moments (Viral §5 / #358) on the leaderboard / profile: ranked up, new
// tier, and the hands milestone. One celebration at a time — rank-up wins over tier-up wins over a
// milestone (a rank climb usually carries a tier change; we don't stack celebrations).

const HANDS_MILESTONE_STEP = 10_000;
const TIER_INDEX: Record<string, number> = { iron: 0, bronze: 1, silver: 2, gold: 3, diamond: 4 };

export default function StatusMomentWatcher({
    address,
    rank,
    points,
    total,
    handsPlayed,
}: {
    address?: string;
    rank?: number;
    points?: number;
    total?: number;
    handsPlayed?: number;
}) {
    const addr = address?.toLowerCase();
    const tier = rank != null && total != null ? getTier(rank, total) : null;
    const tierIndex = tier ? TIER_INDEX[tier.name] : undefined;

    const rankup = useMomentDetector({
        storageKey: addr ? `rankup:${addr}` : undefined,
        value: rank,
        trigger: (prev, curr) => curr < prev,
    });
    const tierup = useMomentDetector({
        storageKey: addr ? `tier:${addr}` : undefined,
        value: tierIndex,
        trigger: (prev, curr) => curr > prev,
    });
    const milestone = useMomentDetector({
        storageKey: addr ? `hands:${addr}` : undefined,
        value: handsPlayed,
        trigger: (prev, curr) =>
            Math.floor(curr / HANDS_MILESTONE_STEP) > Math.floor(prev / HANDS_MILESTONE_STEP),
    });

    const moment: MomentParams | null = useMemo(() => {
        if (!addr) return null;
        if (rankup.triggered && rank != null) {
            return { type: 'rankup', address: addr, rank, points, total };
        }
        if (tierup.triggered && tier) {
            return { type: 'tierup', address: addr, rank, points, total, tierLabel: tier.label };
        }
        if (milestone.triggered && handsPlayed != null) {
            const reached = Math.floor(handsPlayed / HANDS_MILESTONE_STEP) * HANDS_MILESTONE_STEP;
            return { type: 'milestone', address: addr, rank, points, total, hands: reached };
        }
        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addr, rankup.triggered, tierup.triggered, milestone.triggered, rank, points, total, handsPlayed]);

    return <MomentCelebration moment={moment} />;
}
