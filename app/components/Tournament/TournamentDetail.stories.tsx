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

// Registration-phase roster: a mix of X-identified and bare-wallet sign-ups,
// with the viewer (ME) among them. registered_count exceeds the list to show
// the face-pile "+N" overflow behaviour.
const REGISTRANTS: LeaderboardPlayer[] = [
    withX(alive(ME, 0), 'degen_dan', px(5)),
    withX(alive(addr(0x21), 0), 'allin_alice', px(32)),
    withX(alive(addr(0x22), 0), 'whale_watcher', px(12)),
    alive(addr(0x23), 0),
    withX(alive(addr(0x24), 0), 'pocket_rockets', px(15)),
    withX(alive(addr(0x25), 0), 'river_rat', px(20)),
    alive(addr(0x26), 0),
    withX(alive(addr(0x27), 0), 'nina_v', px(33)),
    alive(addr(0x28), 0),
    withX(alive(addr(0x29), 0), 'cryptojoe', px(45)),
];

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
        registrants: REGISTRANTS,
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

// Buy-in only — no guarantee, no prize pool yet. MoneyHero shows the buy-in as its
// headline, so the separate "Buy-in" stat must NOT also render (no double "buy in"
// before the tournament starts). Regression guard.
export const RegisteringBuyInOnly: Story = {
    args: {
        myWallet: ME,
        isRegistered: false,
        players: [],
        tournament: makeTournament({
            id: 107,
            name: 'Test run crypto tourney',
            buy_in_usdc: 10_000, // $0.01
            min_entries: 2,
            max_entries: 100000,
            registered_count: 6,
            reentry_allowed: true,
            reentry_max: 1,
            scheduled_start_at: hours(0.02),
            chain: 'base',
            contract_address: addr(0x57),
            metadata: { blind_structure: 'hyper' },
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

// Large live field — exercises the standings scroll container (no infinite page
// growth) and the two-column / mobile-tab split.
const BIG_FIELD: LeaderboardPlayer[] = [
    withX(alive(ME, 248_000, 0), 'degen_dan', px(5)),
    ...Array.from({ length: 71 }, (_, i) =>
        alive(addr(0x200 + i), 230_000 - i * 2_800, i % 9)
    ),
    ...Array.from({ length: 46 }, (_, i) => out(addr(0x300 + i), 73 + i)),
];

export const RunningLargeField: Story = {
    args: {
        myWallet: ME,
        isRegistered: true,
        blindLevel: 9,
        players: BIG_FIELD,
        tournament: makeTournament({
            id: 109,
            name: 'Sunday Million',
            buy_in_usdc: 20_000_000,
            guarantee_usdc: 2_000_000_000,
            min_entries: 20,
            max_entries: 500,
            registered_count: 118,
            late_reg_levels: 6,
            status: 'running',
            scheduled_start_at: hours(-2),
            late_reg_close_at: hours(0.25),
            started_at: hours(-2),
            chain: 'base',
            contract_address: addr(0x109),
            reentry_allowed: true,
            reentry_max: 3,
            metadata: { blind_structure: 'regular' },
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

// Re-entry tournament: prize_pool_usdc froze at start (7 bullets), but 3 re-entries
// grew the real on-chain pool to $4,825. The realized per-player prize_usdc (which
// the contract paid) sum to that pool and are 50/30/20-shaped. The Payouts ladder
// must follow the realized total — matching the Final standings — not the stale
// $3,377.50 it was started with. Regression guard for the start-frozen-pool bug.
const REENTRY_FINAL_PLAYERS: LeaderboardPlayer[] = [
    withX(finished(addr(0x21), 1, 2_412_500_000), 'allin_alice', px(32)),
    finished(addr(0x22), 2, 1_447_500_000),
    withX(finished(ME, 3, 965_000_000), 'degen_dan', px(5)),
    finished(addr(0x24), 4),
    finished(addr(0x25), 5),
    finished(addr(0x26), 6),
    finished(addr(0x27), 7),
];

export const CompletedWithReentries: Story = {
    args: {
        myWallet: ME,
        isRegistered: true,
        players: REENTRY_FINAL_PLAYERS,
        tournament: makeTournament({
            id: 106,
            name: 'Re-entry Rumble',
            buy_in_usdc: 500_000_000,
            prize_pool_usdc: 3_377_500_000, // stale: frozen at start, 7 bullets
            min_entries: 6,
            max_entries: 200,
            registered_count: 10, // 10 bullets, 7 unique players
            status: 'completed',
            scheduled_start_at: hours(-26),
            started_at: hours(-26),
            ended_at: hours(-21),
            chain: 'base',
            contract_address: addr(0xdd),
            settlement_tx_hash: addr(0xee) + 'cdef',
            settlement_status: 'paid',
            metadata: { blind_structure: 'hyper' },
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

// Host viewing their own tournament with nothing customized yet: the hero shows
// the generated default branding plus inline "Add" affordances (hover or tap the
// banner / avatar) and an "Add a description" prompt. Frontend skeleton — edits
// preview locally; a backend dev wires persistence later.
export const HostEditingEmpty: Story = {
    args: {
        myWallet: ME,
        isRegistered: false,
        players: [],
        tournament: makeTournament({
            id: 110,
            name: 'My Home Game',
            host_wallet: ME,
            buy_in_usdc: 10_000_000,
            min_entries: 4,
            max_entries: 50,
            registered_count: 8,
            late_reg_levels: 2,
            scheduled_start_at: hours(6),
            late_reg_close_at: hours(7),
            chain: 'base',
            contract_address: addr(0x110),
            metadata: { blind_structure: 'hyper' },
        }),
    },
};

// Host viewing a tournament that already has branding + a blurb: the images show
// "Change" affordances and the description shows an edit pencil on hover.
export const HostEditingBranded: Story = {
    args: {
        ...HostEditingEmpty.args,
        tournament: makeTournament({
            ...(HostEditingEmpty.args!.tournament as object),
            id: 111,
            name: 'Degen Collective Invitational',
            description:
                'Weekly community deepstack hosted by the Degen Collective. We run a relaxed, social game with a competitive final table, so bring your A game and your sense of humor.\n\nAdditional prizes:\nTop 3 split a 500 USDC bonus pool on top of the regular payouts. The bubble (first player out of the money) gets their buy-in refunded.\n\nHouse rules:\nOne re-entry per player through level 6. Be cool, no slow-rolling, and keep the table chat friendly.',
            logo_url: '/IconLogo.png',
            banner_url: '/table-horizontal-green.webp',
            x_url: 'https://x.com/degencollective',
            website_url: 'https://degencollective.xyz',
            discord_url: 'https://discord.gg/degen',
            telegram_url: 'https://t.me/degencollective',
            chart_url: 'https://dexscreener.com/base/0xexample',
        } as Parameters<typeof makeTournament>[0]),
    },
};

// The same fully-branded tournament viewed by a player (not the host): colored
// community link chips, no edit affordances anywhere. Pairs with
// HostEditingBranded for a host-vs-player comparison.
export const BrandedPlayerView: Story = {
    args: {
        ...HostEditingBranded.args,
        myWallet: addr(0x999),
    },
};

// Host branding: custom banner + logo on the detail hero (community-hosted look).
export const RunningBranded: Story = {
    args: {
        ...Running.args,
        tournament: makeTournament({
            ...(Running.args!.tournament as object),
            id: 109,
            name: 'Degen Collective Invitational',
            description:
                'Weekly community deepstack hosted by the Degen Collective. Re-entries open through level 6; last one standing takes the lion’s share of the pool.',
            logo_url: '/IconLogo.png',
            banner_url: '/video/bgplaceholder-1920x1080.png',
            x_url: 'https://x.com/degencollective',
            website_url: 'https://degencollective.xyz',
            telegram_url: 'https://t.me/degencollective',
            chart_url: 'https://www.geckoterminal.com/base/pools/0xexample',
        } as Parameters<typeof makeTournament>[0]),
    },
};
