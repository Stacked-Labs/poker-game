'use client';

import { Box } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import GameContainer from './GameContainer';
import LoadingScreen from './LoadingScreen';

const GameViewport = ({ children }: { children: ReactNode }) => {
    const [showLoading, setLoading] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* Loading screen - OUTSIDE container, covers full viewport */}
            <AnimatePresence>
                {showLoading && <LoadingScreen />}
            </AnimatePresence>

            {/* Viewport wrapper - full screen, centers the game container */}
            <Box
                className="game-viewport"
                position="fixed"
                top={0}
                left={0}
                width="100vw"
                height="var(--full-vh)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="bg.letterbox"
                overflow="hidden"
            >
                {/* Fixed aspect ratio container */}
                <GameContainer showLoading={showLoading}>
                    {children}
                </GameContainer>
            </Box>
        </>
    );
};

export default GameViewport;
