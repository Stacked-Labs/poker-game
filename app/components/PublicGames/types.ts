export interface PublicGame {
    name: string;
    small_blind: number;
    big_blind: number;
    is_crypto: boolean;
    chain?: string;
    player_count: number;
    spectator_count: number;
    max_players: number;
    is_active: boolean;
    created_at: string;
    contract_address?: string;
}

// Once a tournament starts, the server spawns tables named
// `tournament-{id}-table-{n}` that show up in /api/public-games alongside cash
// tables. They belong under the Tournaments tab, not the Cash games list, so the
// lobby filters them out. Same convention as WebSocketProvider.tsx / Table.tsx.
const TOURNAMENT_TABLE_RE = /^tournament-(\d+)-table-(\d+)$/;

export function isTournamentTable(name: string): boolean {
    return TOURNAMENT_TABLE_RE.test(name);
}

export const BASESCAN_URL = 'https://basescan.org/address';

export const USDC_BLUE = '#2775CA';
export const USDC_LOGO = '/usdc-logo.png';
export const CHIPS_PER_USDC = 100;

export function truncateAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const PAGE_SIZE = 20;

export type StakeTier = 'micro' | 'mid' | 'high';
export type StakeFilter = 'all' | StakeTier;

export function stakeTier(game: PublicGame): StakeTier | null {
    if (!game.is_crypto) return null;
    const usdBB = game.big_blind / CHIPS_PER_USDC;
    if (usdBB < 0.5) return 'micro';
    if (usdBB < 2) return 'mid';
    return 'high';
}

export function blindsLabel(game: PublicGame): string {
    if (game.is_crypto) {
        const sb = (game.small_blind / CHIPS_PER_USDC).toFixed(2);
        const bb = (game.big_blind / CHIPS_PER_USDC).toFixed(2);
        return `$${sb} / $${bb}`;
    }
    return `${game.small_blind} / ${game.big_blind}`;
}

export function isHot(game: PublicGame): boolean {
    return game.is_active && game.player_count / game.max_players >= 0.7;
}

export const sortKeyToParam = (key: 'table' | 'blinds' | 'seats' | null) => {
    if (key === 'table') return 'name';
    if (key === 'blinds') return 'big_blind';
    if (key === 'seats') return 'players';
    return undefined;
};

export type FilterValue = 'all' | 'crypto' | 'free';
export type SortKey = 'table' | 'blinds' | 'seats';
export type SortConfig = { key: SortKey | null; direction: 'asc' | 'desc' };
