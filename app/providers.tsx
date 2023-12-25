// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { UserProvider } from './contexts/currentUserContext';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <UserProvider>{children}</UserProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
