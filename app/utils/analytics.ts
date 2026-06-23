import type { PostHog } from 'posthog-js';

// posthog-js (~40KB gzipped) is loaded lazily on init so it stays out of the
// initial shared chunk. Every export below no-ops until `posthog` is assigned.
let posthog: PostHog | null = null;

export type AnalyticsEvent =
    | 'wallet_connect_clicked'
    | 'wallet_connected'
    | 'wallet_disconnected'
    | 'table_create_started'
    | 'table_create_completed'
    | 'seat_requested'
    | 'player_action'
    | 'deposit_initiated'
    | 'withdrawal_initiated'
    | 'emergency_withdraw_clicked'
    | 'free_tokens_claim_started'
    | 'free_tokens_claimed'
    | 'public_games_viewed'
    | 'leaderboard_viewed'
    | 'faq_expanded';

export type AnalyticsMode = 'free' | 'real';
export type AnalyticsNetwork = 'base' | 'sepolia';

const CONSENT_KEY = 'stacked_analytics_consent';
export type ConsentState = 'granted' | 'declined' | null;

export function getConsent(): ConsentState {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'declined' ? v : null;
}

export function setConsent(value: 'granted' | 'declined') {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CONSENT_KEY, value);
    // If posthog hasn't loaded yet, the stored consent is applied in init's
    // `loaded` callback below.
    if (!posthog) return;
    if (value === 'granted') {
        posthog.opt_in_capturing();
    } else {
        posthog.opt_out_capturing();
    }
}

let initialized = false;

export async function initAnalytics() {
    if (initialized || typeof window === 'undefined') return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
    if (!key) return;
    // Set early so a concurrent caller can't trigger a second dynamic import.
    initialized = true;

    try {
        const { default: ph } = await import('posthog-js');
        posthog = ph;
        posthog.init(key, {
            api_host: host,
            capture_pageview: false,
            capture_pageleave: true,
            autocapture: true,
            persistence: 'localStorage+cookie',
            opt_out_capturing_by_default: true,
            session_recording: {
                maskAllInputs: true,
            },
            loaded: (loaded) => {
                const consent = getConsent();
                if (consent === 'granted') loaded.opt_in_capturing();
                if (process.env.NODE_ENV === 'development') loaded.debug();
            },
        });
    } catch {
        // Analytics must never break the app. On any failure (chunk load or
        // init), null the instance so every export stays a no-op, and allow a
        // future init attempt.
        posthog = null;
        initialized = false;
    }
}

export function identifyUser(
    walletAddress: string,
    props?: Record<string, unknown>
) {
    if (!posthog) return;
    posthog.identify(walletAddress.toLowerCase(), props);
}

export function resetUser() {
    if (!posthog) return;
    posthog.reset();
}

export function setSuperProps(props: {
    mode?: AnalyticsMode;
    network?: AnalyticsNetwork;
    [k: string]: unknown;
}) {
    if (!posthog) return;
    posthog.register(props);
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
    if (!posthog) return;
    posthog.capture(event, props);
}

export function trackSampled(
    event: AnalyticsEvent,
    rate: number,
    props?: Record<string, unknown>
) {
    if (!posthog) return;
    if (Math.random() >= rate) return;
    posthog.capture(event, { ...props, sampled_rate: rate });
}

export function trackPageview(path: string) {
    if (!posthog) return;
    posthog.capture('$pageview', { $current_url: path });
}
