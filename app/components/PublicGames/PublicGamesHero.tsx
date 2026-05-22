'use client';

import Link from 'next/link';
import {
    Box,
    Button,
    Flex,
    HStack,
    Heading,
    Image,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiPlus } from 'react-icons/fi';
import type { PublicGame } from './types';

const pulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(54, 163, 123, 0.55); }
    50%     { box-shadow: 0 0 0 5px rgba(54, 163, 123, 0); }
`;

interface PublicGamesHeroProps {
    // Used for the live-pulse strip beneath the hero. Pass the visible
    // games + an authoritative totalCount (since the visible list may be
    // paginated). null totalCount = still loading.
    games: PublicGame[];
    totalCount: number | null;
}

export default function PublicGamesHero({
    games,
    totalCount,
}: PublicGamesHeroProps) {
    return (
        <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
            <Flex
                w="full"
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'flex-end' }}
                justify="space-between"
                gap={{ base: 3, md: 4 }}
            >
                <VStack align="start" spacing={1.5} minW={0} maxW="100%">
                    <Heading
                        fontSize={{ base: 'xl', sm: '2xl', md: '3xl' }}
                        fontWeight="extrabold"
                        letterSpacing="-0.02em"
                        color="text.primary"
                        lineHeight={1.1}
                        sx={{ fontSize: 'clamp(1.5rem, 6vw, 1.875rem)' }}
                    >
                        Live tables
                    </Heading>
                    <Text
                        color="text.secondary"
                        fontSize={{ base: 'sm', sm: 'md' }}
                        lineHeight={1.4}
                        maxW="640px"
                    >
                        USDC poker on Base. Hosted by players, settled
                        on-chain in under 5 seconds.
                    </Text>
                </VStack>
                <Button
                    as={Link}
                    href="/create-game"
                    leftIcon={<FiPlus />}
                    variant="tactilePrimary"
                    borderRadius={{ base: '12px', md: '14px' }}
                    height={{ base: '40px', md: '46px' }}
                    px={{ base: 4, md: 6 }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    w={{ base: 'full', md: 'auto' }}
                    flexShrink={0}
                >
                    Host a Table
                </Button>
            </Flex>
            <LivePulse games={games} totalCount={totalCount} />
        </VStack>
    );
}

function LivePulse({
    games,
    totalCount,
}: {
    games: PublicGame[];
    totalCount: number | null;
}) {
    const stripBg = useColorModeValue(
        'rgba(255, 255, 255, 0.7)',
        'rgba(255, 255, 255, 0.04)'
    );
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.08)'
    );
    const valueColor = useColorModeValue('text.primary', 'whiteAlpha.900');
    const labelColor = useColorModeValue('text.muted', 'whiteAlpha.600');
    const divColor = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.08)'
    );

    const isLoading = totalCount === null;
    const tables = totalCount ?? 0;
    const seated = games.reduce((sum, g) => sum + g.player_count, 0);
    const watching = games.reduce((sum, g) => sum + g.spectator_count, 0);
    const cryptoTables = games.filter((g) => g.is_crypto).length;

    return (
        <Flex
            align="center"
            gap={{ base: 2, md: 4 }}
            px={{ base: 3, md: 4 }}
            py={{ base: 2, md: 2.5 }}
            borderRadius="full"
            bg={stripBg}
            border="1px solid"
            borderColor={border}
            overflowX="auto"
            sx={{
                '::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}
        >
            <HStack spacing={2} flexShrink={0}>
                <Box
                    w="7px"
                    h="7px"
                    borderRadius="full"
                    bg="brand.green"
                    animation={`${pulse} 2.2s ease-in-out infinite`}
                />
                <Text
                    fontSize="2xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="0.10em"
                    color="brand.green"
                >
                    Live
                </Text>
            </HStack>
            <Box w="1px" h="18px" bg={divColor} flexShrink={0} />
            <Stat
                value={isLoading ? '—' : tables}
                label={tables === 1 ? 'table' : 'tables'}
                valueColor={valueColor}
                labelColor={labelColor}
            />
            <Stat
                value={isLoading ? '—' : seated}
                label={seated === 1 ? 'seated' : 'seated'}
                valueColor={valueColor}
                labelColor={labelColor}
            />
            <Stat
                value={isLoading ? '—' : watching}
                label="watching"
                valueColor={valueColor}
                labelColor={labelColor}
            />
            <Box flex={1} minW={0} />
            <HStack
                spacing={1.5}
                flexShrink={0}
                opacity={isLoading || cryptoTables === 0 ? 0 : 1}
                transition="opacity 200ms ease"
                aria-hidden={isLoading || cryptoTables === 0}
            >
                <Image
                    src="/usdc-logo.png"
                    alt=""
                    boxSize="14px"
                    loading="lazy"
                />
                <Text
                    fontSize="2xs"
                    fontWeight="semibold"
                    color={labelColor}
                    whiteSpace="nowrap"
                >
                    {cryptoTables} on Base
                </Text>
            </HStack>
        </Flex>
    );
}

function Stat({
    value,
    label,
    valueColor,
    labelColor,
}: {
    value: string | number;
    label: string;
    valueColor: string;
    labelColor: string;
}) {
    return (
        <HStack spacing={1.5} flexShrink={0} align="baseline">
            <Text
                fontWeight="bold"
                fontSize={{ base: 'sm', md: 'md' }}
                color={valueColor}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
                lineHeight="1"
            >
                {value}
            </Text>
            <Text
                fontSize="2xs"
                color={labelColor}
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="semibold"
                whiteSpace="nowrap"
                lineHeight="1"
            >
                {label}
            </Text>
        </HStack>
    );
}
