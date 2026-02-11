'use client';

import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[app error boundary]', error.message);
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
                    bgGradient: 'linear(to-r, brand.pink, brand.yellow)',
                }}
            >
                <Flex
                    mx="auto"
                    mb={5}
                    w="56px"
                    h="56px"
                    borderRadius="14px"
                    bg="rgba(235, 11, 92, 0.08)"
                    align="center"
                    justify="center"
                >
                    <Icon
                        as={FiAlertTriangle}
                        boxSize={6}
                        color="brand.pink"
                    />
                </Flex>
                <Heading
                    size="lg"
                    color="text.primary"
                    mb={2}
                >
                    Something went wrong
                </Heading>
                <Text color="text.secondary" mb={8} fontSize="sm">
                    An unexpected error occurred. Please try again.
                </Text>
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
            </Box>
        </Flex>
    );
}
