import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PublicGamesGrid from './PublicGamesGrid';
import type { PublicGame, FilterValue, SortKey, SortConfig } from './types';

const makeGame = (name: string, overrides?: Partial<PublicGame>): PublicGame => ({
    name,
    small_blind: 10,
    big_blind: 20,
    is_crypto: false,
    player_count: 4,
    spectator_count: 2,
    max_players: 9,
    is_active: true,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ...overrides,
});

const mixedGames: PublicGame[] = [
    makeGame('high-rollers', { is_crypto: true, small_blind: 25, big_blind: 50, player_count: 8, spectator_count: 7, max_players: 9 }),
    makeGame('chill-vibes', { player_count: 5, spectator_count: 4 }),
    makeGame('base-whales', { is_crypto: true, small_blind: 100, big_blind: 200, player_count: 7, spectator_count: 10, max_players: 9 }),
    makeGame('newbie-table', { player_count: 2, spectator_count: 0, is_active: false, created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString() }),
    makeGame('friday-night', { player_count: 6, spectator_count: 3 }),
    makeGame('degen-hour', { is_crypto: true, small_blind: 50, big_blind: 100, player_count: 4, spectator_count: 1 }),
    makeGame('casual-fun', { small_blind: 5, big_blind: 10, player_count: 3, spectator_count: 0 }),
    makeGame('tournament-prep', { player_count: 9, max_players: 9, spectator_count: 5 }),
];

function InteractiveGrid({ games }: { games: PublicGame[] }) {
    const [filter, setFilter] = useState<FilterValue>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    return (
        <PublicGamesGrid
            games={games}
            totalCount={games.length}
            filter={filter}
            onFilterChange={setFilter}
            sortConfig={sortConfig}
            onSortChange={handleSort}
            hasMore={false}
            isLoadingMore={false}
            onLoadMore={() => {}}
        />
    );
}

const meta = {
    title: 'PublicGames/PublicGamesGrid',
    component: PublicGamesGrid,
    tags: ['autodocs'],
    parameters: {
        nextjs: { appDirectory: true },
    },
} satisfies Meta<typeof PublicGamesGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithGames: Story = {
    render: () => <InteractiveGrid games={mixedGames} />,
};

export const SingleGame: Story = {
    render: () => <InteractiveGrid games={[mixedGames[0]]} />,
};

export const ManyGames: Story = {
    render: () => {
        const many = Array.from({ length: 20 }, (_, i) =>
            makeGame(`table-${i + 1}`, {
                player_count: Math.floor(Math.random() * 9),
                spectator_count: Math.floor(Math.random() * 8),
                is_crypto: i % 3 === 0,
                small_blind: [5, 10, 25, 50][i % 4],
                big_blind: [10, 20, 50, 100][i % 4],
                is_active: i % 4 !== 0,
                created_at: new Date(Date.now() - i * 15 * 60 * 1000).toISOString(),
            })
        );
        return <InteractiveGrid games={many} />;
    },
};
