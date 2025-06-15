'use client';

import React from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

export interface LeaderboardEntry {
    rank: number;
    username: string;
    points: number;
}

const sampleData: LeaderboardEntry[] = [
    { rank: 1, username: 'Alice', points: 2500 },
    { rank: 2, username: 'Bob', points: 2000 },
    { rank: 3, username: 'Charlie', points: 1500 },
    { rank: 4, username: 'Dave', points: 1200 },
];

const LeaderboardTable = ({
    data = sampleData,
}: {
    data?: LeaderboardEntry[];
}) => {
    return (
        <Box width="100%" overflowX="auto">
            <Table variant="simple" color="white">
                <Thead>
                    <Tr>
                        <Th color="white">Rank</Th>
                        <Th color="white">Player</Th>
                        <Th color="white" isNumeric>
                            Points
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((entry) => (
                        <Tr key={entry.rank}>
                            <Td>{entry.rank}</Td>
                            <Td>{entry.username}</Td>
                            <Td isNumeric>{entry.points}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default LeaderboardTable;
