// components/GameLayout.tsx
import React from 'react';
import Navbar from '@/app/components/NavBar';
import { Box, Flex } from '@chakra-ui/react';
import Footer from '@/app/components/Footer';

const GameLayout: React.FC = ({ children }: React.PropsWithChildren<{}>) => {
	return (
		<Flex
			direction="column"
			bgColor={'gray.200'}
			maxW="100vw"
			maxH="100vh"
			position="relative"
			zIndex="auto"
			transformOrigin="center center"
		>
			<Navbar />

			{children}

			<Footer />
		</Flex>
	);
};

export default GameLayout;
