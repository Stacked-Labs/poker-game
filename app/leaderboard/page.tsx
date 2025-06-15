'use client';

import React from 'react';
import { Flex, VStack } from '@chakra-ui/react';
import LeaderboardTable from '@/app/components/Leaderboard/LeaderboardTable';
import PlayerCard from '@/app/components/Leaderboard/PlayerCard';

const LeaderboardPage: React.FC = () => {
    return (
        <Flex
            justify="center"
            align="flex-start"
            bg="gray.200"
            minH="100vh"
            pt={20}
            px={4}
        >
            <VStack spacing={8} width="100%" maxW="800px">
                <PlayerCard />
                <LeaderboardTable />
            </VStack>
        </Flex>
    );
};

export default LeaderboardPage;
