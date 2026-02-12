import { useContext, useMemo } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import type { DisplayMode } from '@/app/interfaces';

const CHIPS_PER_USDC = 100;

const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

/** "1.0" → "1", "1.5" → "1.5" */
function stripTrailingZero(s: string): string {
    return s.endsWith('.0') ? s.slice(0, -2) : s;
}

/** Compact K/M/B suffix formatting */
function compactNumber(value: number): string {
    if (value >= 1_000_000) {
        const m = value / 1_000_000;
        return stripTrailingZero(m >= 10 ? m.toFixed(0) : m.toFixed(1)) + 'M';
    }
    if (value >= 100_000) {
        const k = Math.round(value / 1_000);
        if (k >= 1000)
            return stripTrailingZero((value / 1_000_000).toFixed(1)) + 'M';
        return k + 'K';
    }
    if (value >= 1_000)
        return stripTrailingZero((value / 1_000).toFixed(1)) + 'K';
    return stripTrailingZero(value.toFixed(1));
}

export function useFormatAmount() {
    const { appState } = useContext(AppContext);
    const selectedMode = appState.displayMode;
    const bb = appState.game?.config?.bb ?? 0;
    const isCrypto = appState.game?.config?.crypto === true;

    // Resolve effective mode with fallbacks
    const mode: DisplayMode = useMemo(() => {
        if (selectedMode === 'usdc' && !isCrypto) return 'chips';
        if (selectedMode === 'bb' && !bb) return 'chips';
        return selectedMode;
    }, [selectedMode, isCrypto, bb]);

    const format = useMemo(() => {
        switch (mode) {
            case 'bb': {
                return (chips: number) => {
                    const bbVal = chips / bb;
                    if (bbVal >= 10_000) return compactNumber(bbVal) + 'bb';
                    if (bbVal >= 100) return Math.round(bbVal) + 'bb';
                    return stripTrailingZero(bbVal.toFixed(1)) + 'bb';
                };
            }
            case 'usdc': {
                return (chips: number) => {
                    const dollars = chips / CHIPS_PER_USDC;
                    if (dollars >= 10_000) return '$' + compactNumber(dollars);
                    if (dollars >= 100) {
                        const rounded = Math.round(dollars);
                        if (rounded >= 10_000)
                            return '$' + compactNumber(dollars);
                        return '$' + rounded.toLocaleString('en-US');
                    }
                    if (dollars >= 10) return '$' + dollars.toFixed(2);
                    return usdFormatter.format(dollars);
                };
            }
            default: {
                return (chips: number) => {
                    if (chips >= 100_000) return compactNumber(chips);
                    return chips.toLocaleString('en-US');
                };
            }
        }
    }, [mode, bb]);

    const fromChips = useMemo(() => {
        switch (mode) {
            case 'bb':
                return (chips: number) => chips / bb;
            case 'usdc':
                return (chips: number) => chips / CHIPS_PER_USDC;
            default:
                return (chips: number) => chips;
        }
    }, [mode, bb]);

    const toChips = useMemo(() => {
        switch (mode) {
            case 'bb':
                return (val: number) => Math.round(val * bb);
            case 'usdc':
                return (val: number) => Math.round(val * CHIPS_PER_USDC);
            default:
                return (val: number) => val;
        }
    }, [mode, bb]);

    return { format, fromChips, toChips, mode };
}
