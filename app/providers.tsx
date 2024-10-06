// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { StateProvider } from './state';
import { AppStoreProvider } from '@/app/contexts/AppStoreProvider';
import { UserProvider } from '@/app/contexts/CurrentUserProvider';
import { Web3ModalProvider } from '@/app/contexts/Web3Modal';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import { AuthProvider } from '@/app/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider theme={theme}>
                <AppStoreProvider>
                    <UserProvider>
                        <Web3ModalProvider>
                            <AuthProvider>
                                <SocketProvider>
                                    <StateProvider>{children}</StateProvider>
                                </SocketProvider>
                            </AuthProvider>
                        </Web3ModalProvider>
                    </UserProvider>
                </AppStoreProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
