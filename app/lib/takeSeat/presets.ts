const CHIPS_PER_USDC = 100;

const NICE_USDC = [
    1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000,
    100000,
];

const TARGET_BB = [50, 100, 150];
const FALLBACK_BB = [50, 100, 200];

export interface PresetInput {
    bb: number;
    maxBuyIn: number;
    walletBalanceChips: number | null;
    isCrypto: boolean;
}

export interface BuyInPreset {
    key: string;
    label: string;
    sublabel: string;
    chips: number;
    disabled: boolean;
    isMax: boolean;
}

const snapNearest = (value: number, ladder: number[]): number => {
    return ladder.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
};

const formatUsdc = (dollars: number): string => {
    if (dollars >= 1000) {
        return '$' + Math.round(dollars).toLocaleString('en-US');
    }
    if (dollars >= 10) return '$' + dollars.toFixed(0);
    return '$' + dollars.toFixed(2);
};

const formatChipsPlain = (chips: number): string =>
    chips.toLocaleString('en-US');

const formatBB = (bbCount: number): string => {
    if (bbCount >= 100) return `${Math.round(bbCount)} BB`;
    return `${Math.round(bbCount * 10) / 10} BB`;
};

const buildBBPreset = (
    mult: number,
    bb: number,
    maxBuyIn: number,
    isCrypto: boolean,
    walletBalanceChips: number | null
): BuyInPreset => {
    let chips: number;
    let label: string;
    let sublabel: string;

    if (isCrypto) {
        const targetUsdc = (mult * bb) / CHIPS_PER_USDC;
        const snappedUsdc = snapNearest(targetUsdc, NICE_USDC);
        chips = Math.round(snappedUsdc * CHIPS_PER_USDC);
        label = formatUsdc(snappedUsdc);
        sublabel = formatBB(chips / bb);
    } else {
        chips = mult * bb;
        label = formatChipsPlain(chips);
        sublabel = `${mult} BB`;
    }

    const cappedByMax = maxBuyIn > 0 ? Math.min(chips, maxBuyIn) : chips;
    const disabled =
        walletBalanceChips !== null && cappedByMax > walletBalanceChips;

    return {
        key: `bb-${mult}`,
        label,
        sublabel,
        chips: cappedByMax,
        disabled,
        isMax: false,
    };
};

const buildMaxPreset = (
    maxBuyIn: number,
    walletBalanceChips: number | null,
    bb: number,
    isCrypto: boolean
): BuyInPreset => {
    const cap =
        walletBalanceChips !== null
            ? Math.min(maxBuyIn, walletBalanceChips)
            : maxBuyIn;
    const chips = Math.max(cap, 0);

    const label = 'Max';
    let sublabel = '';
    if (chips > 0) {
        if (bb > 0) {
            sublabel = formatBB(chips / bb);
        } else if (isCrypto) {
            sublabel = formatUsdc(chips / CHIPS_PER_USDC);
        } else {
            sublabel = formatChipsPlain(chips);
        }
    }

    return {
        key: 'max',
        label,
        sublabel,
        chips,
        disabled: chips <= 0,
        isMax: true,
    };
};

/**
 * Builds up to 4 buy-in preset pills.
 * BB-anchored targets (50/100/150) snapped to nice USDC numbers for crypto
 * tables, raw chip values for free games. Duplicates collapse to the fallback
 * ladder (50/100/200) so the row always renders 3 distinct pills + Max.
 */
export function buildBuyInPresets(input: PresetInput): BuyInPreset[] {
    const { bb, maxBuyIn, walletBalanceChips, isCrypto } = input;
    if (!bb || bb <= 0) return [];

    const build = (mults: number[]): BuyInPreset[] =>
        mults.map((m) =>
            buildBBPreset(m, bb, maxBuyIn, isCrypto, walletBalanceChips)
        );

    let pills = build(TARGET_BB);
    const uniqueChips = new Set(pills.map((p) => p.chips));
    if (uniqueChips.size < TARGET_BB.length) {
        pills = build(FALLBACK_BB);
    }

    pills.push(buildMaxPreset(maxBuyIn, walletBalanceChips, bb, isCrypto));
    return pills;
}
