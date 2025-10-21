'use client';

import { Box, VStack, HStack, Text, Badge, Divider } from '@chakra-ui/react';

interface LogEntry {
    id: string;
    timestamp: Date;
    action: string;
    player?: string;
    details?: string;
    type: 'action' | 'game' | 'system';
}

const GameLog = () => {
    // Mock log entries - replace with actual game log data from your state
    const logEntries: LogEntry[] = [
        {
            id: '1',
            timestamp: new Date(),
            action: 'Game Started',
            type: 'game',
            details: 'New game session initiated',
        },
        {
            id: '2',
            timestamp: new Date(Date.now() - 60000),
            action: 'Player Joined',
            player: 'Player 1',
            type: 'system',
            details: 'Joined the table',
        },
        {
            id: '3',
            timestamp: new Date(Date.now() - 120000),
            action: 'Bet',
            player: 'Player 2',
            type: 'action',
            details: 'Raised $100',
        },
    ];

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'action':
                return 'green';
            case 'game':
                return 'blue';
            case 'system':
                return 'purple';
            default:
                return 'gray';
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <Box>
            <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={'bold'}
                mb={4}
                color="white"
                fontFamily="Poppins, sans-serif"
            >
                Game Log
            </Text>
            <VStack align="stretch" gap={3}>
                {logEntries.length === 0 ? (
                    <Box
                        p={8}
                        textAlign="center"
                        bg="#262626"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="#363535"
                    >
                        <Text color="#c6c6c6" fontFamily="Poppins, sans-serif">
                            No log entries yet
                        </Text>
                    </Box>
                ) : (
                    logEntries.map((entry, index) => (
                        <Box key={entry.id}>
                            <HStack
                                p={{ base: 3, md: 4 }}
                                bg="#262626"
                                borderRadius="lg"
                                border="2px solid"
                                borderColor="#363535"
                                justify="space-between"
                                _hover={{
                                    borderColor: '#1db954',
                                    bg: '#2e2e2e',
                                }}
                                transition="all 0.2s"
                                align="start"
                                flexDirection={{ base: 'column', sm: 'row' }}
                                gap={{ base: 2, sm: 0 }}
                            >
                                <VStack align="start" flex={1} gap={1} w="100%">
                                    <HStack flexWrap="wrap">
                                        <Badge
                                            colorScheme={getBadgeColor(
                                                entry.type
                                            )}
                                            fontSize="xs"
                                            fontFamily="Poppins, sans-serif"
                                        >
                                            {entry.type.toUpperCase()}
                                        </Badge>
                                        <Text
                                            fontWeight="bold"
                                            color="white"
                                            fontFamily="Poppins, sans-serif"
                                        >
                                            {entry.action}
                                        </Text>
                                    </HStack>
                                    {entry.player && (
                                        <Text
                                            fontSize="sm"
                                            color="#c6c6c6"
                                            fontFamily="Poppins, sans-serif"
                                        >
                                            Player: {entry.player}
                                        </Text>
                                    )}
                                    {entry.details && (
                                        <Text
                                            fontSize="sm"
                                            color="#c6c6c6"
                                            fontFamily="Poppins, sans-serif"
                                        >
                                            {entry.details}
                                        </Text>
                                    )}
                                </VStack>
                                <Text
                                    fontSize="xs"
                                    color="#c6c6c6"
                                    minW="fit-content"
                                    fontFamily="Poppins, sans-serif"
                                >
                                    {formatTime(entry.timestamp)}
                                </Text>
                            </HStack>
                            {index < logEntries.length - 1 && (
                                <Divider my={2} borderColor="#363535" />
                            )}
                        </Box>
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default GameLog;
