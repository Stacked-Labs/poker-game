import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMomentDetector } from './useMomentDetector';

// The generalized moment detector (Viral §5 / #358) is the fire-once primitive behind every Share
// Moment. These pin the responsible-by-construction behaviour: never fire on first load, fire on a
// crossing, advance the snapshot, and honour the one-shot lock.

const lt = (prev: number, curr: number) => curr < prev; // e.g. rank improved

describe('useMomentDetector', () => {
    beforeEach(() => localStorage.clear());

    it('does not fire on first load (no prior snapshot)', () => {
        const { result } = renderHook(() =>
            useMomentDetector({ storageKey: 'rank:0xabc', value: 5, trigger: lt })
        );
        expect(result.current.triggered).toBe(false);
        // snapshot was written for next time
        expect(localStorage.getItem('moment:last:rank:0xabc')).toBe('5');
    });

    it('fires when the value crosses on a later load', () => {
        localStorage.setItem('moment:last:rank:0xabc', '10');
        const { result } = renderHook(() =>
            useMomentDetector({ storageKey: 'rank:0xabc', value: 4, trigger: lt })
        );
        expect(result.current.triggered).toBe(true);
        expect(result.current.previous).toBe(10);
        expect(localStorage.getItem('moment:last:rank:0xabc')).toBe('4');
    });

    it('does not fire when the predicate is not satisfied', () => {
        localStorage.setItem('moment:last:rank:0xabc', '4');
        const { result } = renderHook(() =>
            useMomentDetector({ storageKey: 'rank:0xabc', value: 6, trigger: lt })
        );
        expect(result.current.triggered).toBe(false);
    });

    it('a one-shot moment never fires twice', () => {
        // First crossing fires and sets the done lock.
        localStorage.setItem('moment:last:deeprun:t1', '20');
        const first = renderHook(() =>
            useMomentDetector({
                storageKey: 'deeprun:t1',
                value: 8,
                once: true,
                trigger: (p, c) => p > 9 && c <= 9,
            })
        );
        expect(first.result.current.triggered).toBe(true);
        expect(localStorage.getItem('moment:done:deeprun:t1')).toBe('1');

        // A later crossing (even a fresh one) must not fire again.
        const second = renderHook(() =>
            useMomentDetector({
                storageKey: 'deeprun:t1',
                value: 2,
                once: true,
                trigger: (p, c) => p > 9 && c <= 9,
            })
        );
        expect(second.result.current.triggered).toBe(false);
    });

    it('is disabled when the storage key or value is missing', () => {
        const { result } = renderHook(() =>
            useMomentDetector({ storageKey: undefined, value: 3, trigger: lt })
        );
        expect(result.current.triggered).toBe(false);
    });
});
