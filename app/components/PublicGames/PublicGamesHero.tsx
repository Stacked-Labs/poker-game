'use client';

import Link from 'next/link';
import { Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

export default function PublicGamesHero() {
    return (
        <Flex
            w="full"
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            gap={{ base: 3, md: 4 }}
        >
            <VStack align="start" spacing={1} minW={0} maxW="100%">
                <Heading
                    fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }}
                    fontWeight="extrabold"
                    letterSpacing="-0.02em"
                    color="text.primary"
                    lineHeight={1.1}
                    sx={{
                        fontSize: 'clamp(1.4rem, 6vw, 1.875rem)',
                    }}
                >
                    Public games
                </Heading>
                <Text
                    color="text.secondary"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    lineHeight={1.4}
                >
                    Browse live tables. Take a seat or open your own.
                </Text>
            </VStack>
            <Button
                as={Link}
                href="/create-game"
                leftIcon={<FiPlus />}
                variant="tactilePrimary"
                borderRadius="14px"
                height={{ base: '44px', md: '44px' }}
                px={6}
                w={{ base: 'full', md: 'auto' }}
                flexShrink={0}
            >
                Create Game
            </Button>
        </Flex>
    );
}
