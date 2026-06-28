import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import BoardTable from './BoardTable';
import TopHostsBoard from './TopHostsBoard';
import type { BoardResponse, BoardRow } from '@/app/hooks/server_actions';

const ME = '0x1111111111111111111111111111111111111111';

function row(rank: number, name: string, tier: string, value: string, wallet: string, extra?: Record<string, number>): BoardRow {
    return { rank, wallet, x_username: name, x_display_name: name, tier, value: 0, value_label: value, extra };
}

const POINTS: BoardResponse = {
    board: 'points',
    title: 'Points',
    icon: '🏆',
    value_kind: 'points',
    page: 1,
    page_size: 50,
    total: 320,
    updated_at: null,
    real_money: false,
    available: true,
    rows: [
        row(1, 'goldrush', 'diamond', '48,200', '0xaaa1'),
        row(2, 'riverratt', 'diamond', '41,050', '0xaaa2'),
        row(3, 'chipleader', 'gold', '38,900', '0xaaa3'),
        row(4, 'allin_annie', 'gold', '31,400', '0xaaa4'),
        row(5, 'mike dawson', 'silver', '27,800', ME),
        row(6, 'felt_phantom', 'silver', '22,100', '0xaaa6'),
        row(7, 'nit_nelson', 'bronze', '18,640', '0xaaa7'),
        row(8, 'fishfryer', 'iron', '12,030', '0xaaa8'),
    ],
    player: null,
};

// Player pinned off-page (rank 142) to exercise the sticky "your position" slot.
const POINTS_PINNED: BoardResponse = {
    ...POINTS,
    rows: POINTS.rows.map((r) => (r.wallet === ME ? { ...r, rank: 0, value_label: '—' } : r)).filter((r) => r.wallet !== ME),
    player: { ...row(142, 'mike dawson', 'bronze', '4,210', ME) },
};

const TOP_HOSTS: BoardResponse = {
    board: 'top_hosts',
    title: 'Top Hosts',
    icon: '🎟',
    value_kind: 'usdc',
    page: 1,
    page_size: 50,
    total: 64,
    updated_at: null,
    real_money: true,
    available: true,
    rows: [
        row(1, 'thehouse', 'diamond', '$4,820', '0xbbb1', { tables_hosted: 212, tournaments_run: 18 }),
        row(2, 'mike dawson', 'gold', '$3,140', ME, { tables_hosted: 96, tournaments_run: 11 }),
        row(3, 'pennydealer', 'gold', '$1,990', '0xbbb3', { tables_hosted: 74, tournaments_run: 6 }),
        row(4, 'latenight', 'silver', '$1,205', '0xbbb4', { tables_hosted: 51, tournaments_run: 4 }),
        row(5, 'smallblind', 'bronze', '$640', '0xbbb5', { tables_hosted: 28, tournaments_run: 2 }),
    ],
    player: null,
};

const meta: Meta = {
    title: 'StatsHub/Boards',
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="bg.default" p={{ base: 4, md: 8 }} maxW="760px" mx="auto">
                <Story />
            </Box>
        ),
    ],
};
export default meta;
type Story = StoryObj;

export const PointsBoard: Story = {
    render: () => <BoardTable data={POINTS} loading={false} currentAddress={ME} onLoadMore={() => {}} />,
};

export const PointsBoardPinned: Story = {
    render: () => <BoardTable data={POINTS_PINNED} loading={false} currentAddress={ME} onLoadMore={() => {}} />,
};

export const TopHosts: Story = {
    render: () => <TopHostsBoard data={TOP_HOSTS} loading={false} currentAddress={ME} onLoadMore={() => {}} />,
};

export const Loading: Story = {
    render: () => <BoardTable data={null} loading currentAddress={ME} />,
};
