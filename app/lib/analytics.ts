import posthog from 'posthog-js';

/**
 * Centralized analytics wrapper (PostHog). Every call is a safe no-op until
 * `initAnalytics()` has run (SSR, missing key, dev) — analytics must NEVER
 * break the app. Events power the Base App funnel:
 *   base_app_context_detected → connect_attempt → connect_success →
 *   wallet_connected → siwe_success → seat_requested → seat_granted → first_hand
 */

type Props = Record<string, unknown>;

let initialized = false;

export function initAnalytics(): void {
    if (initialized || typeof window === 'undefined') return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    try {
        posthog.init(key, {
            api_host:
                process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
            person_profiles: 'identified_only',
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: false,
        });
        initialized = true;
    } catch {
        /* never throw from analytics init */
    }
}

export function track(event: string, props?: Props): void {
    if (!initialized) return;
    try {
        posthog.capture(event, props);
    } catch {
        /* swallow */
    }
}

export function identifyUser(address: string, props?: Props): void {
    if (!initialized || !address) return;
    try {
        posthog.identify(address.toLowerCase(), props);
    } catch {
        /* swallow */
    }
}

export function resetAnalytics(): void {
    if (!initialized) return;
    try {
        posthog.reset();
    } catch {
        /* swallow */
    }
}
