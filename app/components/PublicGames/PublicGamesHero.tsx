'use client';

import Link from 'next/link';
import { Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

export default function PublicGamesHero() {
    return (
        <VStack as="header" align="stretch" spacing={{ base: 4, md: 5 }}>
            <Flex
                w="full"
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'flex-end' }}
                justify="space-between"
                gap={{ base: 4, md: 6 }}
            >
                <VStack align="start" spacing={2} minW={0} maxW="100%">
                    <Heading
                        as="h1"
                        fontWeight="extrabold"
                        letterSpacing="-0.02em"
                        color="text.primary"
                        lineHeight={1.05}
                        sx={{ fontSize: 'clamp(1.625rem, 6.5vw, 2.375rem)' }}
                    >
                        Live tables
                    </Heading>
                    <Text
                        color="text.secondary"
                        fontSize={{ base: 'sm', sm: 'md' }}
                        lineHeight={1.45}
                        maxW="60ch"
                    >
                        USDC poker on Base. Cash tables and tournaments, hosted
                        by players and settled onchain in under 5 seconds.
                    </Text>
                </VStack>
                <Button
                    as={Link}
                    href="/create-game"
                    leftIcon={<FiPlus />}
                    variant="tactilePrimary"
                    borderRadius={{ base: '12px', md: '14px' }}
                    height={{ base: '44px', md: '46px' }}
                    px={{ base: 5, md: 6 }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    w={{ base: 'full', md: 'auto' }}
                    flexShrink={0}
                >
                    Host a table
                </Button>
            </Flex>
        </VStack>
    );
}
