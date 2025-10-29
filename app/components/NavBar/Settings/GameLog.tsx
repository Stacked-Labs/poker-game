'use client';

import { Box, VStack, HStack, Text, Button, Spinner } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { fetchTableEvents } from '@/app/hooks/server_actions';
import { GameEventRecord, EventsResponse } from '@/app/interfaces';
import useToastHelper from '@/app/hooks/useToastHelper';

const GameLog = () => {
    const { appState } = useContext(AppContext);
    const toast = useToastHelper();
    const [events, setEvents] = useState<GameEventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const limit = 50;

    // Load initial events
    useEffect(() => {
        const loadEvents = async () => {
            if (!appState.table) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setIsUnauthorized(false);
                const response: EventsResponse = await fetchTableEvents(
                    appState.table,
                    limit,
                    0
                );
                setEvents(response.events);
                setHasMore(response.has_more);
                setOffset(response.events.length);
            } catch (error) {
                console.error('Failed to load events:', error);
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';
                if (errorMessage.includes('Unauthorized')) {
                    setIsUnauthorized(true);
                } else {
                    toast.error('Failed to load game log');
                }
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState.table]);

    // Load more events
    const loadMoreEvents = async () => {
        if (!appState.table || loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const response: EventsResponse = await fetchTableEvents(
                appState.table,
                limit,
                offset
            );
            setEvents([...events, ...response.events]);
            setHasMore(response.has_more);
            setOffset(offset + response.events.length);
        } catch (error) {
            console.error('Failed to load more events:', error);
            toast.error('Failed to load more events');
        } finally {
            setLoadingMore(false);
        }
    };

    const getBadgeColor = (category: string) => {
        switch (category) {
            case 'action':
                return 'brand.green';
            case 'game_event':
                return 'brand.navy';
            case 'meta_event':
                return 'brand.pink';
            default:
                return 'gray.500';
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const convertCardsToEmojis = (cards: string[]): string => {
        return cards
            .map((card) => {
                // Card format is like "AS" (Ace of Spades) or "9H" (9 of Hearts)
                const suit = card.slice(-1);
                const rank = card.slice(0, -1);

                const suitEmoji: { [key: string]: string } = {
                    S: '♠️',
                    H: '♥️',
                    D: '♦️',
                    C: '♣️',
                };

                return `${rank}${suitEmoji[suit] || suit}`;
            })
            .join(' ');
    };

    const formatLogMessage = (event: GameEventRecord) => {
        const { event_type, metadata, amount } = event;

        switch (event_type) {
            case 'cards_dealt':
                if (
                    Array.isArray(metadata.my_cards) &&
                    metadata.my_cards.length > 0
                ) {
                    return `Cards dealt — Your cards: ${convertCardsToEmojis(metadata.my_cards as string[])}`;
                }
                return 'Cards dealt to players';

            case 'flop_dealt':
                return `Flop dealt: ${Array.isArray(metadata.cards) ? convertCardsToEmojis(metadata.cards as string[]) : 'N/A'}`;

            case 'turn_dealt':
                return `Turn dealt: ${Array.isArray(metadata.cards) && metadata.cards[0] ? convertCardsToEmojis([metadata.cards[0] as string]) : 'N/A'}`;

            case 'river_dealt':
                return `River dealt: ${Array.isArray(metadata.cards) && metadata.cards[0] ? convertCardsToEmojis([metadata.cards[0] as string]) : 'N/A'}`;

            case 'fold':
                return `${metadata.player_name || 'Player'} folded`;

            case 'check':
                return `${metadata.player_name || 'Player'} checked`;

            case 'call':
                return `${metadata.player_name || 'Player'} called $${amount?.toFixed(2) || '0.00'}${metadata.all_in ? ' (All-in)' : ''}`;

            case 'bet':
                return `${metadata.player_name || 'Player'} bet $${amount?.toFixed(2) || '0.00'}${metadata.all_in ? ' (All-in)' : ''}`;

            case 'raise':
                return `${metadata.player_name || 'Player'} raised to $${typeof metadata.to_amount === 'number' ? metadata.to_amount.toFixed(2) : amount?.toFixed(2) || '0.00'}${metadata.all_in ? ' (All-in)' : ''}`;

            case 'all_in':
                return `${metadata.player_name || 'Player'} went all-in with $${amount?.toFixed(2) || '0.00'}`;

            case 'hand_started':
                return `Hand #${event.hand_id} started`;

            case 'hand_concluded': {
                let msg = 'Hand concluded';
                if (
                    Array.isArray(metadata.winners) &&
                    metadata.winners.length > 0
                ) {
                    const winners = (
                        metadata.winners as Array<{
                            name: string;
                            amount: number;
                        }>
                    )
                        .map((w) => `${w.name} ($${w.amount})`)
                        .join(', ');
                    msg += ` — Winners: ${winners}`;
                }
                if (typeof metadata.total_pot === 'number') {
                    msg += ` — Total pot: $${metadata.total_pot.toFixed(2)}`;
                }
                return msg;
            }

            case 'pot_awarded':
                return `Pot awarded: $${amount?.toFixed(2) || '0.00'}`;

            case 'player_joined':
                return `${metadata.player_name || 'Player'} joined the table`;

            case 'player_left':
                return `${metadata.player_name || 'Player'} left the table`;

            case 'game_paused':
                return 'Game paused';

            case 'game_resumed':
                return 'Game resumed';

            default:
                return event_type.replace(/_/g, ' ');
        }
    };

    if (loading) {
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
                <Box
                    p={8}
                    textAlign="center"
                    bg="brand.lightGray"
                    borderRadius="16px"
                >
                    <Spinner
                        size="xl"
                        color="brand.green"
                        thickness="4px"
                        speed="0.65s"
                    />
                    <Text mt={4} color="gray.600" fontWeight="medium">
                        Loading events...
                    </Text>
                </Box>
            </Box>
        );
    }

    if (isUnauthorized) {
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
                        fontWeight="bold"
                        fontSize="lg"
                        mb={2}
                    >
                        Authentication Required
                    </Text>
                    <Text color="gray.500" fontWeight="medium" fontSize="sm">
                        Please connect your wallet to view game events
                    </Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={'bold'}
                mb={4}
                color="brand.navy"
                letterSpacing="-0.02em"
            >
                Game Log
            </Text>
            <Box
                bg="white"
                borderRadius="12px"
                border="1px solid"
                borderColor="gray.200"
                overflow="hidden"
            >
                {/* Log container with terminal-like styling */}
                <Box
                    bg="gray.50"
                    px={{ base: 3, md: 4 }}
                    py={2}
                    borderBottom="1px solid"
                    borderColor="gray.200"
                >
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="white"
                        fontFamily="mono"
                    >
                        EVENT LOG — {events.length} entries
                    </Text>
                </Box>
                <Box
                    maxH="70vh"
                    overflowY="auto"
                    fontFamily="mono"
                    lineHeight="1.4"
                    sx={{
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            bg: 'gray.50',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bg: 'gray.300',
                            borderRadius: 'full',
                            _hover: {
                                bg: 'brand.navy',
                            },
                        },
                    }}
                >
                    {events.length === 0 ? (
                        <Box p={6} textAlign="center">
                            <Text color="gray.500" fontFamily="mono">
                                — No events recorded —
                            </Text>
                        </Box>
                    ) : (
                        <VStack align="stretch" gap={0} spacing={0}>
                            {events.map((event, index) => (
                                <Box
                                    key={event.id}
                                    px={{ base: 2, md: 3 }}
                                    py={{ base: 0.1, md: 0.1 }}
                                    borderBottom={
                                        index < events.length - 1
                                            ? '1px solid'
                                            : 'none'
                                    }
                                    borderColor="gray.100"
                                    _hover={{
                                        bg: 'brand.lightGray',
                                    }}
                                    transition="background 0.1s ease"
                                >
                                    <HStack
                                        gap={{ base: 0.25, md: 1 }}
                                        flexWrap="wrap"
                                        align="baseline"
                                        rowGap={0}
                                    >
                                        <Text
                                            color="gray.500"
                                            fontWeight="medium"
                                            minW="fit-content"
                                            fontSize={{
                                                base: '10px',
                                                md: 'xs',
                                            }}
                                            mr={{ base: 1, md: 0 }}
                                        >
                                            [{formatTime(event.timestamp)}]
                                        </Text>
                                        <Text
                                            color={getBadgeColor(
                                                event.event_category
                                            )}
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            fontSize={{
                                                base: '9px',
                                                md: '10px',
                                            }}
                                            minW="fit-content"
                                            mr={{ base: 1, md: 0 }}
                                        >
                                            [
                                            {event.event_category.replace(
                                                '_',
                                                '-'
                                            )}
                                            ]
                                        </Text>
                                        <Text
                                            color="gray.800"
                                            wordBreak="break-word"
                                            fontSize={{
                                                base: '11px',
                                                md: 'xs',
                                            }}
                                        >
                                            {formatLogMessage(event)}
                                        </Text>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}
                    {hasMore && (
                        <Box
                            p={3}
                            textAlign="center"
                            borderTop="1px solid"
                            borderColor="gray.200"
                            bg="gray.50"
                        >
                            <Button
                                onClick={loadMoreEvents}
                                isLoading={loadingMore}
                                loadingText="Loading..."
                                size="sm"
                                bg="brand.navy"
                                color="white"
                                fontFamily="mono"
                                fontSize="xs"
                                px={6}
                                py={2}
                                borderRadius="6px"
                                fontWeight="bold"
                                _hover={{
                                    bg: 'brand.green',
                                }}
                                transition="all 0.2s ease"
                            >
                                Load More Events
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default GameLog;
