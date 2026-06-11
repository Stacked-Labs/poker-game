'use client';

import { useCallback, useEffect, useState } from 'react';

const backendUrl = process.env.NEXT_PUBLIC_API_URL;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// The browser hands us the VAPID application server key as a base64url string,
// but pushManager.subscribe wants a Uint8Array. This converts one to the other
// (base64url -> raw bytes), tolerating the missing padding base64url leaves off.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        output[i] = raw.charCodeAt(i);
    }
    return output;
}

function detectSupport(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

// iOS only allows web push when the app is installed to the home screen
// (standalone). When it is Safari-in-browser we surface an "add to home screen"
// nudge instead of a permission prompt that would silently do nothing.
function detectIsIOSNonPWA(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    if (!isIOS) return false;
    const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return !standalone;
}

type PushReminderState = {
    isSupported: boolean;
    isIOSNonPWA: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    isLoading: boolean;
    requestPermission: () => Promise<'granted' | 'denied'>;
    unsubscribe: () => Promise<void>;
};

// Drives the web-push side of tournament reminders: feature/iOS detection,
// service-worker registration, the permission prompt, and persisting (or
// removing) the push subscription on the backend. Wallet-scoped on the server
// via the auth cookie, so every fetch here sends credentials.
export function usePushReminders(): PushReminderState {
    const [isSupported, setIsSupported] = useState(false);
    const [isIOSNonPWA, setIsIOSNonPWA] = useState(false);
    const [permission, setPermission] =
        useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Registers /sw.js once, returning the ready registration. Failures are
    // swallowed: push is an enhancement and must never break the page.
    const ensureRegistration =
        useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
            if (!('serviceWorker' in navigator)) return null;
            try {
                await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });
                return await navigator.serviceWorker.ready;
            } catch {
                return null;
            }
        }, []);

    useEffect(() => {
        const supported = detectSupport();
        setIsSupported(supported);
        setIsIOSNonPWA(detectIsIOSNonPWA());
        if (!supported) return;

        setPermission(Notification.permission);

        let cancelled = false;
        ensureRegistration().then(async (reg) => {
            if (!reg || cancelled) return;
            try {
                const sub = await reg.pushManager.getSubscription();
                if (!cancelled) setIsSubscribed(Boolean(sub));
            } catch {
                if (!cancelled) setIsSubscribed(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [ensureRegistration]);

    const requestPermission = useCallback(async (): Promise<
        'granted' | 'denied'
    > => {
        if (!detectSupport() || !VAPID_PUBLIC_KEY) return 'denied';

        setIsLoading(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result !== 'granted') return 'denied';

            const reg = await ensureRegistration();
            if (!reg) return 'denied';

            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey:
                        urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });
            }

            const json = sub.toJSON();
            const keys = json.keys ?? {};
            const res = await fetch(`${backendUrl}/api/push-subscriptions`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: sub.endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                    userAgent: navigator.userAgent,
                }),
            });
            if (!res.ok) {
                // Persisting failed: tear the local subscription back down so we
                // don't leave a device the backend can never reach.
                await sub.unsubscribe().catch(() => {});
                return 'denied';
            }

            setIsSubscribed(true);
            return 'granted';
        } catch {
            return 'denied';
        } finally {
            setIsLoading(false);
        }
    }, [ensureRegistration]);

    const unsubscribe = useCallback(async (): Promise<void> => {
        if (!detectSupport()) return;

        setIsLoading(true);
        try {
            const reg = await ensureRegistration();
            const sub = reg
                ? await reg.pushManager.getSubscription()
                : null;
            if (sub) {
                const { endpoint } = sub;
                const res = await fetch(
                    `${backendUrl}/api/push-subscriptions/${encodeURIComponent(endpoint)}`,
                    { method: 'DELETE', credentials: 'include' }
                ).catch(() => null);
                // Only drop the local subscription once the server has forgotten
                // it (or never had it). Otherwise we would show "off" while the
                // backend still holds a live subscription and keeps sending.
                if (res && (res.ok || res.status === 404 || res.status === 410)) {
                    await sub.unsubscribe().catch(() => {});
                    setIsSubscribed(false);
                }
            } else {
                setIsSubscribed(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [ensureRegistration]);

    return {
        isSupported,
        isIOSNonPWA,
        permission,
        isSubscribed,
        isLoading,
        requestPermission,
        unsubscribe,
    };
}
