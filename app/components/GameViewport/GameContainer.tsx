'use client';

import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface GameContainerProps {
    children: ReactNode;
    showLoading?: boolean;
}

const GameContainer = ({
    children,
    showLoading = false,
}: GameContainerProps) => {
    return (
        <Box
            className="game-container"
            position="relative"
            overflow="hidden"
            bg="bg.default"
            filter={showLoading ? 'blur(3px)' : 'none'}
            transition="filter 0.5s ease-in-out"
            sx={{
                // Enable container queries
                containerType: 'size',
                containerName: 'game',

                // Landscape mode: 16:9 aspect ratio
                '@media (orientation: landscape)': {
                    aspectRatio: '18 / 10',
                    width: '100%',
                    height: '100%',
                    maxWidth: 'calc(var(--full-vh) * 1.8)', // 18/10 roughly 16/9
                    maxHeight: 'calc(100vw * 0.5625)', // 9/16
                },

                // Portrait mode: 9:16 aspect ratio
                '@media (orientation: portrait)': {
                    aspectRatio: '10 / 18',
                    width: '100%',
                    height: '100%',
                    maxWidth: 'calc(var(--full-vh) * 0.5625)', // 9/16
                    maxHeight: 'calc(100vw * 1.8)', // 18/10 roughly 16/9
                },
            }}
        >
            {children}
        </Box>
    );
};

export default GameContainer;
