// app/providers.tsx
'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './theme';
import { Web3ModalProvider } from './contexts/Web3Modal';
import { StateProvider } from './state';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<CacheProvider>
			<ChakraProvider theme={theme}>
				<Web3ModalProvider>
				<StateProvider>
						{children}
				</StateProvider>
			</Web3ModalProvider>
			</ChakraProvider>
		</CacheProvider>
	);
}
