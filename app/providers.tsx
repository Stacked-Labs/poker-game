// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { AppStoreProvider } from '@/app/contexts/AppStoreProvider';
import { UserProvider } from '@/app/contexts/CurrentUserProvider';
import { SoundProvider } from '@/app/contexts/SoundProvider';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { TournamentReminderProvider } from '@/app/contexts/TournamentReminderProvider';
import { AutoConnect, ThirdwebProvider } from 'thirdweb/react';
import { client, wallets } from './thirdwebclient';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import {
    TOAST_BANNER_CONTAINER_STYLE,
    TOAST_BANNER_DURATION_MS,
    TOAST_BANNER_POSITION,
} from './utils/toastDefaults';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';
import E2EAutoConnect from './components/E2EAutoConnect';
import { useIsBaseApp } from './hooks/useIsBaseApp';
import BaseAppConnect from './components/BaseAppConnect';
import { initAnalytics, track } from './lib/analytics';

export function Providers({ children }: { children: React.ReactNode }) {
    const isBaseApp = useIsBaseApp();
    // Wait for Base-App detection to resolve before mounting EITHER connector,
    // so the social AutoConnect never briefly mounts in the Base App and races
    // (or overrides) the host wallet for a returning social-login user.
    const [connectorResolved, setConnectorResolved] = useState(false);

    useEffect(() => {
        initAnalytics();
        // Farcaster readiness — inert in the Base App (Track B only); never throw.
        sdk.actions.ready().catch(() => {});
        setConnectorResolved(true);
    }, []);

    useEffect(() => {
        if (isBaseApp) track('base_app_context_detected');
    }, [isBaseApp]);

    return (
        <CacheProvider>
            <ChakraProvider
                theme={theme}
                toastOptions={{
                    defaultOptions: {
                        position: TOAST_BANNER_POSITION,
                        duration: TOAST_BANNER_DURATION_MS,
                        isClosable: false,
                        containerStyle: TOAST_BANNER_CONTAINER_STYLE,
                    },
                }}
            >
                <ThirdwebProvider>
                    {/* In the Base App: bridge the host Base wallet (one-tap login)
                        and suppress the social-login AutoConnect so it can't race
                        the host injection. On the normal web: keep the existing
                        thirdweb flow unchanged. */}
                    {connectorResolved &&
                        (isBaseApp ? (
                            <BaseAppConnect />
                        ) : (
                            <AutoConnect client={client} wallets={wallets} />
                        ))}
                    {/* Test-only: reads ?e2e_pk= and auto-connects that private
                        key. Gated behind NEXT_PUBLIC_E2E (set by playwright.config)
                        so a crafted ?e2e_pk= URL cannot auto-connect an arbitrary
                        wallet in dev/prod — a phishing/loss vector otherwise. */}
                    {process.env.NEXT_PUBLIC_E2E === 'true' && <E2EAutoConnect />}
                    <ServiceWorkerRegistration />
                    <AuthProvider>
                        <TournamentReminderProvider>
                            <AppStoreProvider>
                                <UserProvider>
                                    <SoundProvider>{children}</SoundProvider>
                                </UserProvider>
                            </AppStoreProvider>
                        </TournamentReminderProvider>
                    </AuthProvider>
                </ThirdwebProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
