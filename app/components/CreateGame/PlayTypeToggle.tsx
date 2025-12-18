import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface PlayTypeToggleProps {
    playType: 'Free' | 'Crypto';
    setPlayType: (type: 'Free' | 'Crypto') => void;
}

export default function PlayTypeToggle({
    playType,
    setPlayType,
}: PlayTypeToggleProps) {
    return (
        <Box position="relative" width="220px" height="40px">
            {/* Track */}
            <Box
                position="absolute"
                inset={0}
                bg="card.lightGray"
                borderRadius="full"
            />

            {/* Sliding pill */}
            <Box
                position="absolute"
                top="4px"
                left={playType === 'Free' ? '4px' : 'calc(50% + 4px)'}
                width="calc(50% - 8px)"
                height="32px"
                bg="brand.pink"
                borderRadius="full"
                boxShadow="sm"
                transition="left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            />

            {/* Labels */}
            <Flex
                position="relative"
                zIndex={1}
                alignItems="center"
                justifyContent="space-between"
                height="full"
                px={0}
            >
                {/* Free Play */}
                <Box
                    as="button"
                    type="button"
                    flex="1"
                    height="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => setPlayType('Free')}
                    background="transparent"
                >
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={
                            playType === 'Free' ? 'brand.lightGray' : 'gray.500'
                        }
                        whiteSpace="nowrap"
                    >
                        Free Play
                    </Text>
                </Box>

                {/* Crypto */}
                <Box
                    as="button"
                    type="button"
                    flex="1"
                    height="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => setPlayType('Crypto')}
                    background="transparent"
                >
                    <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={
                            playType === 'Crypto'
                                ? 'brand.lightGray'
                                : 'gray.500'
                        }
                        whiteSpace="nowrap"
                    >
                        Crypto
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}
