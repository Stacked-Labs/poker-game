import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import PublicGameCard from './PublicGameCard';
import type { PublicGame } from './types';

const makeGame = (overrides?: Partial<PublicGame>): PublicGame => ({
    name: 'friday-night-poker',
    small_blind: 10,
    big_blind: 20,
    is_crypto: false,
    player_count: 4,
    spectator_count: 2,
    max_players: 9,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ...overrides,
});

const meta = {
    title: 'PublicGames/PublicGameCard',
    component: PublicGameCard,
    tags: ['autodocs'],
    parameters: {
        nextjs: { appDirectory: true },
    },
    decorators: [
        (Story) => (
            <Box bg="card.white" borderRadius="20px" boxShadow="card.lift" maxW="900px">
                <Story />
            </Box>
        ),
    ],
    args: {
        ruleColor: 'rgba(11, 20, 48, 0.06)',
        isLast: true,
    },
} satisfies Meta<typeof PublicGameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreePlay: Story = {
    args: { game: makeGame() },
};

export const CryptoMicro: Story = {
    args: {
        game: makeGame({
            name: 'penny-pushers',
            is_crypto: true,
            small_blind: 10,
            big_blind: 25,
            player_count: 3,
            max_players: 6,
            spectator_count: 1,
            contract_address: '0x1234567890abcdef1234567890abcdef12345678',
        }),
    },
};

export const CryptoMid: Story = {
    args: {
        game: makeGame({
            name: 'sunday-grinders',
            is_crypto: true,
            small_blind: 100,
            big_blind: 200,
            player_count: 5,
            max_players: 9,
            spectator_count: 12,
            contract_address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98',
        }),
    },
};

export const CryptoHigh: Story = {
    args: {
        game: makeGame({
            name: 'whales-only',
            is_crypto: true,
            small_blind: 500,
            big_blind: 1000,
            player_count: 4,
            max_players: 6,
            spectator_count: 22,
            contract_address: '0xdeadbeef00112233445566778899aabbccddeeff',
        }),
    },
};

export const HotNearlyFull: Story = {
    args: {
        game: makeGame({
            name: 'last-seat-saloon',
            is_crypto: true,
            small_blind: 50,
            big_blind: 100,
            player_count: 8,
            max_players: 9,
            spectator_count: 7,
            contract_address: '0xabc123def456789012345678901234567890abcd',
        }),
    },
};

export const FullTable: Story = {
    args: {
        game: makeGame({
            name: 'no-room-inn',
            is_crypto: true,
            small_blind: 200,
            big_blind: 500,
            player_count: 6,
            max_players: 6,
            spectator_count: 4,
            contract_address: '0xfa04e1d9c8b3f1b0b8e01a25c9d4568b0c2c445b',
        }),
    },
};

export const WaitingForPlayers: Story = {
    args: {
        game: makeGame({
            name: 'waiting-for-players',
            player_count: 2,
            spectator_count: 0,
            is_active: false,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        }),
    },
};

export const JustOpened: Story = {
    args: {
        game: makeGame({
            name: 'just-opened',
            player_count: 1,
            spectator_count: 0,
            is_active: false,
            created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        }),
    },
};
