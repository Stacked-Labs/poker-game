import type { IconType } from 'react-icons';
import { FaGem, FaCrown, FaAward, FaBolt } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';

export type Tier = {
    name: string;
    color: string;
    label: string;
};

export function getTier(rank: number, total: number): Tier {
    if (total === 0) return { name: 'iron', color: '#9CA3AF', label: 'Iron' };
    // Guarantee at least 1 Diamond, 1 Gold, 1 Silver, 1 Bronze regardless of total
    const diamondCut = Math.max(1, Math.ceil(total * 0.05));
    const goldCut    = Math.max(2, Math.ceil(total * 0.15));
    const silverCut  = Math.max(3, Math.ceil(total * 0.30));
    const bronzeCut  = Math.max(4, Math.ceil(total * 0.50));
    if (rank <= diamondCut) return { name: 'diamond', color: '#A78BFA', label: 'Diamond' };
    if (rank <= goldCut)    return { name: 'gold',    color: '#FFD700', label: 'Gold' };
    if (rank <= silverCut)  return { name: 'silver',  color: '#C0C0C0', label: 'Silver' };
    if (rank <= bronzeCut)  return { name: 'bronze',  color: '#CD7F32', label: 'Bronze' };
    return { name: 'iron', color: '#9CA3AF', label: 'Iron' };
}

export const TIER_EMOJI: Record<string, string> = {
    diamond: '💎',
    gold:    '⭐',
    silver:  '🥈',
    bronze:  '🥉',
    iron:    '🔩',
};

// The on-brand tier mark: a react-icon in the tier's semantic color, used across the
// leaderboard PlayerCard, search, and profile so the surfaces share one visual language
// (never the TIER_EMOJI glyphs, which render differently per platform).
export const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    gold:    FaCrown,
    silver:  FaMedal,
    bronze:  FaAward,
    iron:    FaBolt,
};

const TIER_LABEL: Record<string, string> = {
    diamond: 'Diamond',
    gold:    'Gold',
    silver:  'Silver',
    bronze:  'Bronze',
    iron:    'Iron',
};

export interface TierInfo {
    name: string;
    /** Semantic color token (`tier.diamond` … `tier.iron`) — steel-blue diamond, not the stale lavender. */
    token: string;
    icon: IconType;
    label: string;
}

// The profile/search payloads send `tier` as a string with no `total`, so getTier(rank, total)
// can't be used. Resolve the string to its semantic color token + icon directly. Color comes
// from the `tier.*` tokens, never getTier().color (which still returns the off-brand lavender).
// An empty/unknown tier resolves to "Unranked" (neutral) — NEVER silently demoted to Iron,
// which on a status surface would read as a real rank.
export function tierFromString(tier: string | null | undefined): TierInfo {
    const raw = (tier ?? '').toLowerCase();
    if (!TIER_ICON[raw]) {
        return {
            name: 'unranked',
            token: 'text.muted',
            icon: FaBolt,
            label: 'Unranked',
        };
    }
    return {
        name: raw,
        token: `tier.${raw}`,
        icon: TIER_ICON[raw],
        label: TIER_LABEL[raw],
    };
}
