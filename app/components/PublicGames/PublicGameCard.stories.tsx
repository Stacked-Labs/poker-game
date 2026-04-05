import type { Meta, StoryObj } from '@storybook/react';
import PublicGameCard from './PublicGameCard';
import type { PublicGame } from './types';

const makePublicGame = (overrides?: Partial<PublicGame>): PublicGame => ({
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
    argTypes: {
        variant: {
            control: 'radio',
            options: ['compact', 'featured'],
        },
    },
} satisfies Meta<typeof PublicGameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { game: makePublicGame(), variant: 'compact' },
};

export const FeaturedVariant: Story = {
    args: {
        game: makePublicGame({ player_count: 8, spectator_count: 5 }),
        variant: 'featured',
    },
};

export const CryptoGame: Story = {
    args: {
        game: makePublicGame({
            name: 'base-high-rollers',
            is_crypto: true,
            small_blind: 25,
            big_blind: 50,
            player_count: 6,
            spectator_count: 4,
        }),
        variant: 'compact',
    },
};

export const CryptoFeatured: Story = {
    args: {
        game: makePublicGame({
            name: 'base-high-rollers',
            is_crypto: true,
            small_blind: 25,
            big_blind: 50,
            player_count: 7,
            spectator_count: 8,
        }),
        variant: 'featured',
    },
};

export const NearlyFull: Story = {
    args: {
        game: makePublicGame({
            name: 'last-seat-saloon',
            player_count: 8,
            max_players: 9,
            spectator_count: 6,
        }),
        variant: 'compact',
    },
};

export const HotTable: Story = {
    args: {
        game: makePublicGame({
            name: 'whale-watch',
            player_count: 5,
            spectator_count: 12,
        }),
        variant: 'compact',
    },
};

export const NewTable: Story = {
    args: {
        game: makePublicGame({
            name: 'just-opened',
            player_count: 1,
            spectator_count: 0,
            is_active: false,
            created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        }),
        variant: 'compact',
    },
};

export const WaitingTable: Story = {
    args: {
        game: makePublicGame({
            name: 'waiting-for-players',
            player_count: 2,
            is_active: false,
            spectator_count: 0,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        }),
        variant: 'compact',
    },
};

export const FullTable: Story = {
    args: {
        game: makePublicGame({
            name: 'no-room-inn',
            player_count: 9,
            max_players: 9,
            spectator_count: 3,
        }),
        variant: 'compact',
    },
};
