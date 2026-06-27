'use client';

import { Box, Button, Flex, HStack, Icon, Stack, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaCoins, FaShieldAlt } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

export interface RecruitStripProps {
    isOwn: boolean;
}

const CTA_H = { base: '48px', sm: '44px' };

// A shared profile is an acquisition surface. Non-owner leads with PLAY (most viewers are
// players), host second, and carries the brand's #1 trust story (24h self-withdraw, outcomes
// not mechanism). Owner gets play-first + host (sharing lives in the hero).
export default function RecruitStrip({ isOwn }: RecruitStripProps) {
    if (isOwn) {
        return (
            <Flex
                justify={{ base: 'stretch', sm: 'space-between' }}
                align="center"
                direction={{ base: 'column', sm: 'row' }}
                gap={3}
                bg="card.white"
                border="1px solid"
                borderColor="border.felt"
                borderRadius="20px"
                p={{ base: 4, md: 5 }}
            >
                <Text fontWeight={700} color="text.primary">
                    Sit down, or run your own
                </Text>
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={2} w={{ base: 'full', sm: 'auto' }}>
                    {/* Play-first: works for a brand-new player (no tables to manage yet) and a
                        returning host alike. */}
                    <Button
                        as={NextLink}
                        href="/public-games"
                        variant="tactilePrimary"
                        height={CTA_H}
                        _focusVisible={{ boxShadow: 'focus.ring' }}
                        w={{ base: 'full', sm: 'auto' }}
                    >
                        Find a table
                    </Button>
                    <Button
                        as={NextLink}
                        href="/create-game"
                        variant="tactileOutline"
                        leftIcon={<Icon as={FaCoins} boxSize="15px" />}
                        rightIcon={<Icon as={FiArrowRight} />}
                        height={CTA_H}
                        _focusVisible={{ boxShadow: 'focus.ring' }}
                        w={{ base: 'full', sm: 'auto' }}
                    >
                        Host a table
                    </Button>
                </Stack>
            </Flex>
        );
    }

    return (
        <VStack
            align="stretch"
            spacing={4}
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
        >
            <Box>
                <Text fontWeight={800} color="text.primary" fontSize="lg">
                    Your table, your money.
                </Text>
                <Text fontSize="sm" color="text.secondary">
                    You set it up, you approve who sits.
                </Text>
            </Box>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
                <Button
                    as={NextLink}
                    href="/public-games"
                    variant="tactilePrimary"
                    height={CTA_H}
                    _focusVisible={{ boxShadow: 'focus.ring' }}
                    w={{ base: 'full', sm: 'auto' }}
                >
                    See live tables
                </Button>
                <Button
                    as={NextLink}
                    href="/create-game"
                    variant="tactileOutline"
                    leftIcon={<Icon as={FaCoins} boxSize="15px" />}
                    height={CTA_H}
                    _focusVisible={{ boxShadow: 'focus.ring' }}
                    w={{ base: 'full', sm: 'auto' }}
                >
                    Host a table
                </Button>
            </Stack>
            <HStack spacing={2} align="start">
                <Icon as={FaShieldAlt} color="brand.green" boxSize="13px" mt="2px" flexShrink={0} aria-hidden />
                <Text fontSize="sm" color="text.muted">
                    Every table is approved by its Host, and your USDC stays in custody you
                    control, with a 24-hour self-withdraw if anything ever stalls.
                </Text>
            </HStack>
        </VStack>
    );
}
