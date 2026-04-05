import type { Meta, StoryObj } from '@storybook/react';
import GameBadges from './GameBadges';
import type { PublicGame } from './types';

const makeGame = (overrides?: Partial<PublicGame>): PublicGame => ({
    name: 'test-table',
    small_blind: 10,
    big_blind: 20,
    is_crypto: false,
    player_count: 4,
    spectator_count: 0,
    max_players: 9,
    is_active: true,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ...overrides,
});

const meta = {
    title: 'PublicGames/GameBadges',
    component: GameBadges,
    tags: ['autodocs'],
} satisfies Meta<typeof GameBadges>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoBadges: Story = { args: { game: makeGame() } };

export const OneSeatLeft: Story = {
    args: { game: makeGame({ player_count: 8, max_players: 9 }) },
};

export const HotTable: Story = {
    args: { game: makeGame({ spectator_count: 5, player_count: 3 }) },
};

export const NewTable: Story = {
    args: { game: makeGame({ created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() }) },
};

export const AllBadges: Story = {
    args: {
        game: makeGame({
            player_count: 8,
            max_players: 9,
            spectator_count: 5,
            created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        }),
    },
};
