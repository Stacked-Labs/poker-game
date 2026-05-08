import React from 'react';
import { Box, Flex, Text, Tooltip } from '@chakra-ui/react';

interface PlayTypeToggleProps {
    playType: 'Free' | 'Crypto';
    setPlayType: (type: 'Free' | 'Crypto') => void;
    isCryptoEnabled?: boolean;
}

export default function PlayTypeToggle({
    playType,
    setPlayType,
    isCryptoEnabled = true,
}: PlayTypeToggleProps) {
    return (
        <Box position="relative" width="220px" height="40px">
            {/* Track — recessed groove for the sliding pill to sit in */}
            <Box
                position="absolute"
                inset={0}
                bg="card.lightGray"
                borderRadius="full"
                boxShadow="inset 0 1px 2px rgba(0,0,0,0.10)"
            />

            {/* Sliding pill — tactile chip with hairline highlight + pink edge */}
            <Box
                position="absolute"
                top="4px"
                left={playType === 'Free' ? '4px' : 'calc(50% + 4px)'}
                width="calc(50% - 8px)"
                height="32px"
                bg="brand.pink"
                borderRadius="full"
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.22), 0 1.5px 0 #950839"
                transition="left 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease"
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
                    transition="color 80ms ease"
                    _hover={
                        playType === 'Free' ? {} : { color: 'text.primary' }
                    }
                >
                    <Text
                        data-testid="play-type-free"
                        fontSize="sm"
                        fontWeight={700}
                        color={
                            playType === 'Free' ? 'brand.lightGray' : 'gray.500'
                        }
                        whiteSpace="nowrap"
                    >
                        Free Play
                    </Text>
                </Box>

                {/* Crypto */}
                <Tooltip
                    label={isCryptoEnabled ? '' : 'Coming soon'}
                    isDisabled={isCryptoEnabled}
                    hasArrow
                    placement="top"
                >
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
                        transition="color 80ms ease"
                        _hover={
                            playType === 'Crypto'
                                ? {}
                                : { color: 'text.primary' }
                        }
                    >
                        <Text
                            data-testid="play-type-crypto"
                            fontSize="sm"
                            fontWeight={700}
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
                </Tooltip>
            </Flex>
        </Box>
    );
}
