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
    usePrefersReducedMotion,
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
                        letterSpacing="-0.025em"
                        color="text.primary"
                        lineHeight={1.05}
                        sx={{ fontSize: 'clamp(1.625rem, 6.5vw, 2.125rem)' }}
                    >
                        Live tables
                    </Heading>
                    <Text
                        color="text.secondary"
                        fontSize={{ base: 'sm', sm: 'md' }}
                        lineHeight={1.45}
                        maxW="56ch"
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
                    height={{ base: '44px', md: '46px' }}
                    px={{ base: 5, md: 6 }}
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
    const prefersReducedMotion = usePrefersReducedMotion();
    const stripBg = useColorModeValue(
        'rgba(255, 255, 255, 0.72)',
        'rgba(255, 255, 255, 0.04)'
    );
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.09)'
    );
    const divColor = useColorModeValue(
        'rgba(11, 20, 48, 0.10)',
        'rgba(255, 255, 255, 0.10)'
    );
    // Subtle inner top highlight for the tactile feel — invisible in dark.
    const stripInsetHighlight = useColorModeValue(
        'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        'inset 0 1px 0 rgba(255, 255, 255, 0.04)'
    );
    // Edge fade hint that the row scrolls horizontally on mobile.
    const edgeFade = useColorModeValue(
        'linear-gradient(to left, rgba(255,255,255,0.85), rgba(255,255,255,0))',
        'linear-gradient(to left, rgba(20,20,24,0.85), rgba(20,20,24,0))'
    );

    const isLoading = totalCount === null;
    const tables = totalCount ?? 0;
    const seated = games.reduce((sum, g) => sum + g.player_count, 0);
    const watching = games.reduce((sum, g) => sum + g.spectator_count, 0);
    const cryptoTables = games.filter((g) => g.is_crypto).length;

    const liveLabel = isLoading
        ? 'Live tables loading'
        : `${tables} live ${tables === 1 ? 'table' : 'tables'}, ${seated} seated, ${watching} watching${
              cryptoTables > 0
                  ? `, ${cryptoTables} on Base`
                  : ''
          }`;

    return (
        <Box position="relative">
            <Flex
                role="status"
                aria-live="polite"
                aria-label={liveLabel}
                align="center"
                gap={{ base: 3, md: 5 }}
                pl={{ base: 3, md: 4 }}
                pr={{ base: 4, md: 5 }}
                py={{ base: 2, md: 2.5 }}
                borderRadius="full"
                bg={stripBg}
                border="1px solid"
                borderColor={border}
                boxShadow={stripInsetHighlight}
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
                        animation={
                            prefersReducedMotion
                                ? undefined
                                : `${pulse} 2.2s ease-in-out infinite`
                        }
                        aria-hidden
                    />
                    <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="0.12em"
                        color="brand.green"
                        lineHeight="1"
                    >
                        Live
                    </Text>
                </HStack>
                <Box
                    w="1px"
                    h="16px"
                    bg={divColor}
                    flexShrink={0}
                    aria-hidden
                />
                <Stat
                    value={isLoading ? '—' : tables}
                    label={tables === 1 ? 'table' : 'tables'}
                    isLoading={isLoading}
                />
                <Stat
                    value={isLoading ? '—' : seated}
                    label="seated"
                    isLoading={isLoading}
                />
                <Stat
                    value={isLoading ? '—' : watching}
                    label="watching"
                    isLoading={isLoading}
                />
                <Box flex={1} minW={{ base: 2, md: 0 }} />
                <HStack
                    spacing={1.5}
                    flexShrink={0}
                    opacity={isLoading || cryptoTables === 0 ? 0 : 1}
                    transition="opacity 220ms ease"
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
                        color="text.muted"
                        whiteSpace="nowrap"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                        lineHeight="1"
                    >
                        {cryptoTables} on Base
                    </Text>
                </HStack>
            </Flex>
            <Box
                aria-hidden
                position="absolute"
                top="1px"
                bottom="1px"
                right="1px"
                w={{ base: '24px', md: '0' }}
                borderRightRadius="full"
                pointerEvents="none"
                bg={edgeFade}
            />
        </Box>
    );
}

function Stat({
    value,
    label,
    isLoading,
}: {
    value: string | number;
    label: string;
    isLoading: boolean;
}) {
    return (
        <HStack spacing={1.5} flexShrink={0} align="baseline">
            <Text
                fontWeight="bold"
                fontSize={{ base: 'sm', md: 'md' }}
                color={isLoading ? 'text.muted' : 'text.primary'}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
                lineHeight="1"
                transition="color 220ms ease"
            >
                {value}
            </Text>
            <Text
                fontSize="2xs"
                color="text.muted"
                textTransform="uppercase"
                letterSpacing="0.10em"
                fontWeight="semibold"
                whiteSpace="nowrap"
                lineHeight="1"
            >
                {label}
            </Text>
        </HStack>
    );
}
