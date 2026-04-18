export interface ChipColumn {
    /** semantic color token for the chip face */
    color: 'white' | 'red' | 'green' | 'black' | 'purple';
    /** stroke color token */
    stripe: string;
    /** value per chip, in chips */
    denom: number;
    /** how many chips to render in the visible stack (cap applied) */
    visible: number;
    /** raw count including overflow */
    count: number;
}

const MAX_STACK_HEIGHT = 8;

const CHIP_STYLES: Array<Pick<ChipColumn, 'color' | 'stripe'>> = [
    { color: 'white', stripe: 'brand.navy' },
    { color: 'red', stripe: 'white' },
    { color: 'green', stripe: 'white' },
    { color: 'black', stripe: 'brand.yellow' },
    { color: 'purple', stripe: 'white' },
];

/**
 * Breaks a chip amount into up to 4 denomination columns scaled to the
 * table's big blind, for the ChipStackVisualizer. Denominations scale with
 * bb so the same visual works at $0.10/$0.20 and $100/$200.
 */
export function breakdownChips(chips: number, bb: number): ChipColumn[] {
    if (!Number.isFinite(chips) || chips <= 0 || bb <= 0) return [];

    const denoms = [
        Math.max(1, Math.round(bb * 25)),
        Math.max(1, Math.round(bb * 5)),
        Math.max(1, Math.round(bb)),
        Math.max(1, Math.round(bb / 4)),
    ];

    let remaining = chips;
    const columns: ChipColumn[] = [];

    denoms.forEach((denom, idx) => {
        if (remaining < denom) return;
        const count = Math.floor(remaining / denom);
        remaining -= count * denom;
        columns.push({
            ...CHIP_STYLES[idx],
            denom,
            count,
            visible: Math.min(count, MAX_STACK_HEIGHT),
        });
    });

    // If the highest denom filled everything, make sure there's still visual
    // variety by nudging one chip down to the next tier.
    if (columns.length === 1 && columns[0].count > 1) {
        const [single] = columns;
        return [
            { ...single, count: single.count - 1, visible: Math.min(single.count - 1, MAX_STACK_HEIGHT) },
            {
                ...CHIP_STYLES[1],
                denom: Math.max(1, Math.round(single.denom / 5)),
                count: 1,
                visible: 1,
            },
        ];
    }

    return columns;
}
