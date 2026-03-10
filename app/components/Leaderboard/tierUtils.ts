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
