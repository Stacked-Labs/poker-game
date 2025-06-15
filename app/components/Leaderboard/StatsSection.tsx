'use client';

import React, { useContext } from 'react';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

export interface UserStats {
    gamesCreated: number;
    gamesPlayed: number;
}

const defaultStats: UserStats = {
    gamesCreated: 0,
    gamesPlayed: 0,
};

const StatsSection = ({ stats = defaultStats }: { stats?: UserStats }) => {
    const { appState } = useContext(AppContext);

    return (
        <Box width="100%">
            <Heading size="md" mb={4} color="white">
                {appState.username
                    ? `${appState.username}'s Stats`
                    : 'Your Stats'}
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4} color="white">
                <Box>
                    <Text fontWeight="bold">Games Created</Text>
                    <Text>{stats.gamesCreated}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Games Played</Text>
                    <Text>{stats.gamesPlayed}</Text>
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default StatsSection;
