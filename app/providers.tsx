// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { Web3ModalProvider } from './contexts/Web3Modal';
import { StateProvider } from './state';
import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import { AppStoreProvider } from '@/app/contexts/AppStoreProvider';
import { UserProvider } from './contexts/CurrentUserProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <AppStoreProvider>
                <UserProvider>
                    <SocketProvider>
                        <Web3ModalProvider>
                            <ChakraProvider theme={theme}>
                                <StateProvider>{children}</StateProvider>
                            </ChakraProvider>
                        </Web3ModalProvider>
                    </SocketProvider>
                </UserProvider>
            </AppStoreProvider>
        </CacheProvider>
    );
}
