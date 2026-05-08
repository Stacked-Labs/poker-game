import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { Box, Container } from '@chakra-ui/react';
import PublicGamesGrid from './PublicGamesGrid';
import type {
    PublicGame,
    FilterValue,
    StakeFilter as StakeFilterValue,
    SortKey,
    SortConfig,
} from './types';
import { stakeTier } from './types';

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
    makeGame('high-roller-vault', { is_crypto: true, small_blind: 200, big_blind: 500, player_count: 6, max_players: 6, spectator_count: 4, contract_address: '0xfa04e1d9c8b3f1b0b8e01a25c9d4568b0c2c445b' }),
    makeGame('sunday-grinders', { is_crypto: true, small_blind: 100, big_blind: 200, player_count: 5, spectator_count: 12, contract_address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98' }),
    makeGame('penny-pushers', { is_crypto: true, small_blind: 10, big_blind: 25, player_count: 3, max_players: 6, spectator_count: 1, contract_address: '0x1234567890abcdef1234567890abcdef12345678' }),
    makeGame('free-roll-9pm', { player_count: 4, is_active: false, created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString() }),
    makeGame('home-game-friday', { small_blind: 25, big_blind: 50, player_count: 2, max_players: 6, is_active: false }),
    makeGame('whales-only', { is_crypto: true, small_blind: 500, big_blind: 1000, player_count: 4, max_players: 6, spectator_count: 22, contract_address: '0xdeadbeef00112233445566778899aabbccddeeff' }),
    makeGame('late-night-degen', { is_crypto: true, small_blind: 50, big_blind: 100, player_count: 8, spectator_count: 7, contract_address: '0xabc123def456789012345678901234567890abcd' }),
    makeGame('practice-table', { small_blind: 5, big_blind: 10, player_count: 0, max_players: 6, spectator_count: 0, is_active: false }),
];

function InteractiveGrid({ games }: { games: PublicGame[] }) {
    const [filter, setFilter] = useState<FilterValue>('all');
    const [stake, setStake] = useState<StakeFilterValue>('all');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    const filtered = useMemo(() => {
        return games.filter((g) => {
            if (filter === 'crypto' && !g.is_crypto) return false;
            if (filter === 'free' && g.is_crypto) return false;
            if (stake !== 'all' && filter !== 'free') {
                if (!g.is_crypto) return false;
                return stakeTier(g) === stake;
            }
            return true;
        });
    }, [games, filter, stake]);

    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    return (
        <Box bg="card.lightGray" minH="100vh" py={{ base: 6, md: 10 }}>
            <Container maxW="container.xl" px={{ base: 3, md: 6, lg: 8 }}>
                <PublicGamesGrid
                    games={filtered}
                    totalCount={games.length}
                    filter={filter}
                    onFilterChange={setFilter}
                    stake={stake}
                    onStakeChange={setStake}
                    sortConfig={sortConfig}
                    onSortChange={handleSort}
                    hasMore={false}
                    isLoadingMore={false}
                    onLoadMore={() => {}}
                />
            </Container>
        </Box>
    );
}

const meta = {
    title: 'PublicGames/PublicGamesGrid',
    component: PublicGamesGrid,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        nextjs: { appDirectory: true },
    },
} satisfies Meta<typeof PublicGamesGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mixed: Story = {
    render: () => <InteractiveGrid games={mixedGames} />,
};

export const SingleGame: Story = {
    render: () => <InteractiveGrid games={[mixedGames[0]]} />,
};

export const ManyGames: Story = {
    render: () => {
        const many: PublicGame[] = Array.from({ length: 20 }, (_, i) => {
            const isCrypto = i % 2 === 0;
            const blindOptions = [
                { sb: 5, bb: 10 },
                { sb: 10, bb: 25 },
                { sb: 25, bb: 50 },
                { sb: 100, bb: 200 },
                { sb: 250, bb: 500 },
            ];
            const blinds = blindOptions[i % blindOptions.length];
            return makeGame(`table-${i + 1}`, {
                is_crypto: isCrypto,
                small_blind: blinds.sb,
                big_blind: blinds.bb,
                player_count: Math.floor(Math.random() * 9),
                spectator_count: Math.floor(Math.random() * 10),
                is_active: i % 4 !== 0,
                contract_address: isCrypto
                    ? `0x${i.toString(16).padStart(40, 'a')}`
                    : undefined,
                created_at: new Date(Date.now() - i * 15 * 60 * 1000).toISOString(),
            });
        });
        return <InteractiveGrid games={many} />;
    },
};
