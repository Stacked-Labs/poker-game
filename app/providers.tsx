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

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider theme={theme}>
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
