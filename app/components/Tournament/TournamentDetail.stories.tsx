import type { Meta, StoryObj } from '@storybook/react';
import TournamentDetail, { type LeaderboardPlayer } from './TournamentDetail';
import { makeTournament, MOCK_MY_WALLET } from '../PublicGames/mockTournaments';

const hours = (n: number) => new Date(Date.now() + n * 3_600_000).toISOString();
const ME = MOCK_MY_WALLET;

const addr = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;

function alive(
    wallet: string,
    stack: number,
    table_index = 0,
    bullet_number = 1
): LeaderboardPlayer {
    return {
        uuid: `${wallet}-a`,
        wallet,
        stack,
        finish_pos: 0,
        table_index,
        bullet_number,
    };
}
function out(
    wallet: string,
    finish_pos: number,
    bullet_number = 1
): LeaderboardPlayer {
    return {
        uuid: `${wallet}-${finish_pos}`,
        wallet,
        stack: 0,
        finish_pos,
        table_index: -1,
        bullet_number,
    };
}
function finished(
    wallet: string,
    finish_pos: number,
    prize_usdc?: number
): LeaderboardPlayer {
    return {
        uuid: `${wallet}-f${finish_pos}`,
        wallet,
        stack: 0,
        finish_pos,
        table_index: -1,
        prize_usdc,
    };
}

// Illustrative X identity for the prototype. profileImageUrl omitted = blockie.
const px = (n: number) => `https://i.pravatar.cc/120?img=${n}`;
function withX(
    p: LeaderboardPlayer,
    xUsername: string,
    xProfileImageUrl?: string
): LeaderboardPlayer {
    return { ...p, xUsername, xProfileImageUrl: xProfileImageUrl ?? null };
}

const meta = {
    title: 'Tournament/TournamentDetail',
    component: TournamentDetail,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
} satisfies Meta<typeof TournamentDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

// Registration open, real money with a guarantee, viewer not yet registered.
export const Registering: Story = {
    args: {
        myWallet: ME,
        isRegistered: false,
        players: [],
        tournament: makeTournament({
            id: 101,
            name: 'Sunday Major',
            buy_in_usdc: 25_000_000,
            guarantee_usdc: 500_000_000,
            min_entries: 10,
            max_entries: 200,
            registered_count: 67,
            late_reg_levels: 2,
            scheduled_start_at: hours(3),
            late_reg_close_at: hours(4),
            chain: 'base',
            contract_address: addr(0xaa),
            metadata: { blind_structure: 'regular' },
        }),
    },
};

// Same, but the viewer is already registered (locked in / can unregister).
export const RegisteredAndWaiting: Story = {
    args: {
        ...Registering.args,
        isRegistered: true,
    },
};

// Free-play tournament, registration open.
export const FreePlay: Story = {
    args: {
        myWallet: ME,
        isRegistered: false,
        players: [],
        tournament: makeTournament({
            id: 102,
            name: 'Friday Freeroll',
            buy_in_usdc: 0,
            fee_bps: 0,
            min_entries: 2,
            max_entries: 100,
            registered_count: 41,
            scheduled_start_at: hours(5),
            chain: undefined,
            contract_address: undefined,
        }),
    },
};

// Viewer is the host of a pending tournament that still needs its guarantee funded.
export const HostNeedsToFund: Story = {
    args: {
        myWallet: ME,
        isRegistered: false,
        players: [],
        tournament: makeTournament({
            id: 103,
            name: 'Penthouse Bounty',
            host_wallet: ME,
            buy_in_usdc: 50_000_000,
            guarantee_usdc: 1_000_000_000,
            min_entries: 6,
            max_entries: 100,
            registered_count: 0,
            status: 'pending',
            scheduled_start_at: hours(48),
            chain: 'base',
            contract_address: addr(0xbb),
            reentry_allowed: true,
            reentry_max: 2,
            metadata: { blind_structure: 'deep' },
        }),
    },
};

const RUNNING_PLAYERS: LeaderboardPlayer[] = [
    withX(alive(addr(0x11), 122_500, 0), 'whale_watcher', px(12)),
    withX(alive(ME, 84_000, 0), 'degen_dan', px(5)),
    alive(addr(0x12), 61_000, 1),
    withX(alive(addr(0x13), 38_500, 1), 'pocket_rockets'),
    alive(addr(0x14), 19_000, 2),
    out(addr(0x15), 28),
    out(addr(0x16), 29),
];

// Live tournament, viewer still in, late reg open.
export const Running: Story = {
    args: {
        myWallet: ME,
        isRegistered: true,
        blindLevel: 6,
        players: RUNNING_PLAYERS,
        tournament: makeTournament({
            id: 104,
            name: 'Tuesday Turbo',
            buy_in_usdc: 10_000_000,
            guarantee_usdc: 250_000_000,
            min_entries: 4,
            max_entries: 50,
            registered_count: 32,
            late_reg_levels: 3,
            status: 'running',
            scheduled_start_at: hours(-1),
            late_reg_close_at: hours(0.5),
            started_at: hours(-1),
            chain: 'base',
            contract_address: addr(0xcc),
            reentry_allowed: true,
            reentry_max: 2,
        }),
    },
};

// Live tournament, viewer busted but can re-enter (late reg still open).
export const RunningEliminatedCanReenter: Story = {
    args: {
        ...Running.args,
        players: [
            withX(alive(addr(0x11), 122_500, 0), 'whale_watcher', px(12)),
            alive(addr(0x12), 61_000, 1),
            alive(addr(0x14), 19_000, 2),
            withX(out(ME, 18, 1), 'degen_dan', px(5)),
            out(addr(0x15), 28),
        ],
    },
};

const FINAL_PLAYERS: LeaderboardPlayer[] = [
    withX(finished(addr(0x21), 1, 2_100_000_000), 'allin_alice', px(32)),
    finished(addr(0x22), 2, 1_300_000_000),
    withX(finished(ME, 3, 800_000_000), 'degen_dan', px(5)),
    finished(addr(0x24), 4, 425_000_000),
    finished(addr(0x25), 5, 200_000_000),
    finished(addr(0x26), 6),
    finished(addr(0x27), 7),
];

// Completed and settled on-chain.
export const Completed: Story = {
    args: {
        myWallet: ME,
        isRegistered: true,
        players: FINAL_PLAYERS,
        tournament: makeTournament({
            id: 105,
            name: 'Last Night Major',
            buy_in_usdc: 25_000_000,
            guarantee_usdc: 500_000_000,
            prize_pool_usdc: 4_825_000_000,
            min_entries: 10,
            max_entries: 200,
            registered_count: 193,
            status: 'completed',
            scheduled_start_at: hours(-26),
            started_at: hours(-26),
            ended_at: hours(-21),
            chain: 'base',
            contract_address: addr(0xdd),
            settlement_tx_hash: addr(0xee) + 'abcd',
            settlement_status: 'paid',
            metadata: { blind_structure: 'regular' },
        }),
    },
};

// Completed, viewed by the host (rake claimable).
export const CompletedHostView: Story = {
    args: {
        ...Completed.args,
        hostRakeUsdc: 144_750_000,
        tournament: makeTournament({
            ...(Completed.args!.tournament as object),
            id: 106,
            host_wallet: ME,
        } as Parameters<typeof makeTournament>[0]),
    },
};

// Cancelled, viewer eligible for a buy-in refund.
export const Cancelled: Story = {
    args: {
        myWallet: ME,
        isRegistered: true,
        players: [],
        refund: { eligible: true, estimatedUsdc: 25_000_000 },
        tournament: makeTournament({
            id: 107,
            name: 'Scrapped Series',
            buy_in_usdc: 25_000_000,
            guarantee_usdc: 500_000_000,
            min_entries: 50,
            max_entries: 200,
            registered_count: 12,
            status: 'cancelled',
            scheduled_start_at: hours(-2),
            chain: 'base',
            contract_address: addr(0xff),
        }),
    },
};

// Running past advertised end: emergency refund available to open.
export const EmergencySafetyNet: Story = {
    args: {
        myWallet: ME,
        isRegistered: true,
        blindLevel: 14,
        players: RUNNING_PLAYERS,
        emergency: { available: true },
        tournament: makeTournament({
            id: 108,
            name: 'Stalled Stakes',
            buy_in_usdc: 25_000_000,
            min_entries: 4,
            max_entries: 50,
            registered_count: 40,
            status: 'running',
            scheduled_start_at: hours(-30),
            started_at: hours(-30),
            advertised_end_at: hours(-26),
            chain: 'base',
            contract_address: addr(0x1a2b),
        }),
    },
};
