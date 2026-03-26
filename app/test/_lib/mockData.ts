/**
 * Mock data for the /test UI harness.
 *
 * Cards use the riverboat/eval 32-bit encoding:
 *   bits 8-11 = rank index (0=2 … 12=A)
 *   bits 12-15 = suit mask (0x8000=C, 0x4000=D, 0x2000=H, 0x1000=S)
 */

import type { Game, Player, Config } from '@/app/interfaces';

// ─── Card encoding helper ──────────────────────────────────────────────────
export function C(rank: number, suit: 'c' | 'd' | 'h' | 's'): number {
    const ri = rank - 2; // 0..12
    const sm =
        suit === 'c'
            ? 0x8000
            : suit === 'd'
              ? 0x4000
              : suit === 'h'
                ? 0x2000
                : 0x1000;
    return (ri << 8) | sm;
}

// Commonly used cards
export const CARDS = {
    As: C(14, 's'),
    Ah: C(14, 'h'),
    Ad: C(14, 'd'),
    Ac: C(14, 'c'),
    Ks: C(13, 's'),
    Kh: C(13, 'h'),
    Kd: C(13, 'd'),
    Kc: C(13, 'c'),
    Qs: C(12, 's'),
    Qh: C(12, 'h'),
    Qd: C(12, 'd'),
    Qc: C(12, 'c'),
    Js: C(11, 's'),
    Jh: C(11, 'h'),
    Jd: C(11, 'd'),
    Ts: C(10, 's'),
    Th: C(10, 'h'),
    Td: C(10, 'd'),
    _9s: C(9, 's'),
    _9h: C(9, 'h'),
    _9d: C(9, 'd'),
    _8c: C(8, 'c'),
    _8h: C(8, 'h'),
    _7d: C(7, 'd'),
    _7h: C(7, 'h'),
    _6c: C(6, 'c'),
    _5s: C(5, 's'),
    _4h: C(4, 'h'),
    _3d: C(3, 'd'),
    _2c: C(2, 'c'),
    _2h: C(2, 'h'),
} as const;

// ─── Player UUIDs (realistic-looking ETH addresses) ───────────────────────
// Shows as "0x…NN" in the seat UI (slice(0,2) + "..." + slice(-2))
export const PLAYER_IDS = [
    '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA001', // seat 1  → "0x…01"
    '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB002', // seat 2  → "0x…02"
    '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC003', // seat 3  → "0x…03"
    '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD004', // seat 4  → "0x…04"
    '0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE005', // seat 5  → "0x…05"
    '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF006', // seat 6  → "0x…06"
    '0x1111111111111111111111111111111111111107', // seat 7  → "0x…07"
    '0x2222222222222222222222222222222222222208', // seat 8  → "0x…08"
    '0x3333333333333333333333333333333333333309', // seat 9  → "0x…09"
    '0x4444444444444444444444444444444444444410', // seat 10 → "0x…10"
] as const;

// The "self" client — visual seat 1 maps to this player
export const SELF_ID = PLAYER_IDS[0];

// ─── Shared config ─────────────────────────────────────────────────────────
const cfg: Config = { maxBuyIn: 2000, bb: 20, sb: 10 };

const EMPTY_POT = {
    topShare: 0,
    amount: 0,
    eligiblePlayerNums: [],
    winningPlayerNums: [],
    winningScore: 0,
};

// ─── Player factory ────────────────────────────────────────────────────────
function mkPlayer(
    seatID: number,
    position: number,
    overrides: Partial<Player> = {}
): Player {
    const id = PLAYER_IDS[seatID - 1];
    return {
        username: id,
        uuid: id,
        address: id,
        position,
        seatID,
        ready: false,
        in: false,
        called: false,
        left: false,
        totalBuyIn: 1000,
        stack: 1000,
        bet: 0,
        totalBet: 0,
        cards: [],
        hasRevealed: false,
        readyNextHand: false,
        sitOutNextHand: false,
        leaveAfterHand: false,
        isOnline: true,
        ...overrides,
    };
}

// ─── Scenario 1 — Idle / Pre-game ─────────────────────────────────────────
// Players seated, game not started. Shows: ready, away, offline, joining states.
export const scenarioIdle: Game = {
    running: false,
    dealer: 0,
    action: 0,
    utg: 0,
    sb: 0,
    bb: 0,
    communityCards: [],
    stage: 0,
    betting: false,
    config: cfg,
    players: [
        mkPlayer(1, 0, { ready: true, stack: 1500 }),          // you – ready
        mkPlayer(2, 1, { ready: true, stack: 900 }),            // ready
        mkPlayer(3, 2, { ready: false, stack: 2000 }),          // away (not ready)
        mkPlayer(4, 3, { ready: false, stack: 350 }),           // away
        mkPlayer(5, 4, { ready: false, readyNextHand: true, stack: 1200 }), // joining…
        mkPlayer(7, 5, { ready: false, isOnline: false, stack: 800 }),     // offline
        mkPlayer(9, 6, { ready: true, stack: 600 }),            // ready
    ],
    pots: [EMPTY_POT],
    minRaise: 40,
    readyCount: 3,
    paused: false,
    actionDeadline: 0,
};

// ─── Scenario 2 — Preflop Betting ─────────────────────────────────────────
// 9 players, game running, dealer chip visible, bets posted.
// Shows: dealer badge, bet bubbles, check bubble, timer, sit-out-next, leave-after.
export const scenarioPreflop: Game = {
    running: true,
    dealer: 0,   // position 0 = seat 1 (self)
    action: 2,   // seat 3 is current turn (has timer)
    utg: 3,
    sb: 1,
    bb: 2,
    communityCards: [],
    stage: 2,
    betting: true,
    config: cfg,
    players: [
        // Seat 1 = self = dealer, no bet yet (just dealt)
        mkPlayer(1, 0, { ready: true, in: true, stack: 1500, cards: [CARDS.As, CARDS.Kh] }),
        // Seat 2 = SB
        mkPlayer(2, 1, { ready: true, in: true, stack: 985, bet: 10, totalBet: 10, cards: [0, 0] }),
        // Seat 3 = BB — current turn (has action timer)
        mkPlayer(3, 2, { ready: true, in: true, stack: 970, bet: 20, totalBet: 20, cards: [0, 0] }),
        // Seat 4 = UTG — raised to 60
        mkPlayer(4, 3, { ready: true, in: true, stack: 930, bet: 60, totalBet: 60, cards: [0, 0] }),
        // Seat 5 — called
        mkPlayer(5, 4, { ready: true, in: true, stack: 940, bet: 60, totalBet: 60, called: true, cards: [0, 0] }),
        // Seat 6 — folded
        mkPlayer(6, 5, { ready: true, in: false, stack: 1000, cards: [] }),
        // Seat 7 — called, sitting out next hand
        mkPlayer(7, 6, { ready: true, in: true, stack: 940, bet: 60, totalBet: 60, called: true, sitOutNextHand: true, cards: [0, 0] }),
        // Seat 8 — leaving after this hand
        mkPlayer(8, 7, { ready: true, in: true, stack: 940, bet: 60, totalBet: 60, called: true, leaveAfterHand: true, cards: [0, 0] }),
        // Seat 10 — offline but still in
        mkPlayer(10, 8, { ready: true, in: true, stack: 940, bet: 60, totalBet: 60, called: true, isOnline: false, cards: [0, 0] }),
    ],
    pots: [{ topShare: 270, amount: 270, eligiblePlayerNums: [0, 1, 2, 3, 4, 6, 7, 8], winningPlayerNums: [], winningScore: 0 }],
    minRaise: 60,
    readyCount: 9,
    paused: false,
    actionDeadline: Date.now() + 24000, // ~24s left
};

// ─── Scenario 3 — Postflop (Turn card) ────────────────────────────────────
// 4 players remain after preflop folds, turn card down, active betting.
// Shows: community cards, bets, check bubble, timer, hand-strength badge (for self).
export const scenarioPostflop: Game = {
    running: true,
    dealer: 4,  // seat 5
    action: 1,  // seat 2 current action
    utg: 0,
    sb: 2,
    bb: 3,
    communityCards: [CARDS.Ah, CARDS.Kd, CARDS._9s, CARDS.Td],
    stage: 2,
    betting: true,
    config: cfg,
    players: [
        // Seat 1 = self, checked
        mkPlayer(1, 0, {
            ready: true, in: true, called: true, bet: 0, totalBet: 80, stack: 1080,
            cards: [CARDS.As, CARDS.Qs], // top pair + top kicker
        }),
        // Seat 2 = current action
        mkPlayer(2, 1, { ready: true, in: true, stack: 720, bet: 0, totalBet: 80, cards: [0, 0] }),
        // Seat 3 = bet 150
        mkPlayer(3, 2, { ready: true, in: true, stack: 570, bet: 150, totalBet: 230, cards: [0, 0] }),
        // Seat 5 = dealer, called
        mkPlayer(5, 4, { ready: true, in: true, called: true, stack: 670, bet: 0, totalBet: 80, cards: [0, 0] }),
        // Other seats are out (folded pre-flop)
        mkPlayer(4, 3, { ready: true, in: false, stack: 1000 }),
        mkPlayer(6, 5, { ready: true, in: false, stack: 850 }),
        mkPlayer(7, 6, { ready: true, in: false, stack: 940 }),
        mkPlayer(8, 7, { ready: true, in: false, stack: 1100 }),
        mkPlayer(9, 8, { ready: true, in: false, stack: 760 }),
        mkPlayer(10, 9, { ready: true, in: false, stack: 1250 }),
    ],
    pots: [{ topShare: 400, amount: 400, eligiblePlayerNums: [0, 1, 2, 4], winningPlayerNums: [], winningScore: 0 }],
    minRaise: 300,
    readyCount: 10,
    paused: false,
    actionDeadline: Date.now() + 17000,
};

// ─── Scenario 4 — Showdown ─────────────────────────────────────────────────
// 3 players to showdown, river complete, winner determined.
// Shows: cards revealed, winning hand badge, hand-strength badge, winner glow,
//        equity badges (passed manually via equityMap in TestTable).
export const scenarioShowdown: Game = {
    running: true,
    dealer: 3,  // seat 4
    action: 0,
    utg: 5,
    sb: 4,
    bb: 5,
    // Board: Ac Kd 9s Td 7h  → seat 1 flops trip aces with Ah Ad
    communityCards: [CARDS.Ac, CARDS.Kd, CARDS._9s, CARDS.Td, CARDS._7h],
    stage: 1,     // showdown
    betting: false,
    config: cfg,
    players: [
        // Seat 1 = self — Ah Ad + Ac board → trip Aces (best hand)
        mkPlayer(1, 0, {
            ready: true, in: true, hasRevealed: true, stack: 0, bet: 0, totalBet: 500,
            cards: [CARDS.Ah, CARDS.Ad],
        }),
        // Seat 3 — Kh Kc → two pair KK+AA (board Ac Kd)
        mkPlayer(3, 2, {
            ready: true, in: true, hasRevealed: true, stack: 0, bet: 0, totalBet: 500,
            cards: [CARDS.Kh, CARDS.Kc],
        }),
        // Seat 6 — Qh Qs → one pair QQ (loses)
        mkPlayer(6, 5, {
            ready: true, in: true, hasRevealed: true, stack: 0, bet: 0, totalBet: 500,
            cards: [CARDS.Qh, CARDS.Qs],
        }),
        // Others folded
        mkPlayer(2, 1, { ready: true, in: false, stack: 900 }),
        mkPlayer(4, 3, { ready: true, in: false, stack: 1000 }),
        mkPlayer(5, 4, { ready: true, in: false, stack: 800 }),
        mkPlayer(7, 6, { ready: true, in: false, stack: 1100 }),
        mkPlayer(8, 7, { ready: true, in: false, stack: 750 }),
    ],
    pots: [{
        topShare: 1500,
        amount: 1500,
        eligiblePlayerNums: [0, 2, 5],
        winningPlayerNums: [0], // seat-1 player (position 0) wins
        winningScore: 9999,
        // winningHand lists the card ints in the player's best-5 — hole cards
        // included so TakenSeatButton knows which cards to highlight golden
        winners: [{ playerNum: 0, uuid: PLAYER_IDS[0], share: 1500, winningHand: [CARDS.Ah, CARDS.Ad, CARDS.Ac, CARDS.Kd, CARDS.Td] }],
    }],
    minRaise: 0,
    readyCount: 8,
    paused: false,
    actionDeadline: 0,
};

// ─── Scenario 5 — State Showcase ──────────────────────────────────────────
// Every seat shows a distinct state so you can review each badge/mode at once.
// 10 seats, all filled, game running but betting=false (between hands).
export const scenarioStates: Game = {
    running: true,
    dealer: 9, // seat 10
    action: 0,
    utg: 0,
    sb: 1,
    bb: 2,
    communityCards: [],
    stage: 2,
    betting: false,
    config: cfg,
    players: [
        // 1 — Self, current turn  (pink pulse + timer)
        mkPlayer(1, 0, { ready: true, in: true, stack: 1400, bet: 0, cards: [] }),
        // 2 — Offline
        mkPlayer(2, 1, { ready: true, in: false, isOnline: false, stack: 880 }),
        // 3 — Away (not ready, no readyNextHand)
        mkPlayer(3, 2, { ready: false, in: false, stack: 650 }),
        // 4 — Joining next hand (readyNextHand=true)
        mkPlayer(4, 3, { ready: false, readyNextHand: true, in: false, stack: 1200 }),
        // 5 — Sit-out next hand
        mkPlayer(5, 4, { ready: true, sitOutNextHand: true, in: false, stack: 990 }),
        // 6 — Leaving after hand
        mkPlayer(6, 5, { ready: true, leaveAfterHand: true, in: false, stack: 300 }),
        // 7 — Has a bet (yellow bubble)
        mkPlayer(7, 6, { ready: true, in: true, stack: 860, bet: 80, totalBet: 80 }),
        // 8 — Checked (frosted bubble)
        mkPlayer(8, 7, { ready: true, in: true, called: true, stack: 920, bet: 0, totalBet: 20 }),
        // 9 — Winner (green glow) — set via isWinner prop in TestTable
        mkPlayer(9, 8, { ready: true, in: true, stack: 2100 }),
        // 10 — Dealer chip (D badge, no bet)
        mkPlayer(10, 9, { ready: true, in: true, stack: 1050 }),
    ],
    pots: [{ topShare: 200, amount: 200, eligiblePlayerNums: [0, 6, 7, 8, 9], winningPlayerNums: [8], winningScore: 100, winners: [{ playerNum: 8, uuid: PLAYER_IDS[8], share: 200 }] }],
    minRaise: 160,
    readyCount: 10,
    paused: false,
    actionDeadline: Date.now() + 20000,
};

// ─── Scenario 6 — Blind Obligation (owes SB) ──────────────────────────────
// Player 1 (self) sat out while holding the SB position last hand.
// They are now back at the table between hands and owe a small blind.
// Shows: BlindObligationControls with all three options (Wait BB / Post now / Sit out).
export const scenarioBlindObligation: Game = {
    running: false,
    dealer: 0,
    action: 0,
    utg: 0,
    sb: 0,
    bb: 0,
    communityCards: [],
    stage: 0,
    betting: false,
    config: cfg,
    players: [
        // Seat 1 = self — missed SB, sitting out (not ready), owes SB
        mkPlayer(1, 0, { ready: false, stack: 990 }),
        // Seat 2 — ready, will be SB next hand
        mkPlayer(2, 1, { ready: true, stack: 1000 }),
        // Seat 3 — ready, will be BB next hand
        mkPlayer(3, 2, { ready: true, stack: 1000 }),
    ],
    pots: [EMPTY_POT],
    minRaise: 20,
    readyCount: 2,
    paused: false,
    actionDeadline: 0,
    owesSB: [true, false, false],
    owesBB: [false, false, false],
    waitingForBB: [false, false, false],
};

// ─── Scenario 7 — Blind Obligation (waiting for BB) ───────────────────────
// Player 1 (self) owes SB and has already chosen "Wait for BB".
// Shows: BlindObligationControls in the "waiting" state (Wait for BB button disabled/active).
export const scenarioWaitingForBB: Game = {
    running: false,
    dealer: 0,
    action: 0,
    utg: 0,
    sb: 0,
    bb: 0,
    communityCards: [],
    stage: 0,
    betting: false,
    config: cfg,
    players: [
        mkPlayer(1, 0, { ready: false, stack: 990 }),
        mkPlayer(2, 1, { ready: true, stack: 1000 }),
        mkPlayer(3, 2, { ready: true, stack: 1000 }),
    ],
    pots: [EMPTY_POT],
    minRaise: 20,
    readyCount: 2,
    paused: false,
    actionDeadline: 0,
    owesSB: [true, false, false],
    owesBB: [false, false, false],
    waitingForBB: [true, false, false],
};

// ─── Scenario registry ─────────────────────────────────────────────────────
export type ScenarioKey = 'idle' | 'preflop' | 'postflop' | 'showdown' | 'states' | 'blind_obligation' | 'waiting_for_bb';

export const SCENARIOS: Record<ScenarioKey, { label: string; description: string; game: Game }> = {
    idle: {
        label: 'Idle',
        description: 'Pre-game lobby — mixed ready / away / offline / joining states',
        game: scenarioIdle,
    },
    preflop: {
        label: 'Preflop',
        description: 'Active hand — dealer chip, bets, timer, sit-out-next, leaving',
        game: scenarioPreflop,
    },
    postflop: {
        label: 'Postflop',
        description: 'Turn card down — community cards, check bubble, hand-strength badge',
        game: scenarioPostflop,
    },
    showdown: {
        label: 'Showdown',
        description: 'All cards revealed — winner glow, hand labels, card dimming',
        game: scenarioShowdown,
    },
    states: {
        label: 'All States',
        description: 'Every seat badge / state visible at once for quick comparison',
        game: scenarioStates,
    },
    blind_obligation: {
        label: 'Owes SB',
        description: 'Player 1 (self) missed the SB and must decide: post now, wait for BB, or sit out',
        game: scenarioBlindObligation,
    },
    waiting_for_bb: {
        label: 'Waiting BB',
        description: 'Player 1 (self) owes SB and has chosen to wait for their BB seat',
        game: scenarioWaitingForBB,
    },
};

export const SCENARIO_KEYS = Object.keys(SCENARIOS) as ScenarioKey[];
