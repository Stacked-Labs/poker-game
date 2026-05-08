'use client';

import Link from 'next/link';
import { Flex, VStack, Text, Button, Spinner } from '@chakra-ui/react';
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
                        Loading public games…
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
                <Button variant="tactilePrimary" borderRadius="14px" onClick={onRetry}>
                    Retry
                </Button>
            </Flex>
        );
    }

    return (
        <Flex w="full" direction="column" align="center" py={16} gap={4}>
            <Text color="text.secondary" fontSize="lg" fontWeight="bold">
                No public games right now.
            </Text>
            <Button
                as={Link}
                href="/create-game"
                leftIcon={<FiPlus />}
                variant="tactilePrimary"
                borderRadius="14px"
            >
                Create one
            </Button>
        </Flex>
    );
}
