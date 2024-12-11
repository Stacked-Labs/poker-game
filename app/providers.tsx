// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { StateProvider } from './state';
import { AppStoreProvider } from '@/app/contexts/AppStoreProvider';
import { UserProvider } from '@/app/contexts/CurrentUserProvider';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { ThirdwebProvider } from 'thirdweb/react';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider theme={theme}>
                <ThirdwebProvider>
                    <AppStoreProvider>
                        <UserProvider>
                            <AuthProvider>
                                <SocketProvider>
                                    <StateProvider>{children}</StateProvider>
                                </SocketProvider>
                            </AuthProvider>
                        </UserProvider>
                    </AppStoreProvider>
                </ThirdwebProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
