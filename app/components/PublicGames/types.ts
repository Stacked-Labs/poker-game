export interface PublicGame {
    name: string;
    small_blind: number;
    big_blind: number;
    is_crypto: boolean;
    player_count: number;
    spectator_count: number;
    max_players: number;
    is_active: boolean;
    created_at: string;
    contract_address?: string;
}

export const BASESCAN_URL = 'https://basescan.org/address';

export function truncateAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const PAGE_SIZE = 20;

export const statusStyles = {
    Active: {
        badgeBg: 'brand.green',
        badgeColor: 'white',
        dotBg: 'brand.green',
        dotShadow: '0 0 10px rgba(54, 163, 123, 0.6)',
    },
    Open: {
        badgeBg: 'brand.yellow',
        badgeColor: 'brand.darkNavy',
        dotBg: 'brand.yellow',
        dotShadow: '0 0 8px rgba(253, 197, 29, 0.5)',
    },
};

export const getStatusStyle = (status: string | boolean) => {
    if (typeof status === 'boolean') {
        return status ? statusStyles.Active : statusStyles.Open;
    }
    return statusStyles[status as keyof typeof statusStyles] ?? statusStyles.Open;
};

export const formatUsdc = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safeValue);
};

export const sortKeyToParam = (key: 'table' | 'blinds' | 'seats' | null) => {
    if (key === 'table') return 'name';
    if (key === 'blinds') return 'big_blind';
    if (key === 'seats') return 'players';
    return undefined;
};

export type FilterValue = 'all' | 'crypto' | 'free';
export type SortKey = 'table' | 'blinds' | 'seats';
export type SortConfig = { key: SortKey | null; direction: 'asc' | 'desc' };
