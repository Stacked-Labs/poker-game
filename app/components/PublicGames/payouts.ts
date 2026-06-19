// Tournament payout ladder, mirrored from the backend.
//
// SOURCE OF TRUTH: poker-server/tournament/payout.go (DefaultPayouts +
// CalculatePayouts). There is NO projected-payout endpoint, so the client
// computes the projected ladder from the field size + prize pool. Two rules MUST
// match the backend exactly so projected/your-prize numbers equal the on-chain
// payout:
//   1. A tier's percent is PER-POSITION, not split across the tier:
//      {min:7,max:9,percent:4} → positions 7, 8 AND 9 each receive 4%.
//   2. Each position's micro-USDC amount is floored; the rounding residual is
//      added to 1st place so the full pool is always distributed.
//
// All amounts are micro-USDC (1e6 = $1), matching prize_pool_usdc.

export interface PayoutTier {
    /** inclusive, 1-based */
    min: number;
    /** inclusive */
    max: number;
    /** percent of the total pool, PER position in [min, max] */
    percent: number;
}

/**
 * Field-size → payout structure. Mirrors DefaultPayouts(entrants). Roughly the
 * top ~15% of the field is paid.
 */
export function defaultPayouts(entrants: number): PayoutTier[] {
    if (entrants <= 2) return [{ min: 1, max: 1, percent: 100 }];
    if (entrants <= 6)
        return [
            { min: 1, max: 1, percent: 70 },
            { min: 2, max: 2, percent: 30 },
        ];
    if (entrants <= 9)
        return [
            { min: 1, max: 1, percent: 50 },
            { min: 2, max: 2, percent: 30 },
            { min: 3, max: 3, percent: 20 },
        ];
    if (entrants <= 18)
        return [
            { min: 1, max: 1, percent: 45 },
            { min: 2, max: 2, percent: 28 },
            { min: 3, max: 3, percent: 17 },
            { min: 4, max: 4, percent: 10 },
        ];
    if (entrants <= 27)
        return [
            { min: 1, max: 1, percent: 40 },
            { min: 2, max: 2, percent: 25 },
            { min: 3, max: 3, percent: 15 },
            { min: 4, max: 4, percent: 10 },
            { min: 5, max: 5, percent: 7 },
            { min: 6, max: 6, percent: 3 },
        ];
    if (entrants <= 54)
        return [
            { min: 1, max: 1, percent: 34 },
            { min: 2, max: 2, percent: 20 },
            { min: 3, max: 3, percent: 13 },
            { min: 4, max: 4, percent: 9 },
            { min: 5, max: 5, percent: 7 },
            { min: 6, max: 6, percent: 5 },
            { min: 7, max: 9, percent: 4 },
        ];
    return [
        { min: 1, max: 1, percent: 30 },
        { min: 2, max: 2, percent: 18 },
        { min: 3, max: 3, percent: 12 },
        { min: 4, max: 4, percent: 8 },
        { min: 5, max: 5, percent: 6 },
        { min: 6, max: 6, percent: 5 },
        { min: 7, max: 9, percent: 4 },
        { min: 10, max: 18, percent: 1 },
    ];
}

/**
 * Provisional prize pool while registration is open. The backend only freezes
 * prize_pool_usdc at start (it arrives as 0/absent before then), so the client
 * mirrors the contract/coordinator pool math from the live field —
 * gross = entries · buyIn, pool = (gross − rake) floored at the guarantee — so
 * projected payouts grow with entries and correctly overtake the guarantee once
 * buy-ins exceed it, instead of staying pinned to the GTD. All micro-USDC; this
 * matches the value the API later returns once the tournament is running.
 */
export function projectedPrizePoolUsdc(
    entrants: number,
    buyInMicro: number,
    feeBps: number,
    guaranteeMicro: number
): number {
    const gross = Math.max(0, entrants) * buyInMicro;
    const rake = Math.floor((gross * feeBps) / 10_000);
    return Math.max(gross - rake, guaranteeMicro);
}

/** Number of paid finishing positions for a field size. */
export function placesPaid(entrants: number): number {
    const tiers = defaultPayouts(entrants);
    return tiers.length === 0 ? 0 : tiers[tiers.length - 1].max;
}

/** Per-position payout percent for a finish position (0 if out of the money). */
export function percentForPosition(pos: number, entrants: number): number {
    for (const t of defaultPayouts(entrants)) {
        if (pos >= t.min && pos <= t.max) return t.percent;
    }
    return 0;
}

/**
 * Distribute `poolMicro` across finish positions. Mirrors CalculatePayouts:
 * per-position percent, floored, residual to 1st. Returns position → micro-USDC.
 */
export function calculatePayouts(
    entrants: number,
    poolMicro: number
): Map<number, number> {
    const result = new Map<number, number>();
    if (poolMicro <= 0) return result;
    let allocated = 0;
    for (const tier of defaultPayouts(entrants)) {
        for (let pos = tier.min; pos <= tier.max; pos++) {
            const amt = Math.floor((poolMicro * tier.percent) / 100);
            result.set(pos, amt);
            allocated += amt;
        }
    }
    const diff = poolMicro - allocated;
    if (diff !== 0 && result.size > 0) {
        result.set(1, (result.get(1) ?? 0) + diff);
    }
    return result;
}

/** Micro-USDC a given finish position wins (0 if out of the money). */
export function payoutForPosition(
    pos: number,
    entrants: number,
    poolMicro: number
): number {
    return calculatePayouts(entrants, poolMicro).get(pos) ?? 0;
}

export function isInTheMoney(rank: number, entrants: number): boolean {
    return rank >= 1 && rank <= placesPaid(entrants);
}

/** The guaranteed minimum cash (the lowest paid place). */
export function minCash(entrants: number, poolMicro: number): number {
    return payoutForPosition(placesPaid(entrants), entrants, poolMicro);
}

/** Spots between the current survivor count and the money (0 once in the money). */
export function distanceToMoney(playersLeft: number, entrants: number): number {
    return Math.max(0, playersLeft - placesPaid(entrants));
}

export interface PayJump {
    /** The finish position whose prize is the next step up from `rank`. */
    targetPos: number;
    /** Micro-USDC gained by climbing from `rank` to `targetPos`. */
    gainMicro: number;
    /** How many places `rank` must climb to reach `targetPos`. */
    placesAway: number;
}

/**
 * The next increase in *your* prize. Out of the money → reaching min-cash. In the
 * money → the next position whose per-position payout is strictly higher (skips
 * tied positions, e.g. 7–9 all pay the same, so from 9 the next jump is 6).
 * Returns null when already 1st.
 */
export function nextPayJump(
    rank: number,
    entrants: number,
    poolMicro: number
): PayJump | null {
    if (rank <= 1) return null;
    const paid = placesPaid(entrants);
    if (rank > paid) {
        return {
            targetPos: paid,
            gainMicro: minCash(entrants, poolMicro),
            placesAway: rank - paid,
        };
    }
    const current = payoutForPosition(rank, entrants, poolMicro);
    for (let p = rank - 1; p >= 1; p--) {
        const amt = payoutForPosition(p, entrants, poolMicro);
        if (amt > current) {
            return {
                targetPos: p,
                gainMicro: amt - current,
                placesAway: rank - p,
            };
        }
    }
    return null;
}
