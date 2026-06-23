'use client';

import { useEffect, useRef } from 'react';

interface WakeLockSentinelLike {
    released: boolean;
    release: () => Promise<void>;
    addEventListener: (type: 'release', listener: () => void) => void;
}

interface WakeLockLike {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

/**
 * Holds a Screen Wake Lock while `active` is true so the phone screen does not
 * dim or sleep during a hand. The browser auto-releases the lock whenever the
 * tab is backgrounded, so we re-acquire it on visibilitychange when the player
 * returns. No-ops on browsers without the API (older iOS Safari) — the screen
 * simply behaves as it did before.
 */
export function useWakeLock(active: boolean): void {
    const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

    useEffect(() => {
        if (!active || typeof navigator === 'undefined') return;
        const wakeLock = (navigator as unknown as { wakeLock?: WakeLockLike })
            .wakeLock;
        if (!wakeLock) return;

        let cancelled = false;

        const acquire = async () => {
            // The request rejects unless the page is visible, and the lock is
            // dropped automatically when the tab hides — so only ask while shown.
            if (document.visibilityState !== 'visible') return;
            if (sentinelRef.current && !sentinelRef.current.released) return;
            try {
                const sentinel = await wakeLock.request('screen');
                if (cancelled) {
                    sentinel.release().catch(() => {});
                    return;
                }
                sentinelRef.current = sentinel;
                sentinel.addEventListener('release', () => {
                    if (sentinelRef.current === sentinel) {
                        sentinelRef.current = null;
                    }
                });
            } catch {
                // NotAllowedError (page not focused) or unsupported — ignore.
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') acquire();
        };

        acquire();
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', onVisibilityChange);
            const sentinel = sentinelRef.current;
            sentinelRef.current = null;
            sentinel?.release().catch(() => {});
        };
    }, [active]);
}
