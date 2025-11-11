'use client';

import { Box, VStack, HStack, Text, Button, Spinner } from '@chakra-ui/react';
import { useGameEvents } from '@/app/contexts/GameEventsProvider';
import { GameEventRecord } from '@/app/interfaces';
import { evaluateBest5, EvalCard, Suit } from '@/app/lib/poker/pokerHandEval';

// Type-safe metadata interfaces
interface HandStartedMetadata {
    hand_number: number;
    sb_amount: number;
    bb_amount: number;
    dealer: string;
    sb_player: string;
    bb_player: string;
}

interface CardsDealtMetadata {
    my_cards?: string[];
}

interface CommunityCardsMetadata {
    cards: string[];
    pot_size: number;
}

interface PotWinner {
    uuid: string;
    name: string;
    share: number | string;
    winning_hand?: string[];
    winning_score?: number;
    hole_cards?: string[];
}

interface PotResult {
    pot_number: number;
    amount: number | string;
    eligible_players: string[];
    winners: PotWinner[];
}

interface RevealedCardInfo {
    username: string;
    cards: string[];
}

interface HandConcludedMetadata {
    pots: PotResult[];
    total_pot: number | string;
    revealed_cards: Record<string, RevealedCardInfo>;
    community_cards?: string[];
}

interface PlayerJoinedMetadata {
    seat_id: number;
    buy_in: number | string;
}

interface GamePausedMetadata {
    paused_by?: string;
}

interface GameResumedMetadata {
    resumed_by?: string;
}

interface PlayerAcceptedMetadata {
    seat_id: number;
    buy_in: number | string;
    queued: boolean;
}

interface PlayerKickedMetadata {
    kicked_by_uuid: string;
    kicked_by_name: string;
    queued: boolean;
    final_stack?: number;
}

interface PlayerLeftMetadata {
    player_name?: string;
    reason?: string;
    final_stack?: number;
}

// Helper function to convert backend card string to EvalCard format
const convertBackendCardToInt = (cardStr: string): EvalCard | null => {
    if (!cardStr || cardStr.length < 2) return null;

    // Card format: rank + suit (e.g., "A♠", "Kh", "10♣")
    const suitChar = cardStr.slice(-1);
    const rankStr = cardStr.slice(0, -1).toUpperCase();

    // Map suit characters to Suit type
    const suitMap: { [key: string]: Suit } = {
        '♠': 's',
        '♥': 'h',
        '♦': 'd',
        '♣': 'c',
        s: 's',
        h: 'h',
        d: 'd',
        c: 'c',
        S: 's',
        H: 'h',
        D: 'd',
        C: 'c',
    };

    // Map rank characters to numeric values (2-14 where 14 is Ace)
    const rankMap: { [key: string]: number } = {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        T: 10,
        J: 11,
        Q: 12,
        K: 13,
        A: 14,
    };

    const suit = suitMap[suitChar];
    const rank = rankMap[rankStr];

    if (!suit || !rank) return null;

    // Create raw integer representation for the card
    const rankIndex = rank - 2; // 0-12
    const suitMasks: { [key in Suit]: number } = {
        c: 0x8000,
        d: 0x4000,
        h: 0x2000,
        s: 0x1000,
    };
    const raw = (rankIndex << 8) | suitMasks[suit];

    return { rank, suit, raw };
};

// Helper function to get hand category from winning cards
const getHandCategoryFromCards = (winningCards: string[]): string | null => {
    if (!winningCards || winningCards.length !== 5) return null;

    const evalCards = winningCards
        .map(convertBackendCardToInt)
        .filter((c): c is EvalCard => c !== null);

    if (evalCards.length !== 5) return null;

    const result = evaluateBest5(evalCards);
    return result?.category ?? null;
};

const GameLog = () => {
    const { events, loading, error, hasMore, loadMoreEvents } = useGameEvents();
    const isUnauthorized = error?.includes('Unauthorized') || false;

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
                // Card format is like "Ah" (Ace of Hearts) or "9d" (9 of Diamonds)
                const suit = card.slice(-1).toLowerCase();
                const rank = card.slice(0, -1).toUpperCase();

                const suitEmoji: { [key: string]: string } = {
                    s: '♠️',
                    h: '♥️',
                    d: '♦️',
                    c: '♣️',
                };

                // Convert 'T' to '10' for display
                const displayRank = rank === 'T' ? '10' : rank;

                return `${displayRank}${suitEmoji[suit] || suit}`;
            })
            .join(' ');
    };

    // Helper function to safely format amount
    const formatAmount = (amt: number | string | null | undefined): string => {
        if (amt === undefined || amt === null) return '0.00';
        const numAmount = typeof amt === 'string' ? parseFloat(amt) : amt;
        return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
    };

    // Get color for action keywords
    const getActionColor = (action: string): string => {
        switch (action.toLowerCase()) {
            case 'folded':
            case 'fold':
                return 'red.500';
            case 'called':
            case 'call':
                return 'blue.500';
            case 'raised':
            case 'raise':
                return 'orange.500';
            case 'bet':
                return 'purple.500';
            case 'checked':
            case 'check':
                return 'green.500';
            case 'all-in':
                return 'red.600';
            default:
                return 'gray.800';
        }
    };

    const formatLogMessage = (event: GameEventRecord) => {
        const { event_type, metadata, amount, player_name } = event;

        // Debug logging for all events
        console.log('[GameLog Event]', {
            event_type,
            event_category: event.event_category,
            player_name,
            amount,
            stage: event.stage ?? null, // stage is optional (omitted for meta events)
            metadata,
            full_event: event,
        });

        switch (event_type) {
            case 'hand_started': {
                const meta = metadata as unknown as HandStartedMetadata;
                return (
                    <>
                        <Text as="span" fontWeight="bold" color="text.secondary">
                            Hand #{meta.hand_number || event.hand_id} started
                        </Text>{' '}
                        — SB: {formatAmount(meta.sb_amount)}, BB:{' '}
                        {formatAmount(meta.bb_amount)}
                        <Text
                            as="span"
                            fontSize="sm"
                            color="gray.600"
                            display="block"
                            mt={1}
                        >
                            <Text as="span" fontWeight="semibold">
                                Dealer:
                            </Text>{' '}
                            {meta.dealer}
                            {' • '}
                            <Text as="span" fontWeight="semibold">
                                SB:
                            </Text>{' '}
                            {meta.sb_player}
                            {' • '}
                            <Text as="span" fontWeight="semibold">
                                BB:
                            </Text>{' '}
                            {meta.bb_player}
                        </Text>
                    </>
                );
            }

            case 'cards_dealt': {
                const meta = metadata as Partial<CardsDealtMetadata>;
                if (Array.isArray(meta.my_cards) && meta.my_cards.length > 0) {
                    return (
                        <>
                            <Text
                                as="span"
                                fontWeight="bold"
                                color="purple.600"
                            >
                                You were dealt:
                            </Text>{' '}
                            {convertCardsToEmojis(meta.my_cards)}
                        </>
                    );
                }
                return (
                    <Text as="span" fontWeight="bold" color='text.primary'>
                        Cards dealt to players
                    </Text>
                );
            }

            case 'flop_dealt': {
                const meta = metadata as Partial<CommunityCardsMetadata>;
                return (
                    <>
                        <Text as="span" color="purple.600" fontWeight="bold">
                            Flop:
                        </Text>{' '}
                        {Array.isArray(meta.cards)
                            ? convertCardsToEmojis(meta.cards.slice(0, 3))
                            : 'N/A'}
                        {meta.pot_size !== undefined && (
                            <> — Pot: {formatAmount(meta.pot_size)}</>
                        )}
                    </>
                );
            }

            case 'turn_dealt': {
                const meta = metadata as Partial<CommunityCardsMetadata>;
                return (
                    <>
                        <Text as="span" color="purple.600" fontWeight="bold">
                            Turn:
                        </Text>{' '}
                        {Array.isArray(meta.cards) && meta.cards.length >= 4
                            ? convertCardsToEmojis(meta.cards.slice(0, 4))
                            : 'N/A'}
                        {meta.pot_size !== undefined && (
                            <> — Pot: {formatAmount(meta.pot_size)}</>
                        )}
                    </>
                );
            }

            case 'river_dealt': {
                const meta = metadata as Partial<CommunityCardsMetadata>;
                return (
                    <>
                        <Text as="span" color="purple.600" fontWeight="bold">
                            River:
                        </Text>{' '}
                        {Array.isArray(meta.cards) && meta.cards.length >= 5
                            ? convertCardsToEmojis(meta.cards)
                            : 'N/A'}
                        {meta.pot_size !== undefined && (
                            <> — Pot: {formatAmount(meta.pot_size)}</>
                        )}
                    </>
                );
            }

            case 'fold':
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text
                            as="span"
                            color={getActionColor('folded')}
                            fontWeight="bold"
                        >
                            folded
                        </Text>
                    </>
                );

            case 'check':
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text
                            as="span"
                            color={getActionColor('checked')}
                            fontWeight="bold"
                        >
                            checked
                        </Text>
                    </>
                );

            case 'call':
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text
                            as="span"
                            color={getActionColor('called')}
                            fontWeight="bold"
                        >
                            called
                        </Text>{' '}
                        {formatAmount(amount)}
                    </>
                );

            case 'bet':
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text
                            as="span"
                            color={getActionColor('bet')}
                            fontWeight="bold"
                        >
                            bet
                        </Text>{' '}
                        {formatAmount(amount)}
                    </>
                );

            case 'raise':
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text
                            as="span"
                            color={getActionColor('raised')}
                            fontWeight="bold"
                        >
                            raised
                        </Text>{' '}
                        to {formatAmount(amount)}
                    </>
                );

            case 'all_in':
                return (
                    <>
                        {player_name || 'Player'} went{' '}
                        <Text
                            as="span"
                            color={getActionColor('all-in')}
                            fontWeight="bold"
                        >
                            all-in
                        </Text>{' '}
                        for {formatAmount(amount)}
                    </>
                );

            case 'hand_concluded': {
                const meta = metadata as Partial<HandConcludedMetadata>;

                return (
                    <Box>
                        <Text as="span" fontWeight="bold" color="text.secondary">
                            Hand #{event.hand_id} concluded
                        </Text>

                        {/* Board cards */}
                        {meta.community_cards &&
                            Array.isArray(meta.community_cards) &&
                            meta.community_cards.length > 0 && (
                                <Box mt={1} ml={4}>
                                    <Text
                                        fontSize="xs"
                                        color="purple.600"
                                        fontWeight="bold"
                                    >
                                        Board:{' '}
                                        {convertCardsToEmojis(
                                            meta.community_cards
                                        )}
                                    </Text>
                                </Box>
                            )}

                        {/* Pots (main pot and side pots) */}
                        {meta.pots &&
                            Array.isArray(meta.pots) &&
                            meta.pots.length > 0 && (
                                <Box mt={1} ml={4}>
                                    {meta.pots.map((pot, potIdx) => {
                                        const potLabel =
                                            pot.pot_number === 0
                                                ? 'Main Pot (MP)'
                                                : `Side Pot ${pot.pot_number} (SP${pot.pot_number})`;

                                        return (
                                            <Box
                                                key={potIdx}
                                                mt={potIdx > 0 ? 2 : 0}
                                            >
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    color="text.secondary"
                                                >
                                                    {potLabel}:{' '}
                                                    {formatAmount(pot.amount)}
                                                </Text>

                                                {/* Winners for this pot */}
                                                {pot.winners &&
                                                    Array.isArray(
                                                        pot.winners
                                                    ) &&
                                                    pot.winners.length > 0 && (
                                                        <Box ml={4} mt={0.5}>
                                                            {pot.winners.map(
                                                                (
                                                                    winner,
                                                                    winnerIdx
                                                                ) => (
                                                                    <Box
                                                                        key={
                                                                            winnerIdx
                                                                        }
                                                                        mt={
                                                                            winnerIdx >
                                                                            0
                                                                                ? 1
                                                                                : 0
                                                                        }
                                                                    >
                                                                        <Text
                                                                            fontSize="xs"
                                                                            color="green.600"
                                                                            fontWeight="bold"
                                                                        >
                                                                            {
                                                                                winner.name
                                                                            }{' '}
                                                                            wins{' '}
                                                                            {formatAmount(
                                                                                winner.share
                                                                            )}
                                                                            {winner.hole_cards &&
                                                                                Array.isArray(
                                                                                    winner.hole_cards
                                                                                ) &&
                                                                                winner
                                                                                    .hole_cards
                                                                                    .length >
                                                                                    0 && (
                                                                                    <>
                                                                                        ,
                                                                                        shows{' '}
                                                                                        <Text
                                                                                            as="span"
                                                                                            color="gray.700"
                                                                                            fontWeight="bold"
                                                                                        >
                                                                                            {convertCardsToEmojis(
                                                                                                winner.hole_cards
                                                                                            )}
                                                                                        </Text>
                                                                                    </>
                                                                                )}
                                                                        </Text>

                                                                        {/* Winning hand and category */}
                                                                        {winner.winning_hand &&
                                                                            Array.isArray(
                                                                                winner.winning_hand
                                                                            ) &&
                                                                            winner
                                                                                .winning_hand
                                                                                .length >
                                                                                0 && (
                                                                                <Box
                                                                                    ml={
                                                                                        4
                                                                                    }
                                                                                    mt={
                                                                                        0.5
                                                                                    }
                                                                                >
                                                                                    <Text
                                                                                        fontSize="xs"
                                                                                        color="gray.700"
                                                                                        fontWeight="bold"
                                                                                    >
                                                                                        Combo:{' '}
                                                                                        {convertCardsToEmojis(
                                                                                            winner.winning_hand
                                                                                        )}
                                                                                        {(() => {
                                                                                            const handCategory =
                                                                                                getHandCategoryFromCards(
                                                                                                    winner.winning_hand
                                                                                                );
                                                                                            return handCategory ? (
                                                                                                <>
                                                                                                    {' '}
                                                                                                    —{' '}
                                                                                                    <Text
                                                                                                        as="span"
                                                                                                        fontWeight="bold"
                                                                                                        color="purple.600"
                                                                                                    >
                                                                                                        {
                                                                                                            handCategory
                                                                                                        }
                                                                                                    </Text>
                                                                                                </>
                                                                                            ) : null;
                                                                                        })()}
                                                                                    </Text>
                                                                                </Box>
                                                                            )}
                                                                    </Box>
                                                                )
                                                            )}
                                                        </Box>
                                                    )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                        {/* Revealed cards section - shows all players who revealed */}
                        {meta.revealed_cards &&
                            Object.keys(meta.revealed_cards).length > 0 && (
                                <Box mt={2} ml={4}>
                                    {Object.entries(meta.revealed_cards).map(
                                        ([uuid, revealedInfo], idx) => {
                                            // Check if this player is a winner (already shown above)
                                            let isWinner = false;

                                            if (meta.pots) {
                                                for (const pot of meta.pots) {
                                                    const winner =
                                                        pot.winners?.find(
                                                            (w) =>
                                                                w.uuid === uuid
                                                        );
                                                    if (winner) {
                                                        isWinner = true;
                                                        break;
                                                    }
                                                }
                                            }

                                            // Only show non-winners here (winners already shown above)
                                            if (isWinner) return null;

                                            return (
                                                <Text
                                                    key={uuid}
                                                    fontSize="xs"
                                                    color="text.gray600"
                                                    mt={idx > 0 ? 0.5 : 0}
                                                    fontWeight="bold"
                                                >
                                                    {revealedInfo.username}{' '}
                                                    showed:{' '}
                                                    <Text
                                                        as="span"
                                                        color="gray.700"
                                                        fontWeight="bold"
                                                    >
                                                        {convertCardsToEmojis(
                                                            revealedInfo.cards
                                                        )}
                                                    </Text>
                                                </Text>
                                            );
                                        }
                                    )}
                                </Box>
                            )}

                        {/* Total pot */}
                        {meta.total_pot !== undefined && (
                            <Text
                                fontSize="xs"
                                color="text.gray600"
                                mt={2}
                                ml={4}
                                fontWeight="bold"
                            >
                                Total pot: {formatAmount(meta.total_pot)}
                            </Text>
                        )}
                    </Box>
                );
            }

            case 'pot_awarded':
                return (
                    <>
                        Pot{' '}
                        <Text as="span" fontWeight="bold">
                            awarded
                        </Text>
                        : {formatAmount(amount)}
                    </>
                );

            case 'player_joined': {
                const meta = metadata as Partial<PlayerJoinedMetadata>;
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="green.600" fontWeight="bold">
                            joined
                        </Text>
                        {meta.seat_id !== undefined && (
                            <> (Seat {meta.seat_id}</>
                        )}
                        {meta.buy_in !== undefined && (
                            <>, Buy-in: {formatAmount(meta.buy_in)}</>
                        )}
                        {meta.seat_id !== undefined && <>)</>}
                    </>
                );
            }

            case 'player_left': {
                const meta = metadata as Partial<PlayerLeftMetadata>;
                const displayName = player_name || meta.player_name || 'Player';
                const chipStack = amount ?? meta.final_stack;
                return (
                    <>
                        {displayName}{' '}
                        <Text as="span" color="red.500" fontWeight="bold">
                            left
                        </Text>{' '}
                        the table
                        {chipStack !== null && chipStack !== undefined && (
                            <>
                                {' '}
                                with{' '}
                                <Text
                                    as="span"
                                    color="text.secondary"
                                    fontWeight="bold"
                                >
                                    {formatAmount(chipStack)}
                                </Text>{' '}
                                chips
                            </>
                        )}
                        {meta.reason && (
                            <Text
                                as="span"
                                color="gray.500"
                                fontSize="xs"
                                fontWeight="normal"
                            >
                                {' '}
                                (
                                {meta.reason === 'player_requested'
                                    ? 'voluntary'
                                    : meta.reason.replace(/_/g, ' ')}
                                )
                            </Text>
                        )}
                    </>
                );
            }

            case 'game_paused': {
                const meta = metadata as Partial<GamePausedMetadata>;
                return (
                    <>
                        Game{' '}
                        <Text as="span" color="orange.500" fontWeight="bold">
                            paused
                        </Text>
                        {meta.paused_by && <> by {meta.paused_by}</>}
                    </>
                );
            }

            case 'game_resumed': {
                const meta = metadata as Partial<GameResumedMetadata>;
                return (
                    <>
                        Game{' '}
                        <Text as="span" color="green.600" fontWeight="bold">
                            resumed
                        </Text>
                        {meta.resumed_by && <> by {meta.resumed_by}</>}
                    </>
                );
            }

            case 'player_accepted': {
                const meta = metadata as Partial<PlayerAcceptedMetadata>;
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="green.600" fontWeight="bold">
                            accepted
                        </Text>
                        {meta.seat_id !== undefined && (
                            <> (Seat {meta.seat_id}</>
                        )}
                        {meta.buy_in !== undefined && (
                            <>, Buy-in: {formatAmount(meta.buy_in)}</>
                        )}
                        {meta.queued && (
                            <Text
                                as="span"
                                color="orange.500"
                                fontWeight="bold"
                            >
                                {' '}
                                — Queued
                            </Text>
                        )}
                        {meta.seat_id !== undefined && <>)</>}
                    </>
                );
            }

            case 'player_denied': {
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="red.500" fontWeight="bold">
                            denied
                        </Text>{' '}
                        seat request
                    </>
                );
            }

            case 'player_kicked': {
                const meta = metadata as Partial<PlayerKickedMetadata>;
                const chipStack = amount ?? meta.final_stack;
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="red.600" fontWeight="bold">
                            kicked
                        </Text>
                        {meta.kicked_by_name && <> by {meta.kicked_by_name}</>}
                        {chipStack !== null && chipStack !== undefined && (
                            <>
                                {' '}
                                with{' '}
                                <Text
                                    as="span"
                                    color="text.secondary"
                                    fontWeight="bold"
                                >
                                    {formatAmount(chipStack)}
                                </Text>{' '}
                                chips remaining
                            </>
                        )}
                        {meta.queued && (
                            <Text
                                as="span"
                                color="orange.500"
                                fontWeight="bold"
                            >
                                {' '}
                                — Queued
                            </Text>
                        )}
                    </>
                );
            }

            case 'player_set_ready': {
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="green.600" fontWeight="bold">
                            set ready
                        </Text>
                    </>
                );
            }

            case 'player_set_away': {
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="orange.500" fontWeight="bold">
                            set away
                        </Text>
                    </>
                );
            }

            case 'player_sit_out_next': {
                return (
                    <>
                        {player_name || 'Player'}{' '}
                        <Text as="span" color="orange.600" fontWeight="bold">
                            will sit out
                        </Text>{' '}
                        next hand
                    </>
                );
            }

            default:
                console.warn(
                    '[GameLog] Unhandled event_type:',
                    event_type,
                    event
                );
                return (
                    <>
                        <Text as="span" color="orange.500" fontWeight="bold">
                            [UNHANDLED EVENT]
                        </Text>{' '}
                        {event_type.replace(/_/g, ' ')}
                        {player_name && <> by {player_name}</>}
                        {amount !== null &&
                            amount !== undefined &&
                            ` (${formatAmount(amount)})`}
                    </>
                );
        }
    };

    if (loading) {
        return (
            <Box>
                <Text
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight={'bold'}
                    mb={6}
                    color="text.secondary"
                    letterSpacing="-0.02em"
                >
                    Game Log
                </Text>
                <Box
                    p={8}
                    textAlign="center"
                    bg="card.lightGray"
                    borderRadius="16px"
                >
                    <Spinner
                        size="xl"
                        color="brand.green"
                        thickness="4px"
                        speed="0.65s"
                    />
                    <Text mt={4} color="text.gray600" fontWeight="medium">
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
                    color="text.secondary"
                    letterSpacing="-0.02em"
                >
                    Game Log
                </Text>
                <Box
                    p={8}
                    textAlign="center"
                    bg="card.lightGray"
                    borderRadius="16px"
                    border="2px solid"
                    borderColor="white"
                >
                    <Text
                        color="text.gray600"
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
                color="text.secondary"
                letterSpacing="-0.02em"
            >
                Game Log
            </Text>
            <Box
                bg="card.white"
                borderRadius="12px"
                border="1px solid"
                borderColor="border.lightGray"
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
                            <Text
                                color="gray.500"
                                fontFamily="mono"
                                fontWeight="bold"
                            >
                                — No events recorded —
                            </Text>
                        </Box>
                    ) : (
                        <VStack align="stretch" gap={0} spacing={0}>
                            {events.map((event, index) => (
                                <Box
                                    key={event.id}
                                    px={{ base: 2, md: 3 }}
                                    py={{ base: 1.5, md: 2 }}
                                    bg={
                                        index % 2 === 0
                                            ? 'input.white'
                                            : 'input.lightGray'
                                    }
                                >
                                    <HStack
                                        gap={{ base: 0.25, md: 1 }}
                                        flexWrap="wrap"
                                        align="baseline"
                                        rowGap={0}
                                    >
                                        <Text
                                            color="gray.500"
                                            fontWeight="bold"
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
                                            color="text.primary"
                                            wordBreak="break-word"
                                            fontSize={{
                                                base: '11px',
                                                md: 'xs',
                                            }}
                                            fontWeight="bold"
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
