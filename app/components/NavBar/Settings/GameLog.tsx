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
                return 'brand.green';
            case 'game':
                return 'brand.navy';
            case 'system':
                return 'brand.pink';
            default:
                return 'gray.500';
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
                mb={6}
                color="brand.navy"
                letterSpacing="-0.02em"
            >
                Game Log
            </Text>
            <VStack align="stretch" gap={3}>
                {logEntries.length === 0 ? (
                    <Box
                        p={8}
                        textAlign="center"
                        bg="brand.lightGray"
                        borderRadius="16px"
                        border="2px solid"
                        borderColor="white"
                    >
                        <Text
                            color="gray.600"
                            fontWeight="medium"
                            fontSize="md"
                        >
                            No log entries yet
                        </Text>
                    </Box>
                ) : (
                    logEntries.map((entry, index) => (
                        <Box key={entry.id}>
                            <HStack
                                p={{ base: 4, md: 5 }}
                                bg="white"
                                borderRadius="16px"
                                border="2px solid"
                                borderColor="brand.lightGray"
                                justify="space-between"
                                boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
                                _hover={{
                                    borderColor: 'brand.green',
                                    boxShadow:
                                        '0 8px 20px rgba(54, 163, 123, 0.15)',
                                    transform: 'translateY(-2px)',
                                }}
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                align="start"
                                flexDirection={{ base: 'column', sm: 'row' }}
                                gap={{ base: 3, sm: 0 }}
                            >
                                <VStack align="start" flex={1} gap={2} w="100%">
                                    <HStack flexWrap="wrap" gap={2}>
                                        <Badge
                                            bg={getBadgeColor(entry.type)}
                                            color="white"
                                            fontSize="xs"
                                            px={3}
                                            py={1}
                                            borderRadius="6px"
                                            fontWeight="bold"
                                        >
                                            {entry.type.toUpperCase()}
                                        </Badge>
                                        <Text
                                            fontWeight="bold"
                                            color="brand.navy"
                                            fontSize="md"
                                        >
                                            {entry.action}
                                        </Text>
                                    </HStack>
                                    {entry.player && (
                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                            fontWeight="medium"
                                        >
                                            Player: {entry.player}
                                        </Text>
                                    )}
                                    {entry.details && (
                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                            fontWeight="medium"
                                        >
                                            {entry.details}
                                        </Text>
                                    )}
                                </VStack>
                                <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    minW="fit-content"
                                    fontWeight="semibold"
                                >
                                    {formatTime(entry.timestamp)}
                                </Text>
                            </HStack>
                            {index < logEntries.length - 1 && (
                                <Divider my={2} borderColor="transparent" />
                            )}
                        </Box>
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default GameLog;
