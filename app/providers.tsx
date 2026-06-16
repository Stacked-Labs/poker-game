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
import { PostHogProvider } from './components/analytics/PostHogProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    // Broadcast mode (?broadcast=1) is the 24/7 livestream worker rendering a static
    // view in headless software-GL Chromium. Skip wallet auto-connect + the miniapp
    // ready signal — pure load with no value for a logged-out display. (Animations are
    // disabled server-side in app/page.tsx via MotionConfig so reveal-on-scroll content
    // renders visible; the context providers below stay mounted so the nav/hero, which
    // read wallet/auth, don't crash.) Normal visitors are unaffected.
    const [isBroadcast] = useState(
        () =>
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('broadcast') === '1',
    );

    useEffect(() => {
        if (!isBroadcast) sdk.actions.ready();
    }, [isBroadcast]);

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
                    {!isBroadcast && (
                        <AutoConnect client={client} wallets={wallets} />
                    )}
                    {!isBroadcast && <E2EAutoConnect />}
                    <ServiceWorkerRegistration />
                    <AuthProvider>
                        <TournamentReminderProvider>
                            <AppStoreProvider>
                                <UserProvider>
                                    <SoundProvider>
                                        <PostHogProvider>
                                            {children}
                                        </PostHogProvider>
                                    </SoundProvider>
                                </UserProvider>
                            </AppStoreProvider>
                        </TournamentReminderProvider>
                    </AuthProvider>
                </ThirdwebProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
