'use client';

import Link from 'next/link';
import { Flex, VStack, Heading, Text, HStack, Button, Box } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';

const TRANSITION = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

export default function PublicGamesHero() {
    return (
        <Flex
            w="full"
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'center' }}
            justify="space-between"
            gap={{ base: 4, md: 6 }}
            bgGradient="linear(to-br, card.white, rgba(236, 238, 245, 0.5))"
            borderRadius="24px"
            p={{ base: 5, md: 7 }}
            boxShadow="glass"
            backdropFilter="blur(16px)"
            position="relative"
            overflow="hidden"
            _dark={{
                bgGradient: 'linear(to-br, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02))',
            }}
        >
            {/* Watermark suit */}
            <Text
                position="absolute"
                bottom="-20px"
                right="-10px"
                fontSize="120px"
                fontWeight="900"
                opacity={0.04}
                pointerEvents="none"
                userSelect="none"
                lineHeight="1"
                color="text.primary"
                _dark={{ color: 'white' }}
            >
                ♠
            </Text>

            <VStack align="start" spacing={1.5} flex={1} position="relative" zIndex={1}>
                <Heading
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="extrabold"
                    color="text.primary"
                    lineHeight={1.1}
                >
                    <Box as="span" position="relative" display="inline-block">
                        Public
                        <Box
                            as="span"
                            position="absolute"
                            left="-4px"
                            right="-4px"
                            bottom="2px"
                            height="10px"
                            bg="brand.green"
                            opacity={0.18}
                            _dark={{ opacity: 0.3 }}
                            borderRadius="full"
                            zIndex={-1}
                        />
                    </Box>{' '}
                    games,{' '}
                    <Box
                        as="span"
                        display="inline-block"
                        bg="brand.pink"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        transform="rotate(-1.5deg)"
                        boxShadow="0 6px 14px rgba(235, 11, 92, 0.25)"
                        textShadow="0 1px 4px rgba(0, 0, 0, 0.2)"
                    >
                        ready now
                    </Box>
                    .
                </Heading>
                <Text color="text.secondary" fontSize="sm">
                    Browse live tables or spin up your own—no fuss, just cards.
                </Text>
            </VStack>
            <HStack spacing={3} align="center" position="relative" zIndex={1}>
                <Button
                    as={Link}
                    href="/create-game"
                    leftIcon={<FiPlus />}
                    variant="greenGradient"
                    borderRadius="16px"
                    height={{ base: '40px', md: '44px' }}
                    px={{ base: 5, md: 6 }}
                    boxShadow="btn-premium"
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'btn-premium-hover',
                    }}
                    transition={TRANSITION}
                >
                    Create Game
                </Button>
            </HStack>
        </Flex>
    );
}
