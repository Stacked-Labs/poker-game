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
    Icon,
} from '@chakra-ui/react';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

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

const LeaderboardTable = ({
    data = sampleData,
}: {
    data?: LeaderboardEntry[];
}) => {
    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Icon as={FaTrophy} color="gold" />;
            case 2:
                return <Icon as={FaMedal} color="silver" />;
            case 3:
                return <Icon as={FaAward} color="#CD7F32" />;
            default:
                return null;
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank <= 3) {
            const colors = {
                1: {
                    bg: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    color: 'white',
                },
                2: {
                    bg: 'linear-gradient(45deg, #C0C0C0, #A8A8A8)',
                    color: 'white',
                },
                3: {
                    bg: 'linear-gradient(45deg, #CD7F32, #B8860B)',
                    color: 'white',
                },
            };
            return (
                <Badge
                    bg={colors[rank as keyof typeof colors].bg}
                    color={colors[rank as keyof typeof colors].color}
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="bold"
                    boxShadow="0 2px 8px rgba(0,0,0,0.3)"
                >
                    #{rank}
                </Badge>
            );
        }
        return (
            <Badge
                colorScheme="gray"
                color="white"
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
        <Box
            width="100%"
            overflowX="auto"
            bgColor="gray.100"
            borderRadius="lg"
            boxShadow="xl"
        >
            <Table variant="simple" size="md">
                <Thead>
                    <Tr>
                        <Th color="white">Rank</Th>
                        <Th color="white">Player</Th>
                        <Th color="white">Address</Th>
                        <Th color="white" isNumeric>
                            Points
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((entry, index) => (
                        <Tr
                            key={entry.rank}
                            _hover={{ bg: 'gray.50' }}
                            transition="background 0.2s"
                        >
                            <Td py={4}>
                                <HStack spacing={3}>
                                    {getRankIcon(entry.rank)}
                                    {getRankBadge(entry.rank)}
                                </HStack>
                            </Td>
                            <Td py={4}>
                                <HStack spacing={3}>
                                    <Avatar
                                        size="sm"
                                        border="2px solid rgba(255, 255, 255, 0.2)"
                                    />
                                    <Text color="white" fontWeight="medium">
                                        {entry.username}
                                    </Text>
                                </HStack>
                            </Td>
                            <Td py={4}>
                                <Text
                                    color="gray.400"
                                    fontFamily="mono"
                                    fontSize="sm"
                                >
                                    {truncateAddress(entry.address)}
                                </Text>
                            </Td>
                            <Td py={4} isNumeric>
                                <Text
                                    color="white"
                                    fontWeight="bold"
                                    fontSize="lg"
                                >
                                    {entry.points.toLocaleString()}
                                </Text>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default LeaderboardTable;
