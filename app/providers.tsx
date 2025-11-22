// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { AppStoreProvider } from '@/app/contexts/AppStoreProvider';
import { UserProvider } from '@/app/contexts/CurrentUserProvider';
import { SoundProvider } from '@/app/contexts/SoundProvider';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { AutoConnect, ThirdwebProvider } from 'thirdweb/react';
import { client } from './thirdwebclient';
import {
    TOAST_BANNER_CONTAINER_STYLE,
    TOAST_BANNER_DURATION_MS,
    TOAST_BANNER_POSITION,
} from './utils/toastDefaults';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        sdk.actions.ready();
    }, []);

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
                    <AutoConnect client={client} />
                    <AppStoreProvider>
                        <UserProvider>
                            <AuthProvider>
                                <SoundProvider>{children}</SoundProvider>
                            </AuthProvider>
                        </UserProvider>
                    </AppStoreProvider>
                </ThirdwebProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
