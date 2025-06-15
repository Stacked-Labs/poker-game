'use client';

import React from 'react';
import { Flex, VStack, HStack, Box } from '@chakra-ui/react';
import LeaderboardTable from '@/app/components/Leaderboard/LeaderboardTable';
import PlayerCard from '@/app/components/Leaderboard/PlayerCard';

const LeaderboardPage: React.FC = () => {
    return (
        <Box minH="100vh" bg="#2d8b57" pt={32} px={4}>
            <Flex justify="center" align="flex-start">
                <HStack
                    spacing={8}
                    align="flex-start"
                    maxW="1400px"
                    width="100%"
                >
                    {/* Left side - Trading Card Style Player Profile */}
                    <Box flex="0 0 400px">
                        <PlayerCard />
                    </Box>

                    {/* Right side - Leaderboard */}
                    <Box flex="1">
                        <LeaderboardTable />
                    </Box>
                </HStack>
            </Flex>
        </Box>
    );
};

export default LeaderboardPage;
