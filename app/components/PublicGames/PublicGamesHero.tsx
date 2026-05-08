'use client';

import Link from 'next/link';
import { Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

export default function PublicGamesHero() {
    return (
        <Flex
            w="full"
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'center' }}
            justify="space-between"
            gap={4}
        >
            <VStack align="start" spacing={1.5}>
                <Heading
                    fontSize={{ base: '2xl', md: '3xl' }}
                    fontWeight="extrabold"
                    letterSpacing="-0.02em"
                    color="text.primary"
                    lineHeight={1.1}
                >
                    Public games
                </Heading>
                <Text color="text.secondary" fontSize="sm">
                    Browse live tables. Take a seat or open your own.
                </Text>
            </VStack>
            <Button
                as={Link}
                href="/create-game"
                leftIcon={<FiPlus />}
                variant="tactilePrimary"
                borderRadius="14px"
                height={{ base: '40px', md: '44px' }}
                px={6}
            >
                Create Game
            </Button>
        </Flex>
    );
}
