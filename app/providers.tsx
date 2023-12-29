// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { UserProvider } from './contexts/currentUserContext';
import { Web3ModalProvider } from './contexts/Web3Modal';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <Web3ModalProvider>
          <UserProvider>{children}</UserProvider>
        </Web3ModalProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
