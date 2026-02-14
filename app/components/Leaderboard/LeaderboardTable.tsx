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
} from '@chakra-ui/react';

export interface LeaderboardEntry {
    rank: number;
    username: string;
    address: string;
    points: number;
}

const sampleData: LeaderboardEntry[] = [
    {
        rank: 1,
        username: 'CryptoKing',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        points: 2500,
    },
    {
        rank: 2,
        username: 'PokerPro',
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        points: 2000,
    },
    {
        rank: 3,
        username: 'ChipMaster',
        address: '0x567890abcdef1234567890abcdef1234567890ab',
        points: 1500,
    },
    {
        rank: 4,
        username: 'BluffExpert',
        address: '0xdef1234567890abcdef1234567890abcdef12345',
        points: 1200,
    },
    {
        rank: 5,
        username: 'AllInAce',
        address: '0x890abcdef1234567890abcdef1234567890abcde',
        points: 1000,
    },
    {
        rank: 6,
        username: 'RoyalFlush',
        address: '0xcdef1234567890abcdef1234567890abcdef1234',
        points: 850,
    },
    {
        rank: 7,
        username: 'StackedUp',
        address: '0x4567890abcdef1234567890abcdef1234567890',
        points: 700,
    },
    {
        rank: 8,
        username: 'FoldMaster',
        address: '0xef1234567890abcdef1234567890abcdef123456',
        points: 550,
    },
];

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
    data = sampleData,
}: {
    data?: LeaderboardEntry[];
}) => {
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
                                Points
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((entry) => (
                            <Tr
                                key={entry.rank}
                                _hover={{
                                    transform: 'translateY(-1px)',
                                    bg: 'card.white',
                                    boxShadow:
                                        '0 10px 20px rgba(12, 21, 49, 0.1)',
                                    _dark: {
                                        bg: 'legacy.grayLight',
                                        boxShadow:
                                            '0 12px 22px rgba(0, 0, 0, 0.45)',
                                    },
                                }}
                                transition="all 0.2s ease"
                            >
                                <Td py={{ base: 3, md: 4 }}>
                                    {getRankBadge(entry.rank)}
                                </Td>
                                <Td py={{ base: 3, md: 4 }}>
                                    <HStack spacing={{ base: 2, md: 3 }}>
                                        <Avatar
                                            size={{ base: 'xs', md: 'sm' }}
                                            border="2px solid"
                                            borderColor="rgba(12, 21, 49, 0.15)"
                                            _dark={{
                                                borderColor:
                                                    'rgba(255, 255, 255, 0.2)',
                                            }}
                                        />
                                        <Text
                                            color="text.primary"
                                            fontWeight="medium"
                                            fontFamily="mono"
                                            fontSize={{ base: 'xs', md: 'sm' }}
                                        >
                                            {truncateAddress(entry.address)}
                                        </Text>
                                    </HStack>
                                </Td>
                                <Td py={{ base: 3, md: 4 }} isNumeric>
                                    <Text
                                        color="text.primary"
                                        fontWeight="bold"
                                        fontSize={{ base: 'md', md: 'lg' }}
                                    >
                                        {entry.points.toLocaleString()}
                                    </Text>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default LeaderboardTable;
