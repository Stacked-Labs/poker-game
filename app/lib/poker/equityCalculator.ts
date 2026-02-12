import { decodeEvalCardInt, evaluateBest5, EvalCard } from './pokerHandEval';

export type EquityInput = {
    uuid: string;
    hole: number[]; // Two raw server-encoded hole cards
};

export type EquityResult = {
    uuid: string;
    equity: number; // 0–100
};

// Full 52-card deck as raw server-encoded integers.
// Encoding: rank in bits 8-11 (0=2 .. 12=A), suit in bits 12-15
// Suits: 0x8000=clubs, 0x4000=diamonds, 0x2000=hearts, 0x1000=spades
const FULL_DECK: number[] = (() => {
    const suits = [0x8000, 0x4000, 0x2000, 0x1000];
    const deck: number[] = [];
    for (const suit of suits) {
        for (let rank = 0; rank <= 12; rank++) {
            deck.push(suit | (rank << 8));
        }
    }
    return deck;
})();

// Fisher-Yates shuffle (in-place, partial – only shuffles first `count` elements)
function shufflePartial(arr: number[], count: number): void {
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (arr.length - i));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

/**
 * Monte Carlo equity calculator.
 *
 * @param players  Array of players with visible hole cards (raw server ints)
 * @param board    Current community cards (raw server ints, only positive/known)
 * @param iterations Number of random simulations to run (default 2000)
 * @returns Array of { uuid, equity } for each input player
 */
export function calculateEquity(
    players: EquityInput[],
    board: number[],
    iterations = 2000
): EquityResult[] {
    if (players.length < 2) {
        return players.map((p) => ({ uuid: p.uuid, equity: 100 }));
    }

    // Decode all known cards once
    const knownSet = new Set<number>();
    const playerHoles: EvalCard[][] = [];

    for (const p of players) {
        const cards: EvalCard[] = [];
        for (const raw of p.hole) {
            knownSet.add(raw);
            const decoded = decodeEvalCardInt(raw);
            if (decoded) cards.push(decoded);
        }
        playerHoles.push(cards);
    }

    const boardCards: EvalCard[] = [];
    for (const raw of board) {
        knownSet.add(raw);
        const decoded = decodeEvalCardInt(raw);
        if (decoded) boardCards.push(decoded);
    }

    const boardNeeded = 5 - boardCards.length;

    // Build remaining deck (exclude all known cards)
    const remainingDeck = FULL_DECK.filter((c) => !knownSet.has(c));

    // Pre-decode the remaining deck for fast access
    const remainingDecoded: EvalCard[] = remainingDeck.map(
        (raw) => decodeEvalCardInt(raw)!
    );

    // Track wins per player index
    const wins = new Float64Array(players.length);
    const numPlayers = players.length;

    // Working copy of remaining deck indices for shuffling
    const deckIndices: number[] = remainingDecoded.map((_, i) => i);

    for (let iter = 0; iter < iterations; iter++) {
        // Shuffle just enough indices to fill the board
        shufflePartial(deckIndices, boardNeeded);

        // Build the simulated board
        const simBoard: EvalCard[] = boardCards.slice();
        for (let b = 0; b < boardNeeded; b++) {
            simBoard.push(remainingDecoded[deckIndices[b]]);
        }

        // Evaluate each player's hand
        let bestTuple: number[] | null = null;
        let bestIndices: number[] = [];

        for (let pi = 0; pi < numPlayers; pi++) {
            const allCards = [...playerHoles[pi], ...simBoard];
            const result = evaluateBest5(allCards);
            const tuple = result.rankTuple;

            if (!bestTuple) {
                bestTuple = tuple;
                bestIndices = [pi];
            } else {
                const cmp = compareTuples(tuple, bestTuple);
                if (cmp > 0) {
                    bestTuple = tuple;
                    bestIndices = [pi];
                } else if (cmp === 0) {
                    bestIndices.push(pi);
                }
            }
        }

        // Distribute credit (ties split)
        const share = 1 / bestIndices.length;
        for (const idx of bestIndices) {
            wins[idx] += share;
        }
    }

    return players.map((p, i) => ({
        uuid: p.uuid,
        equity: Math.round((wins[i] / iterations) * 100),
    }));
}

function compareTuples(a: number[], b: number[]): number {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
        const av = a[i] ?? 0;
        const bv = b[i] ?? 0;
        if (av !== bv) return av > bv ? 1 : -1;
    }
    return 0;
}
