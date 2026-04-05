'use client';

import Link from 'next/link';
import { Flex, VStack, Text, Button, Spinner, Box } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

interface EmptyStateProps {
    variant: 'loading' | 'error' | 'empty';
    onRetry?: () => void;
}

export default function EmptyState({ variant, onRetry }: EmptyStateProps) {
    if (variant === 'loading') {
        return (
            <Flex w="full" justify="center" align="center" py={16}>
                <VStack spacing={4}>
                    <Spinner size="lg" color="brand.green" thickness="3px" />
                    <Text color="text.secondary" fontSize="sm" fontWeight="semibold">
                        Loading public games...
                    </Text>
                </VStack>
            </Flex>
        );
    }

    if (variant === 'error') {
        return (
            <Flex w="full" direction="column" align="center" py={16} gap={4}>
                <Text color="text.secondary" fontSize="lg" fontWeight="bold">
                    Unable to load games. Please try again.
                </Text>
                <Button
                    variant="greenGradient"
                    borderRadius="14px"
                    boxShadow="btn-premium"
                    _hover={{ boxShadow: 'btn-premium-hover', transform: 'translateY(-1px)' }}
                    onClick={onRetry}
                >
                    Retry
                </Button>
            </Flex>
        );
    }

    return (
        <Flex w="full" direction="column" align="center" py={16} gap={4} position="relative">
            {/* Decorative card suits */}
            <Box position="absolute" inset={0} pointerEvents="none" overflow="hidden">
                <Text position="absolute" top="15%" left="20%" fontSize="4xl" opacity={0.04} transform="rotate(-15deg)" color="text.primary" _dark={{ color: 'white' }}>♠</Text>
                <Text position="absolute" top="25%" right="25%" fontSize="3xl" opacity={0.04} transform="rotate(10deg)" color="brand.pink">♥</Text>
                <Text position="absolute" bottom="20%" left="30%" fontSize="3xl" opacity={0.04} transform="rotate(-8deg)" color="brand.green">♦</Text>
                <Text position="absolute" bottom="30%" right="20%" fontSize="4xl" opacity={0.04} transform="rotate(12deg)" color="text.primary" _dark={{ color: 'white' }}>♣</Text>
            </Box>

            <Text color="text.secondary" fontSize="lg" fontWeight="bold" position="relative" zIndex={1}>
                No public games right now.
            </Text>
            <Button
                as={Link}
                href="/create-game"
                leftIcon={<FiPlus />}
                variant="greenGradient"
                borderRadius="14px"
                boxShadow="btn-premium"
                _hover={{ boxShadow: 'btn-premium-hover', transform: 'translateY(-1px)' }}
                position="relative"
                zIndex={1}
            >
                Create one
            </Button>
        </Flex>
    );
}
