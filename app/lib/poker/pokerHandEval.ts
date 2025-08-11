export type Suit = 'c' | 'd' | 'h' | 's';

export type EvalCard = { rank: number; suit: Suit; raw: number };

export type HandCategory =
    | 'High Card'
    | 'One Pair'
    | 'Two Pair'
    | 'Three of a Kind'
    | 'Straight'
    | 'Flush'
    | 'Full House'
    | 'Four of a Kind'
    | 'Straight Flush'
    | 'Royal Flush';

export type EvalResult = {
    category: HandCategory;
    best5: EvalCard[];
    rankTuple: number[];
};

const CATEGORY_ORDER: Exclude<HandCategory, 'Royal Flush'>[] = [
    'High Card',
    'One Pair',
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush',
];

function categoryScore(cat: Exclude<HandCategory, 'Royal Flush'>): number {
    return CATEGORY_ORDER.indexOf(cat);
}

function byRankDesc(a: number, b: number): number {
    return b - a;
}

// Decode riverboat/eval 32-bit card int
export function decodeEvalCardInt(raw: number): EvalCard | null {
    if (!raw) return null; // 0 => no card
    const rankIndex = (raw >>> 8) & 0x0f; // 0..12
    const rank = rankIndex + 2; // 2..14
    const suitMask = raw & 0xf000; // 0x8000 C, 0x4000 D, 0x2000 H, 0x1000 S
    const suit: Suit =
        suitMask === 0x8000
            ? 'c'
            : suitMask === 0x4000
              ? 'd'
              : suitMask === 0x2000
                ? 'h'
                : 's';
    return { rank, suit, raw };
}

// Evaluate a 5-card hand into [categoryScore, primary, secondary, ...kickers]
function evaluate5(cards: EvalCard[]): {
    cat: Exclude<HandCategory, 'Royal Flush'>;
    tuple: number[];
} {
    const ranks = cards.map((c) => c.rank).sort(byRankDesc);
    const suits = cards.map((c) => c.suit);
    // counts per rank (object, ES5-compatible)
    const counts: { [rank: number]: number } = {};
    for (let i = 0; i < ranks.length; i++) {
        const r = ranks[i];
        counts[r] = (counts[r] || 0) + 1;
    }

    // Flush?
    let isFlush = false;
    {
        let clubs = 0,
            diamonds = 0,
            hearts = 0,
            spades = 0;
        for (let i = 0; i < suits.length; i++) {
            const s = suits[i];
            if (s === 'c') clubs++;
            else if (s === 'd') diamonds++;
            else if (s === 'h') hearts++;
            else spades++;
        }
        isFlush = clubs === 5 || diamonds === 5 || hearts === 5 || spades === 5;
    }

    // Straight? Handle wheel A-2-3-4-5
    const uniqueRanks = Array.from(new Set(ranks)).sort(byRankDesc);
    let isStraight = false;
    let topStraight = 0;
    {
        const rset = new Set(uniqueRanks);
        for (let i = 0; i < uniqueRanks.length; i++) {
            const start = uniqueRanks[i];
            const run = [start, start - 1, start - 2, start - 3, start - 4];
            if (run.every((x) => rset.has(x))) {
                isStraight = true;
                topStraight = start;
                break;
            }
        }
        if (
            !isStraight &&
            rset.has(14) &&
            rset.has(5) &&
            rset.has(4) &&
            rset.has(3) &&
            rset.has(2)
        ) {
            isStraight = true;
            topStraight = 5; // A-2-3-4-5
        }
    }

    if (isFlush && isStraight) {
        return {
            cat: 'Straight Flush',
            tuple: [categoryScore('Straight Flush'), topStraight],
        };
    }

    const groups = Object.keys(counts)
        .map(
            (k) =>
                [parseInt(k, 10), counts[parseInt(k, 10)]] as [number, number]
        )
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1]; // by count desc
            return b[0] - a[0]; // by rank desc
        });
    const [r1, c1] = groups[0];
    const [r2, c2] = groups[1] || [0, 0];
    const kickers = uniqueRanks
        .filter((r) => r !== r1 && r !== r2)
        .sort(byRankDesc);

    if (c1 === 4)
        return {
            cat: 'Four of a Kind',
            tuple: [categoryScore('Four of a Kind'), r1, kickers[0] || 0],
        };
    if (c1 === 3 && c2 >= 2)
        return {
            cat: 'Full House',
            tuple: [categoryScore('Full House'), r1, r2],
        };
    if (isFlush)
        return {
            cat: 'Flush',
            tuple: [categoryScore('Flush'), ...uniqueRanks],
        };
    if (isStraight)
        return {
            cat: 'Straight',
            tuple: [categoryScore('Straight'), topStraight],
        };
    if (c1 === 3)
        return {
            cat: 'Three of a Kind',
            tuple: [
                categoryScore('Three of a Kind'),
                r1,
                ...kickers.slice(0, 2),
            ],
        };
    if (c1 === 2 && c2 === 2) {
        const ph = Math.max(r1, r2),
            pl = Math.min(r1, r2);
        return {
            cat: 'Two Pair',
            tuple: [categoryScore('Two Pair'), ph, pl, kickers[0] || 0],
        };
    }
    if (c1 === 2)
        return {
            cat: 'One Pair',
            tuple: [categoryScore('One Pair'), r1, ...kickers.slice(0, 3)],
        };
    return {
        cat: 'High Card',
        tuple: [categoryScore('High Card'), ...uniqueRanks],
    };
}

function lexCompare(a: number[], b: number[]): number {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
        const av = a[i] ?? 0,
            bv = b[i] ?? 0;
        if (av !== bv) return av > bv ? 1 : -1;
    }
    return 0;
}

// Brute-force best 5 of up to 7 cards (max 21 combos)
export function evaluateBest5(cards: EvalCard[]): EvalResult {
    if (cards.length < 5) {
        const padded = cards.slice();
        const hand = padded.concat([]).slice(0, 5) as EvalCard[];
        const { cat, tuple } = evaluate5(hand);
        return { category: cat, best5: padded.slice(0, 5), rankTuple: tuple };
    }

    let bestTuple: number[] | null = null;
    let bestCat: Exclude<HandCategory, 'Royal Flush'> | null = null;
    let bestHand: EvalCard[] = [];

    const n = cards.length;
    const idx = [0, 1, 2, 3, 4];

    const take = (indices: number[]) => indices.map((i) => cards[i]);

    const nextCombo = (i: number): boolean => {
        if (i < 0) return false;
        if (idx[i] !== i + (n - 5)) {
            idx[i]++;
            for (let j = i + 1; j < 5; j++) idx[j] = idx[j - 1] + 1;
            return true;
        }
        return nextCombo(i - 1);
    };

    do {
        const hand = take(idx);
        const { cat, tuple } = evaluate5(hand);
        if (!bestTuple || lexCompare(tuple, bestTuple) > 0) {
            bestTuple = tuple;
            bestCat = cat;
            bestHand = hand;
        }
    } while (nextCombo(4));

    const categoryBase = bestCat!;
    const isRoyal = categoryBase === 'Straight Flush' && bestTuple![1] === 14;
    const category: HandCategory = isRoyal ? 'Royal Flush' : categoryBase;

    return { category, best5: bestHand, rankTuple: bestTuple! };
}

export function evaluateFromServerInts(
    hole: number[],
    board: number[]
): EvalResult | null {
    const holeCards = hole.map(decodeEvalCardInt).filter(Boolean) as EvalCard[];
    const boardCards = board
        .map(decodeEvalCardInt)
        .filter(Boolean) as EvalCard[];
    if (holeCards.length < 2) return null;
    const known = [...holeCards, ...boardCards];
    return evaluateBest5(known);
}

export function currentHandLabel(
    hole: number[],
    board: number[]
): HandCategory | null {
    const res = evaluateFromServerInts(hole, board);
    return res?.category ?? null;
}
