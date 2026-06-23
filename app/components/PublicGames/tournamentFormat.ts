import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@chakra-ui/react';
import { formatCountdown } from './tournamentFormatPure';

export * from './tournamentFormatPure';

// SSR-safe future countdown. `now` is null until mount so the server and first
// client render agree; the label fills in once mounted, then ticks.
export function useCountdown(targetIso: string, tickMs = 30_000) {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), tickMs);
        return () => clearInterval(id);
    }, [tickMs]);

    const target = new Date(targetIso).getTime();
    const valid = !Number.isNaN(target);
    const ready = now !== null && valid;
    const diffMs = ready ? target - (now as number) : 0;

    return {
        // `mounted` is true once the client has run its effect, regardless of
        // whether the target ISO is valid. Use it to gate timezone/locale-
        // dependent absolute-time text (formatTournamentStart) so the server and
        // the first client render emit identical output and don't hydrate-mismatch.
        mounted: now !== null,
        ready,
        diffMs,
        isPast: ready && diffMs <= 0,
        label: ready ? formatCountdown(diffMs) : '',
    };
}

// Zero-pad a single time part to two digits (e.g. 7 -> "07").
function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

// Like useCountdown, but inside the final minute it ticks every second and shows
// mm:ss (e.g. "01:23"), so a player watching the bar sees the seconds drain. At
// or past the deadline it reads "00:00" and then "now". When the player prefers
// reduced motion we skip the sub-minute ticking entirely and show a static
// "< 1m" so nothing animates. Outside the final minute it reuses the existing
// 30s tick and the standard formatCountdown label.
export function useCountdownWithSeconds(targetIso: string) {
    const prefersReducedMotion = usePrefersReducedMotion();

    // Self-rescheduling tick: 1s only inside the final minute (where the seconds
    // actually drain), otherwise 30s. This banner is mounted app-wide, so a blanket
    // 1Hz timer would wake the main thread every second for days; the adaptive
    // cadence keeps it cheap on mobile. Reduced-motion users never need 1s ticks.
    const [now, setNow] = useState<number | null>(null);
    const target = new Date(targetIso).getTime();
    const valid = !Number.isNaN(target);

    useEffect(() => {
        if (!valid) return;
        let id: ReturnType<typeof setTimeout>;
        const tick = () => {
            const n = Date.now();
            setNow(n);
            const diff = target - n;
            const next =
                !prefersReducedMotion && diff > 0 && diff <= 60_000
                    ? 1_000
                    : 30_000;
            id = setTimeout(tick, next);
        };
        tick();
        return () => clearTimeout(id);
    }, [target, valid, prefersReducedMotion]);

    const ready = now !== null && valid;
    const diffMs = ready ? target - (now as number) : 0;
    const isPast = ready && diffMs <= 0;

    if (!ready) return { ready, diffMs, isPast, label: '' };

    const inFinalMinute = diffMs <= 60_000;

    if (inFinalMinute) {
        if (prefersReducedMotion) {
            return {
                ready,
                diffMs,
                isPast,
                label: diffMs <= 0 ? 'now' : '< 1m',
            };
        }
        if (diffMs <= 0) {
            return { ready, diffMs, isPast, label: 'now' };
        }
        const totalSeconds = Math.floor(diffMs / 1_000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return {
            ready,
            diffMs,
            isPast,
            label: `${pad2(minutes)}:${pad2(seconds)}`,
        };
    }

    return { ready, diffMs, isPast, label: formatCountdown(diffMs) };
}

// Hides ONLY the horizontal scrollbar while keeping a slim vertical one. In
// WebKit/Blink the scrollbar's `height` is the horizontal bar's thickness and
// `width` is the vertical bar's, so height:0 removes the (ugly) bottom bar and a
// styled thumb keeps vertical scrolling discoverable. Covers iOS Safari +
// Android/Chrome where dense tables scroll sideways on narrow screens; Firefox
// keeps native bars, but desktop tables fit so no horizontal bar shows there.
export const HIDE_X_SCROLLBAR_SX = {
    '&::-webkit-scrollbar': { height: '0px', width: '8px' },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(128, 128, 128, 0.4)',
        borderRadius: '4px',
    },
} as const;
