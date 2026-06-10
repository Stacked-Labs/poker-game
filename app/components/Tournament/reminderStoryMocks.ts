import type { Tournament } from '../../hooks/server_actions';

// Shared mocks for the tournament-reminder component stories. Times are relative
// to load so the live countdowns render in a believable window.
export const MINUTE = 60_000;
export const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString();

export function makeTournament(over: Partial<Tournament> = {}): Tournament {
    return {
        id: 1284,
        host_uuid: 'host-uuid-1',
        host_wallet: '0xHOST00000000000000000000000000000000A1',
        name: 'Friday Freezeout',
        description: 'Weekly no-limit hold em freezeout.',
        template_id: 'tmpl-weekly',
        buy_in_usdc: 25,
        fee_bps: 300,
        min_entries: 2,
        max_entries: 180,
        guarantee_usdc: 0,
        scheduled_start_at: fromNow(45 * MINUTE),
        late_reg_close_at: fromNow(90 * MINUTE),
        late_reg_levels: 6,
        advertised_end_at: fromNow(4 * 60 * MINUTE),
        table_size: 9,
        starting_stack: 20000,
        starting_stack_bb: 200,
        status: 'registration',
        prize_pool_usdc: 0,
        metadata: {},
        created_at: fromNow(-24 * 60 * MINUTE),
        is_private: false,
        reentry_allowed: false,
        reentry_max: 0,
        registered_count: 42,
        ...over,
    };
}
