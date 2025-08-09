'use client';

import { Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

const LandscapeScreen = () => {
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
    const [orientation, setOrientation] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        function updateOrientation() {
            if (typeof window === 'undefined') return;
            const isLandscapeMedia =
                typeof window.matchMedia === 'function'
                    ? window.matchMedia('(orientation: landscape)').matches
                    : false;
            const isLandscapeFallback = window.innerWidth > window.innerHeight;
            setOrientation(
                isLandscapeMedia || isLandscapeFallback
                    ? 'landscape'
                    : 'portrait'
            );
        }

        updateOrientation();
        if (typeof window !== 'undefined') {
            window.addEventListener('orientationchange', updateOrientation);
            window.addEventListener('resize', updateOrientation);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener(
                    'orientationchange',
                    updateOrientation
                );
                window.removeEventListener('resize', updateOrientation);
            }
        };
    }, []);

    const isLandscape = orientation.includes('landscape');

    return isClient && isMobile && isLandscape ? (
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
            <Text color="white" size="xl" fontWeight="bold" align={'center'}>
                Please rotate your device to play the game.
            </Text>
        </Flex>
    ) : null;
};

export default LandscapeScreen;
