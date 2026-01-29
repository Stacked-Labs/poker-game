'use client';

import { useContext } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { MdPause } from 'react-icons/md';

const PauseBanner = () => {
    const { appState } = useContext(AppContext);

    if (appState.game?.paused) {
        return (
            <Box
                className="pause-banner"
                position="absolute"
                top={{ base: 'calc(100% + 6px)', md: 'calc(100% + 8px)' }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={990}
                textAlign="center"
                pointerEvents="none"
                userSelect="none"
            >
                <Flex
                    align="center"
                    justifyContent="center"
                    gap={0}
                    color="whiteAlpha.600"
                    opacity={0.75}
                    mixBlendMode="multiply"
                    whiteSpace="nowrap"
                >
                    <Text
                        fontSize={{ base: 'sm', md: 'lg' }}
                        fontWeight="900"
                        letterSpacing={{ base: '0.01em', md: '0.02em' }}
                        lineHeight="1"
                        color="whiteAlpha.600"
                        mixBlendMode="multiply"
                    >
                        Game Paused
                    </Text>
                    <Icon
                        as={MdPause}
                        boxSize={{ base: 5, md: 7 }}
                        aria-hidden
                        mixBlendMode="multiply"
                    />
                </Flex>
            </Box>
        );
    }

    return null;
};

export default PauseBanner;
