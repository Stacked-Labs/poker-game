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
