'use client';

import React from 'react';
import { Divider, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { GiSpades } from 'react-icons/gi';
import { FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const items: { icon: React.ElementType; label: string }[] = [
    { icon: GiSpades, label: 'Marks identity on-chain' },
    { icon: FiTrendingUp, label: 'Boosts your leaderboard standing' },
    { icon: FiArrowRight, label: 'Unlocks more, as we ship it' },
];

const BadgeNarrative: React.FC = () => {
    return (
        <VStack align={{ base: 'center', md: 'start' }} spacing={6} w="full">
            <VStack align={{ base: 'center', md: 'start' }} spacing={4} w="full">
                <Text
                    fontSize="xs"
                    fontWeight={700}
                    color="brand.yellow"
                    textTransform="uppercase"
                    letterSpacing="0.22em"
                >
                    By invitation
                </Text>
                <Text
                    fontSize={{ base: '3xl', md: '5xl' }}
                    fontWeight={800}
                    color="text.primary"
                    lineHeight="1.05"
                    letterSpacing="-0.02em"
                    textAlign={{ base: 'center', md: 'left' }}
                >
                    Stacked Poker Badge
                </Text>
                <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    color="text.secondary"
                    lineHeight="1.55"
                    maxW="48ch"
                    textAlign={{ base: 'center', md: 'left' }}
                >
                    A soulbound mark on Base, given to the partners we work with
                    and the players who shape the room. Non-transferable, and
                    yours for as long as you hold the wallet.
                </Text>
            </VStack>

            <Divider borderColor="border.lightGray" opacity={0.6} />

            <VStack align={{ base: 'center', md: 'start' }} spacing={4} w="full">
                <Text
                    fontSize="xs"
                    fontWeight={700}
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.16em"
                >
                    What it carries
                </Text>
                <VStack align={{ base: 'center', md: 'start' }} spacing={3} w="full">
                    {items.map(({ icon, label }) => (
                        <HStack key={label} spacing={4} align="center">
                            <Flex
                                w="32px"
                                h="32px"
                                borderRadius="8px"
                                bg="rgba(253, 197, 29, 0.12)"
                                _dark={{ bg: 'rgba(253, 197, 29, 0.18)' }}
                                align="center"
                                justify="center"
                                flexShrink={0}
                            >
                                <Icon as={icon} boxSize="16px" color="brand.yellow" />
                            </Flex>
                            <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                color="text.primary"
                                fontWeight={500}
                            >
                                {label}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        </VStack>
    );
};

export default BadgeNarrative;
