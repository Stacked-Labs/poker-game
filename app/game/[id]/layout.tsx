// components/GameLayout.tsx
import React from 'react';
import Navbar from '@/app/components/NavBar';
import { Box, Flex } from '@chakra-ui/react';

const GameLayout: React.FC = ({ children }: React.PropsWithChildren<{}>) => {
    return (
        	<Flex
			direction="column"

			maxW="100%"
 			maxH="100vh" 
			position="relative"
			zIndex="auto"
			transformOrigin="center center"
		>
            <Navbar />
    <Flex flex="1" direction="column" overflow="auto">
                {children}
</Flex>
			<Navbar />
        </Flex>
    );
};

export default GameLayout;
