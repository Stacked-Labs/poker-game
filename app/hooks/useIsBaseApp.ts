'use client';

import { useEffect, useState } from 'react';

/**
 * True when the app is running inside the Coinbase **Base App** in-app browser.
 *
 * The Base App became a standard-web-app host on 2026-04-09 (it dropped the
 * Farcaster Mini App SDK), so we do NOT use `sdk.isInMiniApp()` here. Base does
 * not document a single definitive client signal, so this is a layered
 * best-effort detector — ⚠️ VALIDATE THE EXACT SIGNAL ON-DEVICE before relying
 * on it for anything security-sensitive.
 *
 * Override for testing in a normal browser: `?baseapp=1` (persists) / `?baseapp=0`.
 *
 * Used to: bridge the Base wallet (one-tap login), trim the home, fix safe-area
 * / double-header, and re-key the onramp/paymaster gating.
 */

let cached: boolean | null = null;

function detect(): boolean {
    if (typeof window === 'undefined') return false;

    // Explicit override (testing in a normal browser).
    try {
        const override = new URLSearchParams(window.location.search).get('baseapp');
        if (override === '1') {
            window.localStorage.setItem('forceBaseApp', '1');
            return true;
        }
        if (override === '0') {
            window.localStorage.removeItem('forceBaseApp');
            return false;
        }
        if (window.localStorage.getItem('forceBaseApp') === '1') return true;
    } catch {
        /* localStorage may be unavailable */
    }

    // In-app-browser user-agent token (Base App / Coinbase Wallet webview).
    const ua = window.navigator.userAgent || '';
    if (/\bBaseApp\b|CoinbaseWallet|CBWallet/i.test(ua)) return true;

    // Injected provider that identifies as a Base/Coinbase wallet.
    const eth = (window as Window & { ethereum?: Record<string, unknown> })
        .ethereum;
    if (eth && (eth.isCoinbaseWallet || eth.isBase || eth.isBaseApp)) return true;

    return false;
}

export function detectBaseAppSync(): boolean {
    // An explicit ?baseapp= override always re-evaluates (so testing toggles
    // aren't defeated by a previously-memoized value within the same session).
    if (
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('baseapp')
    ) {
        cached = detect();
        return cached;
    }
    if (cached === null) cached = detect();
    return cached;
}

export function useIsBaseApp(): boolean {
    const [isBaseApp, setIsBaseApp] = useState(false);
    useEffect(() => {
        setIsBaseApp(detectBaseAppSync());
    }, []);
    return isBaseApp;
}
