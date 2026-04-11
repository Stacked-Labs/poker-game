'use client';

import React from 'react';
import {
    Box,
    Flex,
    HStack,
    Text,
    Heading,
    Icon,
    Tooltip,
    VStack,
    Spacer,
} from '@chakra-ui/react';
import { FaGem, FaCrown, FaAward, FaBolt } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { blo } from 'blo';
import { getTier } from './tierUtils';

const TIER_ICON: Record<string, IconType> = {
    diamond: FaGem,
    gold:    FaCrown,
    silver:  FaMedal,
    bronze:  FaAward,
    iron:    FaBolt,
};

export interface LeaderboardEntry {
    rank: number;
    address: string;
    points: number;
    handsPlayed: number;
    xUsername?: string | null;
    xProfileImageUrl?: string | null;
}

const PODIUM_COLORS: Record<number, string> = {
    1: '#FFD700',
    2: '#C0C0C0',
    3: '#CD7F32',
};

const LeaderboardTable = ({
    data = [],
    currentAddress,
    total,
}: {
    data?: LeaderboardEntry[];
    currentAddress?: string;
    total?: number;
}) => {
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const normalizedCurrent = currentAddress?.toLowerCase();
    const currentEntry = data.find(
        (e) => e.address.toLowerCase() === normalizedCurrent
    );
    const currentRank = currentEntry?.rank;
    const totalPlayers = total ?? data.length;

    return (
        <Box width="100%">
            {/* Section Header */}
            <HStack spacing={2} align="baseline" mb={{ base: 4, md: 5 }}>
                <Heading
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="extrabold"
                    color="text.primary"
                >
                    Leaderboard
                </Heading>
                <Text fontSize="xs" color="text.secondary">
                    {data.length} players
                </Text>
            </HStack>

            <Box
                width="100%"
                bg="card.white"
                borderRadius="24px"
                boxShadow="0 14px 28px rgba(12, 21, 49, 0.08)"
                _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
                py={{ base: 2, md: 3 }}
                px={{ base: 1, md: 2 }}
            >
                {data.length === 0 ? (
                    <Flex justify="center" align="center" py={10}>
                        <Text color="text.secondary" fontSize="sm">
                            No points earned yet. Play hands on Base Testnet to appear here.
                        </Text>
                    </Flex>
                ) : (
                    <VStack spacing={1} align="stretch">
                        {data.map((entry) => {
                            const isCurrentPlayer =
                                normalizedCurrent &&
                                entry.address.toLowerCase() === normalizedCurrent;

                            const isRivalAbove =
                                currentRank != null &&
                                entry.rank === currentRank - 1 &&
                                !isCurrentPlayer;

                            const isRivalBelow =
                                currentRank != null &&
                                entry.rank === currentRank + 1 &&
                                !isCurrentPlayer;

                            const isRival = isRivalAbove || isRivalBelow;

                            const tier = getTier(entry.rank, totalPlayers);
                            const podiumColor = PODIUM_COLORS[entry.rank];
                            const rivalGap = isRivalAbove
                                ? entry.points - (currentEntry?.points ?? 0)
                                : isRivalBelow
                                    ? (currentEntry?.points ?? 0) - entry.points
                                    : 0;

                            // Left accent bar color
                            const accentColor = isCurrentPlayer
                                ? 'var(--chakra-colors-brand-green)'
                                : isRival
                                    ? 'var(--chakra-colors-brand-yellow)'
                                    : podiumColor ?? undefined;

                            return (
                                <Flex
                                    key={entry.rank}
                                    align="center"
                                    py={{ base: 2.5, md: 3 }}
                                    px={{ base: 3, md: 4 }}
                                    borderRadius="14px"
                                    position="relative"
                                    bg={
                                        isCurrentPlayer
                                            ? 'rgba(54, 163, 123, 0.06)'
                                            : undefined
                                    }
                                    transition="all 0.2s ease"
                                    _hover={{
                                        bg: isCurrentPlayer
                                            ? 'rgba(54, 163, 123, 0.1)'
                                            : 'card.lightGray',
                                        transform: 'translateX(4px)',
                                        _dark: {
                                            bg: isCurrentPlayer
                                                ? 'rgba(54, 163, 123, 0.12)'
                                                : 'legacy.grayDark',
                                        },
                                    }}
                                    boxShadow={
                                        entry.rank === 1
                                            ? '0 0 20px rgba(255, 215, 0, 0.06)'
                                            : undefined
                                    }
                                    // Left accent bar
                                    _before={
                                        accentColor
                                            ? {
                                                  content: '""',
                                                  position: 'absolute',
                                                  left: '0',
                                                  top: '20%',
                                                  bottom: '20%',
                                                  width: '3px',
                                                  borderRadius: 'full',
                                                  bg: accentColor,
                                              }
                                            : undefined
                                    }
                                >
                                    {/* Rank */}
                                    <Text
                                        w="40px"
                                        flexShrink={0}
                                        fontSize={podiumColor ? { base: 'md', md: 'lg' } : { base: 'sm', md: 'md' }}
                                        fontWeight={podiumColor ? 900 : 700}
                                        color={podiumColor ?? 'text.secondary'}
                                    >
                                        #{entry.rank}
                                    </Text>

                                    {/* Player */}
                                    <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
                                        <Box
                                            as="img"
                                            src={entry.xProfileImageUrl ?? blo(entry.address as `0x${string}`)}
                                            alt=""
                                            w={{ base: '28px', md: '32px' }}
                                            h={{ base: '28px', md: '32px' }}
                                            borderRadius={entry.xProfileImageUrl ? 'full' : '4px'}
                                            flexShrink={0}
                                            objectFit="cover"
                                            boxShadow={
                                                isCurrentPlayer
                                                    ? '0 0 0 2px #36A37B'
                                                    : undefined
                                            }
                                        />
                                        <Text
                                            as="a"
                                            href={
                                                entry.xUsername
                                                    ? `https://x.com/${entry.xUsername}`
                                                    : `https://sepolia.basescan.org/address/${entry.address}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            color={isCurrentPlayer ? 'brand.green' : 'text.primary'}
                                            fontWeight={isCurrentPlayer ? 'bold' : 'medium'}
                                            fontFamily={entry.xUsername ? 'body' : 'mono'}
                                            fontSize={{ base: 'xs', md: 'sm' }}
                                            isTruncated
                                            _hover={{ textDecoration: 'underline' }}
                                        >
                                            {entry.xUsername ? `@${entry.xUsername}` : truncateAddress(entry.address)}
                                        </Text>
                                        {isCurrentPlayer && (
                                            <Text
                                                fontSize="2xs"
                                                fontWeight={900}
                                                color="brand.green"
                                                letterSpacing="0.15em"
                                                flexShrink={0}
                                            >
                                                YOU
                                            </Text>
                                        )}
                                        <Tooltip
                                            label={`${tier.label} tier`}
                                            hasArrow
                                            placement="top"
                                            fontSize="xs"
                                        >
                                            <span>
                                                <Icon
                                                    as={TIER_ICON[tier.name]}
                                                    color={tier.color}
                                                    boxSize="14px"
                                                />
                                            </span>
                                        </Tooltip>
                                        {isRival && (
                                            <Tooltip
                                                label={
                                                    isRivalAbove
                                                        ? `Your rival — ${rivalGap.toLocaleString()} pts ahead`
                                                        : `Your rival — ${Math.abs(rivalGap).toLocaleString()} pts behind`
                                                }
                                                hasArrow
                                                placement="top"
                                                fontSize="xs"
                                            >
                                                <Text fontSize="sm" cursor="default" flexShrink={0}>
                                                    ⚔️
                                                </Text>
                                            </Tooltip>
                                        )}
                                    </HStack>

                                    <Spacer />

                                    {/* Points */}
                                    <Text
                                        color={isCurrentPlayer ? 'brand.green' : 'text.primary'}
                                        fontWeight="bold"
                                        fontSize={{ base: 'md', md: 'lg' }}
                                        flexShrink={0}
                                    >
                                        {entry.points.toLocaleString()}
                                    </Text>
                                </Flex>
                            );
                        })}
                    </VStack>
                )}

                {/* Testnet footnote */}
                {data.length > 0 && (
                    <Text
                        fontSize="2xs"
                        color="text.secondary"
                        textAlign="center"
                        pt={3}
                        pb={1}
                        opacity={0.6}
                    >
                        Points are awarded for playing on Base Testnet.
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default LeaderboardTable;
