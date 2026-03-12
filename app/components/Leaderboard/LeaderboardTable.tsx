'use client';

import React from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Avatar,
    HStack,
    Text,
    Badge,
    Heading,
    Tooltip,
} from '@chakra-ui/react';
import { getTier, TIER_EMOJI } from './tierUtils';

export interface LeaderboardEntry {
    rank: number;
    address: string;
    points: number;
    handsPlayed: number;
}

const rankStyles: Record<
    number,
    { bg: string; color: string; shadow?: string }
> = {
    1: {
        bg: '#FFD700',
        color: '#5C4A00',
        shadow: '0 0 12px rgba(255, 215, 0, 0.5)',
    },
    2: {
        bg: '#C0C0C0',
        color: '#3A3A3A',
        shadow: '0 0 10px rgba(192, 192, 192, 0.4)',
    },
    3: {
        bg: '#CD7F32',
        color: 'white',
        shadow: '0 0 10px rgba(205, 127, 50, 0.4)',
    },
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

    const getRankBadge = (rank: number) => {
        const style = rankStyles[rank];
        if (style) {
            return (
                <Badge
                    bg={style.bg}
                    color={style.color}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                    boxShadow={style.shadow ?? '0 2px 8px rgba(0,0,0,0.15)'}
                >
                    #{rank}
                </Badge>
            );
        }
        return (
            <Badge
                bg="card.lightGray"
                color="text.secondary"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="bold"
            >
                #{rank}
            </Badge>
        );
    };

    return (
        <Box width="100%">
            {/* Section Header */}
            <HStack
                justify="space-between"
                align="center"
                w="full"
                spacing={4}
                mb={{ base: 4, md: 5 }}
            >
                <HStack spacing={3} align="center">
                    <Heading
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="extrabold"
                        color="text.primary"
                    >
                        Leaderboard
                    </Heading>
                    <Badge
                        bg="brand.green"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                    >
                        {data.length}
                    </Badge>
                </HStack>
            </HStack>

            <Text
                fontSize="xs"
                color="text.secondary"
                fontStyle="italic"
                mb={{ base: 4, md: 5 }}
            >
                Points are awarded only for playing on Base Testnet.
            </Text>

            <Box
                width="100%"
                overflowX="auto"
                bg="card.white"
                borderRadius="24px"
                border="1px solid"
                borderColor="border.lightGray"
                boxShadow="0 14px 28px rgba(12, 21, 49, 0.08)"
                _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
            >
                <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                    <Thead>
                        <Tr
                            bg="card.lightGray"
                            borderBottom="1px solid"
                            borderColor="border.lightGray"
                        >
                            <Th
                                color="text.secondary"
                                fontSize={{ base: '2xs', md: 'xs' }}
                                letterSpacing="0.16em"
                                textTransform="uppercase"
                                py={{ base: 3, md: 4 }}
                            >
                                Rank
                            </Th>
                            <Th
                                color="text.secondary"
                                fontSize={{ base: '2xs', md: 'xs' }}
                                letterSpacing="0.16em"
                                textTransform="uppercase"
                                py={{ base: 3, md: 4 }}
                            >
                                Player
                            </Th>
                            <Th
                                color="text.secondary"
                                fontSize={{ base: '2xs', md: 'xs' }}
                                letterSpacing="0.16em"
                                textTransform="uppercase"
                                isNumeric
                                py={{ base: 3, md: 4 }}
                            >
                                Hands
                            </Th>
                            <Th
                                color="text.secondary"
                                fontSize={{ base: '2xs', md: 'xs' }}
                                letterSpacing="0.16em"
                                textTransform="uppercase"
                                isNumeric
                                py={{ base: 3, md: 4 }}
                            >
                                Points
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.length === 0 && (
                            <Tr>
                                <Td colSpan={4} textAlign="center" py={10}>
                                    <Text color="text.secondary" fontSize="sm">
                                        No points earned yet. Play hands on Base Testnet to appear here.
                                    </Text>
                                </Td>
                            </Tr>
                        )}
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
                            const rivalGap = isRivalAbove
                                ? entry.points - (currentEntry?.points ?? 0)
                                : isRivalBelow
                                    ? (currentEntry?.points ?? 0) - entry.points
                                    : 0;

                            return (
                                <Tr
                                    key={entry.rank}
                                    position="relative"
                                    borderLeft={isCurrentPlayer ? '3px solid' : isRival ? '2px dashed' : undefined}
                                    borderLeftColor={
                                        isCurrentPlayer
                                            ? 'brand.green'
                                            : isRival
                                                ? 'brand.yellow'
                                                : undefined
                                    }
                                    bg={
                                        isCurrentPlayer
                                            ? 'rgba(54, 163, 123, 0.06)'
                                            : isRival
                                                ? 'rgba(253, 197, 29, 0.04)'
                                                : undefined
                                    }
                                    _hover={{
                                        transform: 'translateY(-1px)',
                                        bg: isCurrentPlayer
                                            ? 'rgba(54, 163, 123, 0.1)'
                                            : 'card.white',
                                        boxShadow: '0 10px 20px rgba(12, 21, 49, 0.1)',
                                        _dark: {
                                            bg: 'legacy.grayLight',
                                            boxShadow: '0 12px 22px rgba(0, 0, 0, 0.45)',
                                        },
                                    }}
                                    transition="all 0.2s ease"
                                >
                                    {/* Rank */}
                                    <Td py={{ base: 3, md: 4 }}>
                                        <HStack spacing={2}>
                                            {getRankBadge(entry.rank)}
                                            {isCurrentPlayer && (
                                                <Badge
                                                    bg="brand.green"
                                                    color="white"
                                                    fontSize="2xs"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="full"
                                                    fontWeight="bold"
                                                >
                                                    YOU
                                                </Badge>
                                            )}
                                        </HStack>
                                    </Td>

                                    {/* Player */}
                                    <Td py={{ base: 3, md: 4 }}>
                                        <HStack spacing={{ base: 2, md: 3 }}>
                                            <Avatar
                                                size={{ base: 'xs', md: 'sm' }}
                                                border="2px solid"
                                                borderColor={
                                                    isCurrentPlayer
                                                        ? 'brand.green'
                                                        : 'rgba(12, 21, 49, 0.15)'
                                                }
                                                _dark={{
                                                    borderColor: isCurrentPlayer
                                                        ? 'brand.green'
                                                        : 'rgba(255, 255, 255, 0.2)',
                                                }}
                                            />
                                            <Text
                                                color={isCurrentPlayer ? 'brand.green' : 'text.primary'}
                                                fontWeight={isCurrentPlayer ? 'bold' : 'medium'}
                                                fontFamily="mono"
                                                fontSize={{ base: 'xs', md: 'sm' }}
                                            >
                                                {truncateAddress(entry.address)}
                                            </Text>
                                            {/* Tier badge */}
                                            <Tooltip
                                                label={`${tier.label} tier`}
                                                hasArrow
                                                placement="top"
                                                fontSize="xs"
                                            >
                                                <Text
                                                    fontSize="md"
                                                    lineHeight="1"
                                                    cursor="default"
                                                >
                                                    {TIER_EMOJI[tier.name]}
                                                </Text>
                                            </Tooltip>
                                            {/* Rival icon */}
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
                                                    <Text fontSize="sm" cursor="default">⚔️</Text>
                                                </Tooltip>
                                            )}
                                        </HStack>
                                    </Td>

                                    {/* Hands */}
                                    <Td py={{ base: 3, md: 4 }} isNumeric>
                                        <Text
                                            color="text.secondary"
                                            fontWeight="medium"
                                            fontSize={{ base: 'sm', md: 'md' }}
                                        >
                                            {entry.handsPlayed.toLocaleString()}
                                        </Text>
                                    </Td>

                                    {/* Points */}
                                    <Td py={{ base: 3, md: 4 }} isNumeric>
                                        <Text
                                            color={isCurrentPlayer ? 'brand.green' : 'text.primary'}
                                            fontWeight="bold"
                                            fontSize={{ base: 'md', md: 'lg' }}
                                        >
                                            {entry.points.toLocaleString()}
                                        </Text>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default LeaderboardTable;
