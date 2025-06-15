'use client';

import React, { useContext } from 'react';
import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    VStack,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { FaGamepad, FaPlus } from 'react-icons/fa';
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
            <Heading size="md" mb={4} color="white" textAlign="center">
                {appState.username
                    ? `${appState.username}'s Stats`
                    : 'Game Statistics'}
            </Heading>
            <SimpleGrid columns={2} spacing={4}>
                <VStack
                    p={4}
                    bgColor="charcoal.600"
                    borderRadius="lg"
                    spacing={2}
                >
                    <HStack spacing={2}>
                        <Icon as={FaPlus} color="green.400" />
                        <Text fontWeight="bold" color="white" fontSize="sm">
                            Created
                        </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="green.400">
                        {stats.gamesCreated}
                    </Text>
                </VStack>
                <VStack
                    p={4}
                    bgColor="charcoal.600"
                    borderRadius="lg"
                    spacing={2}
                >
                    <HStack spacing={2}>
                        <Icon as={FaGamepad} color="blue.400" />
                        <Text fontWeight="bold" color="white" fontSize="sm">
                            Played
                        </Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                        {stats.gamesPlayed}
                    </Text>
                </VStack>
            </SimpleGrid>
        </Box>
    );
};

export default StatsSection;
