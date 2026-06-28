'use client';

import { useEffect, useRef, useState } from 'react';

// Generalized "snapshot last value, compare on next load, fire once" detector (Viral §5 / #358) —
// the pattern `useRankHistory` pioneered, lifted into one reusable hook that powers every Share
// Moment (rank-up, new tier, hands milestone, deep run). Responsible by construction: it never
// fires on first load (no prior snapshot), and writes the snapshot forward every time so a moment
// can't re-fire on a reload.

export interface MomentDetectorOptions {
    // Unique localStorage key for this moment + identity (e.g. `moment:tier:0xabc`). Undefined
    // disables detection (e.g. before the wallet/value is known).
    storageKey: string | undefined;
    // The current value to compare against the stored snapshot.
    value: number | undefined;
    // Crossing predicate — return true when (previous → current) constitutes the moment.
    trigger: (previous: number, current: number) => boolean;
    // When true, the moment fires at most once ever (a persistent lock), for one-shot moments like
    // a per-tournament deep run. When false (default), it can fire again on a future crossing.
    once?: boolean;
    enabled?: boolean;
}

export interface MomentDetectorResult {
    triggered: boolean;
    previous: number | null;
    // Clears the triggered flag once the celebration has been shown/dismissed.
    acknowledge: () => void;
}

export function useMomentDetector({
    storageKey,
    value,
    trigger,
    once = false,
    enabled = true,
}: MomentDetectorOptions): MomentDetectorResult {
    const [triggered, setTriggered] = useState(false);
    const [previous, setPrevious] = useState<number | null>(null);
    const didRun = useRef(false);
    const triggerRef = useRef(trigger);
    triggerRef.current = trigger;

    useEffect(() => {
        if (!enabled || !storageKey || value == null || didRun.current) return;
        if (typeof window === 'undefined') return;
        didRun.current = true;

        const lastKey = `moment:last:${storageKey}`;
        const doneKey = `moment:done:${storageKey}`;

        // One-shot moments that already fired: keep the snapshot fresh, but never fire again.
        if (once && localStorage.getItem(doneKey)) {
            localStorage.setItem(lastKey, String(value));
            return;
        }

        const stored = localStorage.getItem(lastKey);
        const prev = stored != null ? parseInt(stored, 10) : null;
        // Always advance the snapshot — a moment fires on the transition, not the value.
        localStorage.setItem(lastKey, String(value));

        if (prev != null && Number.isFinite(prev) && triggerRef.current(prev, value)) {
            setPrevious(prev);
            setTriggered(true);
            if (once) localStorage.setItem(doneKey, '1');
        }
    }, [enabled, storageKey, value, once]);

    return {
        triggered,
        previous,
        acknowledge: () => setTriggered(false),
    };
}
