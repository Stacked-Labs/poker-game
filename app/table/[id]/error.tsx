'use client';

import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { MdTableBar } from 'react-icons/md';

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
            bg="brand.darkNavy"
            px={4}
        >
            <Box
                bg="card.white"
                borderRadius="28px"
                p={{ base: 6, md: 10 }}
                maxW="440px"
                w="100%"
                textAlign="center"
                border="1px solid"
                borderColor="border.lightGray"
                boxShadow="0 25px 80px rgba(0, 0, 0, 0.25), 0 8px 32px rgba(0, 0, 0, 0.15)"
                position="relative"
                overflow="hidden"
                _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    bgGradient: 'linear(to-r, brand.navy, brand.pink)',
                }}
            >
                <Flex
                    mx="auto"
                    mb={5}
                    w="56px"
                    h="56px"
                    borderRadius="14px"
                    bg="rgba(51, 68, 121, 0.08)"
                    align="center"
                    justify="center"
                >
                    <Icon
                        as={MdTableBar}
                        boxSize={6}
                        color="brand.navy"
                    />
                </Flex>
                <Heading
                    size="lg"
                    color="text.primary"
                    mb={2}
                >
                    Lost connection to the table
                </Heading>
                <Text color="text.secondary" mb={8} fontSize="sm">
                    Something went wrong while loading the table. You can try
                    again or return to the lobby.
                </Text>
                <Flex direction="column" gap={3}>
                    <Button
                        onClick={reset}
                        variant="greenGradient"
                        size="lg"
                        w="100%"
                        borderRadius="14px"
                        h="52px"
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
                    >
                        Return to lobby
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
}
