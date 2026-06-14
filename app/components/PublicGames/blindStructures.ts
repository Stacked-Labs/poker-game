// Blind-structure templates, mirrored from the backend.
//
// SOURCE OF TRUTH: poker-server/tournament/blind_structures.go
// These four `BlindStructure` vars are the canonical ladders the engine runs.
// Keep this file in sync if the backend templates change. The live clock
// (tournament-clock WS / REST /clock) always supplies the *current* blinds; this
// constant exists for forward-looking display (structure sheet, next-level
// preview, late-reg depth) and pre-start, where no running clock exists yet.
//
// Past the last defined level the backend pads with doubling levels
// (ExtendStructure → up to 100 levels) so blinds never plateau. We do NOT mirror
// that doubling — real events rarely reach it and the live clock supplies the
// true blinds regardless. We show BLINDS_KEEP_RISING_NOTE instead.

export type TemplateName = 'hyper' | 'turbo' | 'regular' | 'deep';

export interface BlindLevel {
    /** 1-based level number, for display. */
    level: number;
    sb: number;
    bb: number;
    /** Big-blind ante. 0 on the early levels (BBA model). */
    ante: number;
    durationMin: number;
}

// [smallBlind, bigBlind, bigBlindAnte] per level, level 1 first.
type Row = [sb: number, bb: number, ante: number];

function build(rows: Row[], durationMin: number): BlindLevel[] {
    return rows.map(([sb, bb, ante], i) => ({
        level: i + 1,
        sb,
        bb,
        ante,
        durationMin,
    }));
}

// 5-minute levels.
const HYPER_ROWS: Row[] = [
    [25, 50, 0],
    [50, 100, 100],
    [100, 200, 200],
    [150, 300, 300],
    [200, 400, 400],
    [300, 600, 600],
    [500, 1000, 1000],
    [700, 1400, 1400],
    [1000, 2000, 2000],
    [1500, 3000, 3000],
    [2000, 4000, 4000],
    [3000, 6000, 6000],
    [5000, 10000, 10000],
    [7500, 15000, 15000],
    [10000, 20000, 20000],
];

// 10-minute levels.
const TURBO_ROWS: Row[] = [
    [25, 50, 0],
    [50, 100, 100],
    [75, 150, 150],
    [100, 200, 200],
    [150, 300, 300],
    [200, 400, 400],
    [300, 600, 600],
    [400, 800, 800],
    [600, 1200, 1200],
    [800, 1600, 1600],
    [1000, 2000, 2000],
    [1500, 3000, 3000],
    [2000, 4000, 4000],
    [3000, 6000, 6000],
    [4000, 8000, 8000],
];

// 20-minute levels (Turbo's ladder, extended deeper).
const REGULAR_ROWS: Row[] = [
    ...TURBO_ROWS,
    [6000, 12000, 12000],
    [8000, 16000, 16000],
    [10000, 20000, 20000],
];

// 30-minute levels; gentler early jumps and the ante delayed to level 3.
const DEEP_ROWS: Row[] = [
    [25, 50, 0],
    [50, 100, 0],
    [75, 150, 150],
    [100, 200, 200],
    [150, 300, 300],
    [200, 400, 400],
    [300, 600, 600],
    [500, 1000, 1000],
    [700, 1400, 1400],
    [1000, 2000, 2000],
    [1500, 3000, 3000],
    [2000, 4000, 4000],
    [3000, 6000, 6000],
    [4000, 8000, 8000],
    [6000, 12000, 12000],
    [8000, 16000, 16000],
    [10000, 20000, 20000],
    [15000, 30000, 30000],
];

export const BLIND_TEMPLATES: Record<TemplateName, BlindLevel[]> = {
    hyper: build(HYPER_ROWS, 5),
    turbo: build(TURBO_ROWS, 10),
    regular: build(REGULAR_ROWS, 20),
    deep: build(DEEP_ROWS, 30),
};

export const TEMPLATE_LABELS: Record<TemplateName, string> = {
    hyper: 'Hyper',
    turbo: 'Turbo',
    regular: 'Regular',
    deep: 'Deep',
};

export const TEMPLATE_FEEL: Record<TemplateName, string> = {
    hyper: 'Ultra-fast',
    turbo: 'Fast',
    regular: 'Standard',
    deep: 'Slow · deep',
};

export const BLINDS_KEEP_RISING_NOTE =
    'Blinds keep rising past the last level until the tournament ends.';

// Mirrors the backend's StructureByName default (unknown → turbo).
export function normalizeTemplate(name?: string | null): TemplateName {
    switch ((name ?? '').toLowerCase()) {
        case 'hyper':
            return 'hyper';
        case 'regular':
            return 'regular';
        case 'deep':
            return 'deep';
        default:
            return 'turbo';
    }
}

export function getStructure(name?: string | null): BlindLevel[] {
    return BLIND_TEMPLATES[normalizeTemplate(name)];
}

// ── Rest breaks ──────────────────────────────────────────────────────────
//
// MIRROR of the backend cadence rule in poker-server/tournament/blind_structures.go
// (breakEveryNLevels = round(targetPlaySeconds / levelDurationSeconds)).
// SOURCE OF TRUTH is the server; this mirror only drives the *pre-live* structure
// sheet (before any clock exists). Once a live clock arrives, prefer the server's
// `next_break_after_level`. Keep these two in lockstep — assumes uniform level
// durations (all four presets are; see plan §4.1). The cadence-mirror story
// (StructureSheet.stories) asserts this equals 12 / 6 / 3 / 2 so drift fails loud.

/** A break lands after roughly every 60 minutes of play. */
const BREAK_TARGET_PLAY_MIN = 60;
/** Fixed break length, mirrored from the backend (restBreakDuration = 5m). */
export const BREAK_DURATION_MIN = 5;

/**
 * Number of levels between rest breaks for a template. Derived from the
 * (uniform) level duration: round(60 / levelDurationMin), floored at 1.
 */
export function breakEveryNLevels(name?: string | null): number {
    const durationMin = levelDurationMin(name);
    return Math.max(1, Math.round(BREAK_TARGET_PLAY_MIN / durationMin));
}

/**
 * The level indices a break follows, for the *defined* portion of the ladder
 * (1-based "break after level N"). E.g. Regular → [3, 6, 9, …]. The backend keeps
 * firing breaks on cadence through the padded doubling levels; the sheet only
 * draws the defined ladder, so we cap at the last defined level. No break is ever
 * appended after the final level.
 */
export function breakAfterLevels(name?: string | null): number[] {
    const every = breakEveryNLevels(name);
    const lastLevel = definedLevelCount(name);
    const out: number[] = [];
    for (let n = every; n < lastLevel; n += every) out.push(n);
    return out;
}

export function templateLabel(name?: string | null): string {
    return TEMPLATE_LABELS[normalizeTemplate(name)];
}

export function levelDurationMin(name?: string | null): number {
    return getStructure(name)[0].durationMin;
}

export function definedLevelCount(name?: string | null): number {
    return getStructure(name).length;
}

/**
 * The level at position `n` (1-based). Clamped into range; positions past the
 * last defined level return the last defined level (the backend keeps doubling,
 * but for display we cap at the table we know).
 */
export function levelAt(name: string | null | undefined, n: number): BlindLevel {
    const s = getStructure(name);
    const idx = Math.min(Math.max(1, n), s.length) - 1;
    return s[idx];
}

/** The upcoming level after `n`, or null if `n` is the last defined level. */
export function nextLevel(
    name: string | null | undefined,
    n: number
): BlindLevel | null {
    const s = getStructure(name);
    return n >= 1 && n < s.length ? s[n] : null;
}

/** Starting stack expressed in big blinds at level 1 (e.g. 10,000 / 50 = 200). */
export function startingBigBlinds(
    startingStack: number,
    name?: string | null
): number {
    const bb = getStructure(name)[0].bb;
    return bb > 0 ? Math.floor(startingStack / bb) : 0;
}

/**
 * Big-blind depth a late entrant sits with when late registration closes.
 * `lateRegLevels` is 0–3 ("closes after level N"); we read the BB at that level.
 */
export function bbAtLateRegClose(
    startingStack: number,
    name: string | null | undefined,
    lateRegLevels: number
): number {
    const bb = levelAt(name, Math.max(1, lateRegLevels)).bb;
    return bb > 0 ? Math.floor(startingStack / bb) : 0;
}
