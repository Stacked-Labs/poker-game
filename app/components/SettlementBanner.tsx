'use client';

import { useContext } from 'react';
import { AppContext } from '../contexts/AppStoreProvider';
import { Box, Flex, Icon, Text, Spinner } from '@chakra-ui/react';
import { MdWarning } from 'react-icons/md';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translate(-50%, 8px); }
    to { opacity: 1; transform: translate(-50%, 0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
`;

const SettlementBanner = () => {
    const { appState } = useContext(AppContext);
    const status = appState.settlementStatus;

    if (status === 'pending') {
        return (
            <Box
                position="absolute"
                bottom={{ base: '2px', md: '4px' }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={1000}
                textAlign="center"
                pointerEvents="none"
                userSelect="none"
                animation={`${fadeIn} 0.3s ease-out`}
                role="status"
            >
                <Flex
                    align="center"
                    justifyContent="center"
                    gap={2}
                    bg="blackAlpha.700"
                    backdropFilter="blur(4px)"
                    borderRadius="full"
                    px={4}
                    py={2}
                    whiteSpace="nowrap"
                >
                    <Spinner size="sm" color="white" speed="0.8s" />
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight="bold"
                        color="white"
                        letterSpacing="0.02em"
                    >
                        Settling on chain…
                    </Text>
                </Flex>
            </Box>
        );
    }

    if (status === 'failed') {
        return (
            <Box
                position="absolute"
                bottom={{ base: '2px', md: '4px' }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={1000}
                textAlign="center"
                pointerEvents="none"
                userSelect="none"
                animation={`${fadeIn} 0.3s ease-out`}
                role="alert"
            >
                <Flex
                    align="center"
                    justifyContent="center"
                    gap={2}
                    bg="red.600"
                    borderRadius="full"
                    px={5}
                    py={2.5}
                    whiteSpace="nowrap"
                    boxShadow="0 0 20px rgba(229, 62, 62, 0.4)"
                    animation={`${pulse} 2s ease-in-out infinite`}
                >
                    <Icon
                        as={MdWarning}
                        boxSize={{ base: 4, md: 5 }}
                        color="white"
                        aria-hidden
                    />
                    <Text
                        fontSize={{ base: 'sm', md: 'md' }}
                        fontWeight="bold"
                        color="white"
                        letterSpacing="0.02em"
                    >
                        Settlement Failed
                    </Text>
                </Flex>
            </Box>
        );
    }

    return null;
};

export default SettlementBanner;
