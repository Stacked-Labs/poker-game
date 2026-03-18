'use client';

import {
    Box,
    Button,
    Flex,
    Heading,
    Icon,
    Text,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { MdTableBar } from 'react-icons/md';
import { FiWifiOff } from 'react-icons/fi';

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(235, 11, 92, 0.15); }
    50%      { box-shadow: 0 0 0 8px rgba(235, 11, 92, 0); }
`;

export default function TableError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[table error boundary]', error.message);
    }, [error]);

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="bg.default"
            px={4}
        >
            <Box
                bg="card.white"
                borderRadius="20px"
                p={{ base: 6, md: 10 }}
                maxW="400px"
                w="100%"
                textAlign="center"
                border="1px solid"
                borderColor="border.lightGray"
                boxShadow="0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)"
                animation={`${fadeUp} 400ms ease-out`}
            >
                {/* Icon badge */}
                <Flex
                    mx="auto"
                    mb={2}
                    w="64px"
                    h="64px"
                    borderRadius="16px"
                    bg="rgba(235, 11, 92, 0.06)"
                    border="1px solid"
                    borderColor="rgba(235, 11, 92, 0.1)"
                    align="center"
                    justify="center"
                    animation={`${pulseGlow} 2.5s ease-in-out infinite`}
                >
                    <Icon
                        as={FiWifiOff}
                        boxSize={7}
                        color="brand.pink"
                    />
                </Flex>

                {/* Small table icon label */}
                <Flex
                    align="center"
                    justify="center"
                    gap={1.5}
                    mb={3}
                >
                    <Icon
                        as={MdTableBar}
                        boxSize={3.5}
                        color="text.muted"
                    />
                    <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="text.muted"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                    >
                        Connection Lost
                    </Text>
                </Flex>

                <VStack spacing={2} mb={8}>
                    <Heading
                        size="lg"
                        color="text.primary"
                        lineHeight="1.2"
                    >
                        Lost connection to the table
                    </Heading>
                    <Text
                        color="text.secondary"
                        fontSize="sm"
                        lineHeight="1.6"
                        maxW="320px"
                    >
                        Something went wrong while loading the table.
                        You can try again or return to the lobby.
                    </Text>
                </VStack>

                <VStack spacing={3}>
                    <Button
                        onClick={reset}
                        variant="greenGradient"
                        size="lg"
                        w="100%"
                        borderRadius="14px"
                        h="52px"
                        fontSize="md"
                    >
                        Try again
                    </Button>
                    <Button
                        as={Link}
                        href="/public-games"
                        variant="outlineMuted"
                        size="lg"
                        w="100%"
                        borderRadius="14px"
                        h="52px"
                        fontSize="md"
                        bg="card.white"
                    >
                        Return to lobby
                    </Button>
                </VStack>
            </Box>
        </Flex>
    );
}
