import type { Tournament } from '../../hooks/server_actions';

// Illustrative tournament fixtures for Storybook only. Amounts are micro-USDC
// (6 decimals). These are never presented as live data.

const hours = (n: number) => new Date(Date.now() + n * 3_600_000).toISOString();

export const MOCK_MY_WALLET = '0x9A7c0000000000000000000000000000000000Me';

const base: Omit<Tournament, 'id'> = {
    host_uuid: 'host-1',
    host_wallet: '0xA10000000000000000000000000000000000Host',
    name: '',
    description: '',
    template_id: 'tpl-mtt',
    buy_in_usdc: 0,
    fee_bps: 300,
    min_entries: 4,
    max_entries: 100,
    guarantee_usdc: 0,
    scheduled_start_at: hours(3),
    late_reg_close_at: hours(4),
    late_reg_levels: 0,
    advertised_end_at: hours(7),
    table_size: 9,
    starting_stack: 10000,
    starting_stack_bb: 100,
    status: 'registration',
    prize_pool_usdc: 0,
    metadata: { blind_structure: 'turbo' },
    created_at: hours(-24),
    is_private: false,
    reentry_allowed: false,
    reentry_max: 1,
};

export const makeTournament = (overrides: Partial<Tournament> & { id: number }): Tournament => ({
    ...base,
    ...overrides,
});

export const freePlayOpen = makeTournament({
    id: 1,
    name: 'Friday Freeroll',
    host_wallet: '0xA10000000000000000000000000000000000001',
    buy_in_usdc: 0,
    fee_bps: 0,
    min_entries: 2,
    max_entries: 100,
    registered_count: 14,
    scheduled_start_at: hours(5),
    metadata: { blind_structure: 'turbo' },
});

export const realMoneyOpen = makeTournament({
    id: 2,
    name: 'Sunday Major',
    host_wallet: '0xA10000000000000000000000000000000000002',
    buy_in_usdc: 25_000_000,
    guarantee_usdc: 500_000_000,
    min_entries: 10,
    max_entries: 200,
    registered_count: 67,
    late_reg_levels: 2,
    scheduled_start_at: hours(26),
    late_reg_close_at: hours(27),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000AA',
    metadata: { blind_structure: 'regular' },
    x_url: 'https://x.com/stackedpoker',
    discord_url: 'https://discord.gg/stacked',
    telegram_url: 'https://t.me/stacked',
});

export const privateFreePlay = makeTournament({
    id: 3,
    name: 'Home Game, Degens Only',
    host_wallet: '0xA10000000000000000000000000000000000003',
    buy_in_usdc: 0,
    fee_bps: 0,
    min_entries: 2,
    max_entries: 9,
    registered_count: 5,
    is_private: true,
    scheduled_start_at: hours(1),
    metadata: { blind_structure: 'hyper' },
});

// Viewer is the host; guarantee not yet funded, so registration is closed.
export const hostNeedsToFund = makeTournament({
    id: 4,
    name: 'Penthouse Bounty',
    host_wallet: MOCK_MY_WALLET,
    buy_in_usdc: 50_000_000,
    guarantee_usdc: 1_000_000_000,
    min_entries: 6,
    max_entries: 100,
    registered_count: 0,
    late_reg_levels: 3,
    status: 'pending',
    scheduled_start_at: hours(48),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000BB',
    reentry_allowed: true,
    reentry_max: 2,
    metadata: { blind_structure: 'deep' },
});

export const runningPlaying = makeTournament({
    id: 5,
    name: 'Tuesday Turbo',
    host_wallet: '0xA10000000000000000000000000000000000005',
    buy_in_usdc: 10_000_000,
    min_entries: 4,
    max_entries: 50,
    registered_count: 38,
    late_reg_levels: 1,
    status: 'running',
    scheduled_start_at: hours(-1),
    late_reg_close_at: hours(0.3),
    started_at: hours(-1),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000CC',
});

export const runningEliminated = makeTournament({
    id: 7,
    name: 'Midnight Hyper',
    host_wallet: '0xA10000000000000000000000000000000000007',
    buy_in_usdc: 5_000_000,
    min_entries: 4,
    max_entries: 45,
    registered_count: 21,
    late_reg_levels: 0,
    status: 'running',
    scheduled_start_at: hours(-2),
    started_at: hours(-2),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000EE',
    metadata: { blind_structure: 'hyper' },
});

export const completed = makeTournament({
    id: 6,
    name: 'Last Night Major',
    host_wallet: '0xA10000000000000000000000000000000000006',
    buy_in_usdc: 25_000_000,
    guarantee_usdc: 500_000_000,
    prize_pool_usdc: 4_825_000_000,
    min_entries: 10,
    max_entries: 200,
    registered_count: 193,
    late_reg_levels: 2,
    status: 'completed',
    scheduled_start_at: hours(-24),
    started_at: hours(-24),
    ended_at: hours(-19),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000DD',
    settlement_tx_hash: '0xTx00000000000000000000000000000000000FF',
    settlement_status: 'paid',
    metadata: { blind_structure: 'regular' },
});

export const MOCK_TOURNAMENTS: Tournament[] = [
    realMoneyOpen,
    freePlayOpen,
    privateFreePlay,
    runningPlaying,
    hostNeedsToFund,
    runningEliminated,
    completed,
];

// Host-branded fixtures: the look once a Host uploads a logo and/or banner.
// These exercise every branding path the lobby card has to render.

// Banner + logo: the fully dressed community-hosted card.
export const brandedBannerLogo = makeTournament({
    id: 101,
    name: 'Degen Collective Invitational',
    host_wallet: '0xA10000000000000000000000000000000000101',
    buy_in_usdc: 25_000_000,
    guarantee_usdc: 500_000_000,
    min_entries: 10,
    max_entries: 200,
    registered_count: 134,
    late_reg_levels: 2,
    scheduled_start_at: hours(20),
    late_reg_close_at: hours(21),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000101',
    metadata: { blind_structure: 'regular' },
    logo_url: '/IconLogo.png',
    banner_url: '/table-horizontal-green.webp',
    x_url: 'https://x.com/degencollective',
    telegram_url: 'https://t.me/degencollective',
    website_url: 'https://degencollective.xyz',
});

// Banner + logo on a deep-stack event, starting soon.
export const brandedBannerLogoDeep = makeTournament({
    id: 102,
    name: 'Penthouse After Dark',
    host_wallet: '0xA10000000000000000000000000000000000102',
    buy_in_usdc: 50_000_000,
    guarantee_usdc: 1_000_000_000,
    min_entries: 8,
    max_entries: 150,
    registered_count: 88,
    late_reg_levels: 3,
    scheduled_start_at: hours(6),
    late_reg_close_at: hours(7),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000102',
    metadata: { blind_structure: 'deep' },
    logo_url: '/IconMain.png',
    banner_url: '/video/bgplaceholder-1920x1080.png',
});

// Banner uploaded, no logo: the default type avatar fills the logo slot in the strip.
export const brandedBannerOnly = makeTournament({
    id: 103,
    name: 'The Back Room',
    host_wallet: '0xA10000000000000000000000000000000000103',
    buy_in_usdc: 10_000_000,
    min_entries: 4,
    max_entries: 60,
    registered_count: 27,
    scheduled_start_at: hours(3),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000103',
    metadata: { blind_structure: 'hyper' },
    banner_url: '/table-horizontal-red.webp',
});

// Logo uploaded, no banner: the header avatar is the logo, no banner strip.
export const brandedLogoOnly = makeTournament({
    id: 104,
    name: 'Night Owls League',
    host_wallet: '0xA10000000000000000000000000000000000104',
    buy_in_usdc: 0,
    fee_bps: 0,
    min_entries: 2,
    max_entries: 100,
    registered_count: 41,
    scheduled_start_at: hours(9),
    metadata: { blind_structure: 'turbo' },
    logo_url: '/IconMain.png',
});

// Branded event that has finished and settled on-chain.
export const brandedCompleted = makeTournament({
    id: 105,
    name: 'Velvet Rope Championship',
    host_wallet: '0xA10000000000000000000000000000000000105',
    buy_in_usdc: 100_000_000,
    guarantee_usdc: 2_000_000_000,
    prize_pool_usdc: 9_400_000_000,
    min_entries: 10,
    max_entries: 200,
    registered_count: 188,
    late_reg_levels: 2,
    status: 'completed',
    scheduled_start_at: hours(-28),
    started_at: hours(-28),
    ended_at: hours(-22),
    chain: 'base',
    contract_address: '0xC0ntract0000000000000000000000000000105',
    settlement_tx_hash: '0xTx0000000000000000000000000000000000105',
    settlement_status: 'paid',
    metadata: { blind_structure: 'regular' },
    logo_url: '/IconLogo.png',
    banner_url: '/homepage/lobbyPic.png',
});

// A populated lobby that shows the full spread at a glance: branded (banner+logo,
// banner-only, logo-only), all four default-branding types, and every lifecycle
// state (open, private, free, host-funding, live-in, live-out, completed, syncing).
export const MOCK_TOURNAMENTS_SHOWCASE: Tournament[] = [
    brandedBannerLogo, // banner + logo, real money, regular, open
    realMoneyOpen, // default avatar, regular, viewer registered
    brandedBannerLogoDeep, // banner + logo, deep, register tx syncing
    privateFreePlay, // default avatar, hyper, private free play
    brandedBannerOnly, // banner only -> default avatar in the strip, hyper
    freePlayOpen, // default avatar, turbo, free play
    brandedLogoOnly, // logo only, turbo, free play
    hostNeedsToFund, // default avatar, deep, viewer is host (needs funding)
    runningPlaying, // live, viewer still in
    runningEliminated, // live, viewer busted
    completed, // default avatar, regular, finished + paid
    brandedCompleted, // banner + logo, finished championship
];
