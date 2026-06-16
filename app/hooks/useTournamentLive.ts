import { useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import {
    getTournament,
    getTournamentClock,
    getTournamentLeaderboard,
    type Tournament,
    type TournamentClockResponse,
} from './server_actions';
import { isFreePlay } from '../components/PublicGames/tournamentFormat';
import type {
    LeaderboardPlayer,
    TournamentClock,
    TournamentMeta,
} from '../interfaces';

const POLL_MS = 15_000;

// The leaderboard endpoint returns live players, or DB results once completed.
interface LeaderboardResponse {
    live?: boolean;
    players?: LeaderboardPlayer[];
    results?: {
        wallet_address: string;
        finish_position: number;
        prize_usdc: number;
    }[];
}

function mapLeaderboard(lb: LeaderboardResponse | null): LeaderboardPlayer[] {
    if (!lb) return [];
    if (lb.live === false && Array.isArray(lb.results)) {
        return lb.results.map((r, i) => ({
            uuid: r.wallet_address + i,
            wallet: r.wallet_address,
            stack: 0,
            finish_pos: r.finish_position,
            table_index: -1,
            prize_usdc: r.prize_usdc,
        }));
    }
    return lb.players ?? [];
}

function mapClock(res: TournamentClockResponse): TournamentClock {
    return {
        level: res.level,
        levelNumber: res.level_number,
        sb: res.small,
        bb: res.big,
        ante: res.ante,
        remainingMs: res.remaining_ms,
        totalMs: res.total_ms,
        receivedAt: Date.now(),
        // Rest-break fields. This is the join-time / self-heal path, so a player
        // who joins mid-break must learn the break from REST here (the WS push
        // only fires on break/level edges).
        onBreak: res.on_break,
        breakRemainingMs: res.break_remaining_ms,
        secondsToNextBreak: res.seconds_to_next_break,
        nextBreakAfterLevel: res.next_break_after_level,
    };
}

function mapMeta(t: Tournament): TournamentMeta {
    return {
        name: t.name,
        status: t.status,
        registeredCount: t.registered_count ?? 0,
        maxEntries: t.max_entries,
        minEntries: t.min_entries,
        prizePoolUsdc: t.prize_pool_usdc,
        guaranteeUsdc: t.guarantee_usdc,
        buyInUsdc: t.buy_in_usdc,
        feeBps: t.fee_bps,
        startingStack: t.starting_stack,
        blindStructure: String(t.metadata?.blind_structure ?? 'turbo'),
        lateRegLevels: t.late_reg_levels,
        lateRegCloseAt: t.late_reg_close_at,
        reentryAllowed: t.reentry_allowed,
        reentryMax: t.reentry_max,
        chain: t.chain,
        contractAddress: t.contract_address,
        isFreePlay: isFreePlay(t),
        hostWallet: t.host_wallet,
        settlementTxHash: t.settlement_tx_hash,
    };
}

/**
 * Drives the live-tournament state slice for a seated table. Seeds from REST on
 * mount and whenever the socket (re)connects (the WS push only fires on level
 * advance, so REST is the source of truth at join time), polls the fetch-only
 * leaderboard, and resets on unmount. WS pushes (handled in WebSocketProvider)
 * keep the clock / player-count / feed current between seeds.
 */
export function useTournamentLive(tournamentId: number | null): void {
    const { dispatch } = useContext(AppContext);

    useEffect(() => {
        if (tournamentId == null || Number.isNaN(tournamentId)) return;
        let cancelled = false;

        const seed = async () => {
            dispatch({
                type: 'setTournamentStatus',
                payload: { tournamentId, status: 'connecting' },
            });
            try {
                const [tData, lbData, clockRes] = await Promise.all([
                    getTournament(tournamentId),
                    getTournamentLeaderboard(
                        tournamentId
                    ) as Promise<LeaderboardResponse | null>,
                    getTournamentClock(tournamentId),
                ]);
                if (cancelled) return;
                const leaderboard = mapLeaderboard(lbData);
                const clock = clockRes ? mapClock(clockRes) : null;
                const alive = leaderboard.filter(
                    (p) => p.finish_pos === 0
                ).length;
                dispatch({
                    type: 'setTournamentSeed',
                    payload: {
                        tournamentId,
                        meta: mapMeta(tData.tournament),
                        clock,
                        playersActive: alive > 0 ? alive : null,
                        feed: [],
                        leaderboard,
                        completed: null,
                        myResult: null,
                        status: clock ? 'live' : 'connecting',
                    },
                });
            } catch {
                if (!cancelled) {
                    dispatch({
                        type: 'setTournamentStatus',
                        payload: { tournamentId, status: 'stale' },
                    });
                }
            }
        };

        seed();
        return () => {
            cancelled = true;
        };
    }, [tournamentId, dispatch]);

    // Refresh meta (field size / prize pool / status), the leaderboard, and the
    // clock on a fixed cadence. WS pushes give instant updates between polls; this
    // keeps the slow-moving + fetch-only data fresh (the field and pool grow during
    // late registration) and self-heals the clock if a level-advance push is ever
    // missed or the socket reconnected.
    useEffect(() => {
        if (tournamentId == null || Number.isNaN(tournamentId)) return;
        let cancelled = false;
        const id = setInterval(async () => {
            try {
                const [tData, lb, clockRes] = await Promise.all([
                    getTournament(tournamentId),
                    getTournamentLeaderboard(
                        tournamentId
                    ) as Promise<LeaderboardResponse | null>,
                    getTournamentClock(tournamentId),
                ]);
                // A poll resolving after unmount / tournamentId change must not
                // write stale data over the next tournament's state.
                if (cancelled) return;
                dispatch({
                    type: 'setTournamentMeta',
                    payload: { tournamentId, meta: mapMeta(tData.tournament) },
                });
                dispatch({
                    type: 'setTournamentLeaderboard',
                    payload: { tournamentId, leaderboard: mapLeaderboard(lb) },
                });
                if (clockRes) {
                    dispatch({
                        type: 'setTournamentClock',
                        payload: { tournamentId, clock: mapClock(clockRes) },
                    });
                }
            } catch {
                // transient; the next tick retries
            }
        }, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [tournamentId, dispatch]);

    useEffect(() => {
        return () => {
            dispatch({ type: 'resetTournamentLive' });
        };
    }, [dispatch]);
}
