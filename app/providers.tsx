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
import { ColorModeProvider } from '@/components/ui/color-mode';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider
                theme={theme}
                toastOptions={{
                    defaultOptions: {
                        position: 'top-right',
                        duration: 5000,
                        isClosable: true,
                        containerStyle: {
                            marginTop: '0px',
                            marginBottom: '0px',
                        },
                    },
                }}
            >
                <ThirdwebProvider>
                    <AutoConnect client={client} />
                    <AppStoreProvider>
                        <UserProvider>
                            <AuthProvider>
                                <SoundProvider>
                                    <ColorModeProvider>
                                        {children}
                                    </ColorModeProvider>
                                </SoundProvider>
                            </AuthProvider>
                        </UserProvider>
                    </AppStoreProvider>
                </ThirdwebProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
