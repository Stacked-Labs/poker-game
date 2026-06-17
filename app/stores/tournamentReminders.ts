import { create } from 'zustand';
import type { Tournament } from '../hooks/server_actions';

// A registered tournament reduced to just what the banner needs. The provider
// builds these from listTournaments() indexed by id, so the store never holds a
// whole Tournament and never re-renders the banner on unrelated field churn.
export type ReminderTournament = {
    id: number;
    name: string;
    scheduledStartAt: string;
    lateRegCloseAt?: string;
    lateRegLevels?: number;
    status: string;
};

type DismissalMap = Record<number, number>; // tourId -> dismissed-at ms

// 24h dismissal window. A dismissal older than this is treated as expired so a
// long-lived tournament can surface again the next day.
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

// Poll cadence: tighten to 15s once the nearest deadline is inside 15 minutes,
// otherwise a relaxed 60s. Mirrors ServiceStatusBanner's poll discipline.
const POLL_NEAR_MS = 15_000;
const POLL_FAR_MS = 60_000;
const NEAR_WINDOW_MS = 15 * 60 * 1000;

const dismissKey = (wallet: string) =>
    `tournament_reminder_dismissed_${wallet.toLowerCase()}`;

function safeReadDismissals(wallet: string): DismissalMap {
    if (typeof window === 'undefined' || !wallet) return {};

    try {
        const raw = localStorage.getItem(dismissKey(wallet));
        if (!raw) return {};
        const parsed = JSON.parse(raw) as DismissalMap;
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed;
    } catch (error) {
        console.warn('Failed to read tournament reminder dismissals:', error);
        return {};
    }
}

function safeWriteDismissals(wallet: string, map: DismissalMap) {
    if (typeof window === 'undefined' || !wallet) return;

    try {
        localStorage.setItem(dismissKey(wallet), JSON.stringify(map));
    } catch (error) {
        console.warn('Failed to write tournament reminder dismissals:', error);
    }
}

// The deadline that drives urgency for a given tournament: the start time, or
// the late-reg close if it is sooner and still ahead.
function nextDeadlineMs(t: ReminderTournament, nowMs: number): number {
    const start = new Date(t.scheduledStartAt).getTime();
    const lateClose = t.lateRegCloseAt
        ? new Date(t.lateRegCloseAt).getTime()
        : NaN;

    const candidates = [start, lateClose].filter(
        (ms) => !Number.isNaN(ms) && ms > nowMs
    );
    // No future deadline: return the (possibly past) start, or NaN when the start
    // itself is unparseable so the eligibility filter can drop the corrupt row
    // rather than pin it in the banner forever (NaN passes no finite check).
    if (candidates.length === 0) return start;
    return Math.min(...candidates);
}

type TournamentReminderStore = {
    registeredTournaments: ReminderTournament[];
    dismissedAt: DismissalMap;
    suppressedSeated: Record<number, boolean>;

    // Replace the registered set from a fresh poll. `byId` carries the full
    // Tournament objects keyed by id; ids not present in `byId` are dropped.
    updateRegistrations: (
        ids: number[],
        byId: Record<number, Tournament | undefined>
    ) => void;

    // Add or refresh a single registered tournament WITHOUT dropping the others.
    // Used by the optimistic register path so the banner appears immediately; the
    // next provider poll reconciles the full set. (updateRegistrations replaces.)
    upsertTournament: (t: Tournament | undefined) => void;
    // Remove a single tournament from the set (optimistic unregister).
    removeTournament: (tourId: number) => void;

    // Persist a 24h dismissal for the given tournament, scoped to the wallet.
    dismiss: (tourId: number, wallet: string) => void;
    isDismissed: (tourId: number) => boolean;

    // Hide a reminder while the player is seated at its table (no persistence).
    suppress: (tourId: number) => void;
    unsuppress: (tourId: number) => void;

    // 15s when the nearest deadline is under 15m away, else 60s.
    adaptPollInterval: () => number;

    // Soonest future tournament that is not dismissed and not suppressed.
    getMostUrgent: () => ReminderTournament | null;
    // How many other eligible tournaments sit behind the most-urgent one.
    getRemainderCount: () => number;
    // The eligible tournaments behind the most-urgent one, soonest-first.
    getRemainder: () => ReminderTournament[];

    // Seed dismissals for the active wallet (called by the provider on login).
    loadDismissals: (wallet: string) => void;
    // Clear everything on logout / no registrations.
    clear: () => void;
};

function isDismissedAt(
    map: DismissalMap,
    tourId: number,
    nowMs: number
): boolean {
    const at = map[tourId];
    if (!at) return false;
    return nowMs - at < DISMISS_TTL_MS;
}

// Pure eligibility selector over the raw slices: a tournament shows when it has
// a future deadline, is not within its 24h dismissal window, and is not
// seated-suppressed. Soonest-first. Exported so components can subscribe to the
// slices directly and memoize without breaking Zustand's snapshot caching.
export function selectEligibleReminders(
    registeredTournaments: ReminderTournament[],
    dismissedAt: DismissalMap,
    suppressedSeated: Record<number, boolean>,
    nowMs: number = Date.now()
): ReminderTournament[] {
    return registeredTournaments
        .filter((t) => {
            if (suppressedSeated[t.id]) return false;
            if (isDismissedAt(dismissedAt, t.id, nowMs)) return false;
            const deadline = nextDeadlineMs(t, nowMs);
            return Number.isFinite(deadline) && deadline > nowMs;
        })
        .sort((a, b) => nextDeadlineMs(a, nowMs) - nextDeadlineMs(b, nowMs));
}

// Reduce a full Tournament to the slice the banner needs. Returns null when the
// tournament has no start time (nothing to count down to).
function toReminder(t: Tournament | undefined): ReminderTournament | null {
    if (!t || !t.scheduled_start_at) return null;
    return {
        id: t.id,
        name: t.name,
        scheduledStartAt: t.scheduled_start_at,
        lateRegCloseAt: t.late_reg_close_at || undefined,
        lateRegLevels: t.late_reg_levels,
        status: t.status,
    };
}

function eligibleSorted(
    state: TournamentReminderStore,
    nowMs: number
): ReminderTournament[] {
    return selectEligibleReminders(
        state.registeredTournaments,
        state.dismissedAt,
        state.suppressedSeated,
        nowMs
    );
}

export const useTournamentReminderStore = create<TournamentReminderStore>(
    (set, get) => ({
        registeredTournaments: [],
        dismissedAt: {},
        suppressedSeated: {},

        updateRegistrations: (ids, byId) => {
            const next: ReminderTournament[] = ids
                .map((id) => toReminder(byId[id]))
                .filter((t): t is ReminderTournament => t !== null);

            // Drop seated-suppression for tournaments we no longer track so the
            // map cannot grow unbounded across sessions.
            const liveIds = new Set(next.map((t) => t.id));
            set((state) => {
                const suppressedSeated: Record<number, boolean> = {};
                for (const id of Object.keys(state.suppressedSeated)) {
                    const n = Number(id);
                    if (liveIds.has(n)) suppressedSeated[n] = true;
                }
                return { registeredTournaments: next, suppressedSeated };
            });
        },

        upsertTournament: (t) => {
            const entry = toReminder(t);
            if (!entry) return;
            set((state) => ({
                registeredTournaments: [
                    ...state.registeredTournaments.filter((x) => x.id !== entry.id),
                    entry,
                ],
            }));
        },

        removeTournament: (tourId) =>
            set((state) => ({
                registeredTournaments: state.registeredTournaments.filter(
                    (x) => x.id !== tourId
                ),
            })),

        dismiss: (tourId, wallet) => {
            const at = Date.now();
            set((state) => {
                const dismissedAt = { ...state.dismissedAt, [tourId]: at };
                safeWriteDismissals(wallet, dismissedAt);
                return { dismissedAt };
            });
        },

        isDismissed: (tourId) =>
            isDismissedAt(get().dismissedAt, tourId, Date.now()),

        suppress: (tourId) =>
            set((state) =>
                state.suppressedSeated[tourId]
                    ? state
                    : {
                          suppressedSeated: {
                              ...state.suppressedSeated,
                              [tourId]: true,
                          },
                      }
            ),

        unsuppress: (tourId) =>
            set((state) => {
                if (!state.suppressedSeated[tourId]) return state;
                const suppressedSeated = { ...state.suppressedSeated };
                delete suppressedSeated[tourId];
                return { suppressedSeated };
            }),

        adaptPollInterval: () => {
            const now = Date.now();
            const eligible = eligibleSorted(get(), now);
            if (eligible.length === 0) return POLL_FAR_MS;
            const nearest = nextDeadlineMs(eligible[0], now) - now;
            return nearest <= NEAR_WINDOW_MS ? POLL_NEAR_MS : POLL_FAR_MS;
        },

        getMostUrgent: () => {
            const eligible = eligibleSorted(get(), Date.now());
            return eligible[0] ?? null;
        },

        getRemainderCount: () =>
            Math.max(0, eligibleSorted(get(), Date.now()).length - 1),

        getRemainder: () => eligibleSorted(get(), Date.now()).slice(1),

        loadDismissals: (wallet) => {
            set({ dismissedAt: safeReadDismissals(wallet) });
        },

        clear: () =>
            set({
                registeredTournaments: [],
                suppressedSeated: {},
                dismissedAt: {},
            }),
    })
);
