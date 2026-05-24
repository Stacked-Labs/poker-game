// Fixture data for the PublicGames Storybook stories. Spans every state
// (hot full table, empty, just-opened, free play, varied stakes) so each
// component renders against a realistic lobby in isolation.

import type { PublicGame } from './types';

const minutesAgo = (m: number) =>
    new Date(Date.now() - m * 60 * 1000).toISOString();

const make = (
    name: string,
    overrides: Partial<PublicGame> = {}
): PublicGame => ({
    name,
    small_blind: 10,
    big_blind: 20,
    is_crypto: false,
    player_count: 4,
    spectator_count: 0,
    max_players: 9,
    is_active: true,
    created_at: minutesAgo(60),
    ...overrides,
});

// A mix designed to show off every state: hot crypto tables, mid + micro
// stakes, free play, an empty table, a freshly-opened one, and a full one.
// Blinds for crypto tables are in chip units (100 chips = $1 USDC).
export const MOCK_GAMES: PublicGame[] = [
    make('high-roller-vault', {
        is_crypto: true,
        chain: 'Base',
        small_blind: 200,
        big_blind: 500,
        player_count: 6,
        max_players: 6,
        spectator_count: 14,
        contract_address: '0xfa04e1d9c8b3f1b0b8e01a25c9d4568b0c2c445b',
        created_at: minutesAgo(95),
    }),
    make('sunday-grinders', {
        is_crypto: true,
        chain: 'Base',
        small_blind: 100,
        big_blind: 200,
        player_count: 7,
        max_players: 9,
        spectator_count: 12,
        contract_address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98',
        created_at: minutesAgo(40),
    }),
    make('late-night-degen', {
        is_crypto: true,
        chain: 'Base',
        small_blind: 50,
        big_blind: 100,
        player_count: 8,
        max_players: 9,
        spectator_count: 7,
        contract_address: '0xabc123def456789012345678901234567890abcd',
        created_at: minutesAgo(22),
    }),
    make('penny-pushers', {
        is_crypto: true,
        chain: 'Base',
        small_blind: 10,
        big_blind: 25,
        player_count: 3,
        max_players: 6,
        spectator_count: 1,
        contract_address: '0x1234567890abcdef1234567890abcdef12345678',
        created_at: minutesAgo(8),
    }),
    make('friday-night-poker', {
        small_blind: 25,
        big_blind: 50,
        player_count: 5,
        max_players: 9,
        spectator_count: 2,
        created_at: minutesAgo(75),
    }),
    make('whales-only', {
        is_crypto: true,
        chain: 'Base',
        small_blind: 500,
        big_blind: 1000,
        player_count: 4,
        max_players: 6,
        spectator_count: 22,
        contract_address: '0xdeadbeef00112233445566778899aabbccddeeff',
        created_at: minutesAgo(120),
    }),
    make('home-game-friday', {
        small_blind: 5,
        big_blind: 10,
        player_count: 2,
        max_players: 6,
        is_active: false,
        created_at: minutesAgo(15),
    }),
    make('just-opened-degen', {
        is_crypto: true,
        chain: 'Base Sepolia',
        small_blind: 25,
        big_blind: 50,
        player_count: 1,
        max_players: 9,
        is_active: false,
        contract_address: '0x0ab1bd9d3c5b7e6f1234567890abcdef12345678',
        created_at: minutesAgo(2),
    }),
    make('practice-table', {
        small_blind: 5,
        big_blind: 10,
        player_count: 0,
        max_players: 6,
        is_active: false,
        created_at: minutesAgo(200),
    }),
];
