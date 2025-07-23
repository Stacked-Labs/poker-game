'use client';

import { Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

const LandscapeScreen = () => {
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
    const [orientation, setOrientation] = useState('');

    useEffect(() => {
        function updateOrientation() {
            setOrientation(screen.orientation.type);
        }

        updateOrientation();
        window.addEventListener('orientationchange', updateOrientation);
        return () => {
            window.removeEventListener('orientationchange', updateOrientation);
        };
    }, []);

    return (
        orientation.includes('landscape') &&
        isMobile &&
        window.screen.width > window.screen.height && (
            <Flex
                justify="center"
                align="center"
                w="100vw"
                h="100vh"
                bg={'charcoal.800'}
                px={4}
                position={'fixed'}
                zIndex={999999}
            >
                <Text
                    color="white    "
                    size="xl"
                    fontWeight="bold"
                    align={'center'}
                >
                    Please rotate your device to play the game.
                </Text>
            </Flex>
        )
    );
};

export default LandscapeScreen;
