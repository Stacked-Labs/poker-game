'use client';

import { useEffect } from 'react';

/**
 * One-shot service-worker registration on app mount. Push reminders also
 * register /sw.js lazily on first use, but doing it here too means a push can
 * arrive even if the player never reopens the reminder modal. Renders nothing.
 * Failures are swallowed: the service worker is an enhancement and must never
 * break the page.
 */
export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }, []);

    return null;
}
