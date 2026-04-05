'use client';

import { Box, Flex, Stack, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useGameEvents } from '@/app/contexts/GameEventsProvider';
import { GameEventRecord } from '@/app/interfaces';
import { evaluateBest5, EvalCard, Suit } from '@/app/lib/poker/pokerHandEval';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import PlayerNameLink from '@/app/components/PlayerNameLink';

const TONE_TINT_LIGHT: Record<string, string> = {
    action: 'rgba(54, 163, 123, 0.05)',
    game_event: 'rgba(51, 68, 121, 0.045)',
    meta_event: 'rgba(235, 11, 92, 0.05)',
};

const TONE_TINT_DARK: Record<string, string> = {
    action: 'rgba(54, 163, 123, 0.10)',
    game_event: 'rgba(51, 68, 121, 0.12)',
    meta_event: 'rgba(235, 11, 92, 0.10)',
};

const skeletonShimmer = keyframes`
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
`;

const SKELETON_CATS: Array<'action' | 'game_event' | 'meta_event'> = [
    'action',
    'game_event',
    'action',
    'meta_event',
    'action',
];

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
    hand_number?: number;
    pots: PotResult[];
    total_pot: number | string;
    revealed_cards: Record<string, RevealedCardInfo>;
    community_cards?: string[];
}

interface PlayerJoinedMetadata {
    seat_id: number;
    buy_in: number | string;
    player_name?: string;
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

interface PlayerEliminatedMetadata {
    player_name?: string;
    seat_id?: number;
    hand_number?: number;
}

interface PlayerRevealedCardsMetadata {
    hole_cards?: [string, string] | string[];
    hand_number?: number;
    seat_id?: number;
    player_uuid?: string;
}

interface RunItTwiceBoardMetadata {
    board_num: number;
    board_cards: string[];
    pots: PotResult[];
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
    const { events, loading, error, hasMore, loadMoreEvents, refreshEvents } =
        useGameEvents();
    const { format } = useFormatAmount();
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
        const d = new Date(timestamp);
        const now = new Date();
        const isToday =
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        const pad = (n: number) => String(n).padStart(2, '0');
        if (isToday) {
            return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }
        return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

    // Helper function to safely format amount via the display-mode-aware hook
    const formatAmount = (amt: number | string | null | undefined): string => {
        if (amt === undefined || amt === null) return format(0);
        const numAmount = typeof amt === 'string' ? parseFloat(amt) : amt;
        return isNaN(numAmount) ? format(0) : format(numAmount);
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

        switch (event_type) {
            case 'hand_started': {
                const meta = metadata as unknown as HandStartedMetadata;
                return (
                    <>
                        <Text
                            as="span"
                            fontWeight="bold"
                            color="text.secondary"
                        >
                            Hand #{meta.hand_number || event.hand_id} started
                        </Text>{' '}
                        <Text as="span" color="text.primary">
                            — SB: {formatAmount(meta.sb_amount)}, BB:{' '}
                            {formatAmount(meta.bb_amount)}
                        </Text>
                        <Text
                            as="span"
                            fontSize="sm"
                            color="text.primary"
                            display="block"
                            mt={1}
                        >
                            <Text
                                as="span"
                                fontWeight="semibold"
                                color="text.primary"
                            >
                                Dealer:
                            </Text>{' '}
                            <PlayerNameLink username={meta.dealer} />
                            {' • '}
                            <Text
                                as="span"
                                fontWeight="semibold"
                                color="text.primary"
                            >
                                SB:
                            </Text>{' '}
                            <PlayerNameLink username={meta.sb_player} />
                            {' • '}
                            <Text
                                as="span"
                                fontWeight="semibold"
                                color="text.primary"
                            >
                                BB:
                            </Text>{' '}
                            <PlayerNameLink username={meta.bb_player} />
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
                    <Text as="span" fontWeight="bold" color="text.primary">
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} /> went{' '}
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

            case 'run_it_twice_board': {
                const meta = metadata as Partial<RunItTwiceBoardMetadata>;
                const boardNum = meta.board_num ?? '?';
                return (
                    <Box>
                        <Text as="span" fontWeight="bold" color="text.secondary">
                            Run It Twice —{' '}
                            <Text as="span" color="purple.600">
                                Board {boardNum}
                            </Text>
                        </Text>

                        {/* Board cards */}
                        {Array.isArray(meta.board_cards) &&
                            meta.board_cards.length > 0 && (
                                <Box mt={1} ml={4}>
                                    <Text
                                        fontSize="xs"
                                        color="purple.600"
                                        fontWeight="bold"
                                    >
                                        Board:{' '}
                                        {convertCardsToEmojis(meta.board_cards)}
                                    </Text>
                                </Box>
                            )}

                        {/* Pot winners for this board */}
                        {Array.isArray(meta.pots) &&
                            meta.pots.length > 0 && (
                                <Box mt={1} ml={4}>
                                    {meta.pots.map((pot, potIdx) => {
                                        const potLabel =
                                            pot.pot_number === 0
                                                ? 'Main Pot'
                                                : `Side Pot ${pot.pot_number}`;
                                        return (
                                            <Box key={potIdx} mt={potIdx > 0 ? 1 : 0}>
                                                <Text
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    color="text.secondary"
                                                >
                                                    {potLabel}:{' '}
                                                    {formatAmount(pot.amount)}
                                                </Text>
                                                {Array.isArray(pot.winners) &&
                                                    pot.winners.map(
                                                        (winner, wi) => (
                                                            <Box
                                                                key={wi}
                                                                ml={4}
                                                                mt={wi > 0 ? 0.5 : 0}
                                                            >
                                                                <Text
                                                                    fontSize="xs"
                                                                    color="green.600"
                                                                    fontWeight="bold"
                                                                >
                                                                    {winner.name}{' '}
                                                                    wins{' '}
                                                                    {formatAmount(
                                                                        winner.share
                                                                    )}
                                                                    {Array.isArray(
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
                                                                {Array.isArray(
                                                                    winner.winning_hand
                                                                ) &&
                                                                    winner
                                                                        .winning_hand
                                                                        .length >
                                                                        0 && (
                                                                        <Box
                                                                            ml={4}
                                                                            mt={0.5}
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
                                                                                            {
                                                                                                ' — '
                                                                                            }
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
                                        );
                                    })}
                                </Box>
                            )}
                    </Box>
                );
            }

            case 'hand_concluded': {
                const meta = metadata as Partial<HandConcludedMetadata>;

                return (
                    <Box>
                        <Text
                            as="span"
                            fontWeight="bold"
                            color="text.secondary"
                        >
                            Hand #{meta.hand_number || event.hand_id} concluded
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
                                                                            <PlayerNameLink
                                                                                username={
                                                                                    winner.name
                                                                                }
                                                                                color="green.600"
                                                                                fontWeight="bold"
                                                                            />{' '}
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
                                                    <PlayerNameLink
                                                        username={
                                                            revealedInfo.username
                                                        }
                                                        fontWeight="bold"
                                                    />{' '}
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
                        <Text as="span" fontWeight="bold" color="text.primary">
                            awarded
                        </Text>
                        : {formatAmount(amount)}
                    </>
                );

            case 'player_joined': {
                const meta = metadata as Partial<PlayerJoinedMetadata>;
                const displayName = player_name || meta.player_name || 'Player';
                return (
                    <>
                        <PlayerNameLink username={displayName} />{' '}
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
                        <PlayerNameLink username={displayName} />{' '}
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
                                </Text>
                            </>
                        )}
                        {meta.reason && (
                            <Text
                                as="span"
                                color="text.muted"
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

            case 'player_eliminated': {
                const meta = metadata as Partial<PlayerEliminatedMetadata>;
                const displayName = player_name || meta.player_name || 'Player';
                const handRef = meta.hand_number ?? event.hand_id;
                return (
                    <>
                        <PlayerNameLink
                            username={displayName}
                            color="red.600"
                            fontWeight="bold"
                        />{' '}
                        was eliminated
                        {meta.seat_id !== undefined && (
                            <> (Seat {meta.seat_id})</>
                        )}
                        {handRef !== undefined && handRef !== null && (
                            <> before Hand #{handRef}</>
                        )}
                    </>
                );
            }

            case 'player_revealed_cards': {
                const meta = metadata as Partial<PlayerRevealedCardsMetadata>;
                const displayName = player_name || 'Player';
                const cards = Array.isArray(meta.hole_cards)
                    ? meta.hole_cards
                    : null;

                return (
                    <Box>
                        <Text as="span" fontWeight="bold" color="text.primary">
                            <PlayerNameLink username={displayName} />{' '}
                            <Text
                                as="span"
                                color="purple.600"
                                fontWeight="bold"
                            >
                                revealed
                            </Text>{' '}
                            cards
                            {cards && cards.length > 0 ? (
                                <>
                                    :{' '}
                                    <Text
                                        as="span"
                                        color="text.secondary"
                                        fontWeight="bold"
                                    >
                                        {convertCardsToEmojis(cards)}
                                    </Text>
                                </>
                            ) : null}
                        </Text>
                        {(meta.hand_number !== undefined ||
                            meta.seat_id !== undefined) && (
                            <Text
                                fontSize="xs"
                                color="text.gray600"
                                mt={0.5}
                                ml={4}
                                fontWeight="bold"
                            >
                                {meta.hand_number !== undefined
                                    ? `Hand #${meta.hand_number}`
                                    : null}
                                {meta.hand_number !== undefined &&
                                meta.seat_id !== undefined
                                    ? ' • '
                                    : null}
                                {meta.seat_id !== undefined
                                    ? `Seat ${meta.seat_id}`
                                    : null}
                            </Text>
                        )}
                    </Box>
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
                        <Text as="span" color="red.600" fontWeight="bold">
                            kicked
                        </Text>
                        {meta.kicked_by_name && (
                            <>
                                {' '}by{' '}
                                <PlayerNameLink
                                    username={meta.kicked_by_name}
                                />
                            </>
                        )}
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
                                remaining
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
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
                        <Text as="span" color="green.600" fontWeight="bold">
                            set ready
                        </Text>
                    </>
                );
            }

            case 'player_set_away': {
                return (
                    <>
                        <PlayerNameLink username={player_name || 'Player'} />{' '}
                        <Text as="span" color="orange.500" fontWeight="bold">
                            set away
                        </Text>
                    </>
                );
            }

            case 'player_identity_updated': {
                const oldName = metadata.old_name as string;
                const newName = metadata.new_name as string;
                return (
                    <>
                        <PlayerNameLink username={oldName || 'Player'} /> is now{' '}
                        <PlayerNameLink
                            username={newName}
                            color="blue.400"
                            fontWeight="bold"
                        />
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
                            {event_type.replace(/_/g, ' ')}
                        </Text>
                        {player_name && <> by {player_name}</>}
                        {amount !== null &&
                            amount !== undefined &&
                            ` (${formatAmount(amount)})`}
                    </>
                );
        }
    };

    const renderHeader = (count: number) => (
        <Flex
            justify="space-between"
            align="center"
            bg="card.lightGray"
            px={{ base: 3, md: 4 }}
            py={2.5}
            borderBottom="1px solid"
            borderColor="border.lightGray"
        >
            <HStack spacing={2.5}>
                <HStack spacing={1}>
                    <Box w="6px" h="6px" borderRadius="full" bg="brand.green" />
                    <Box w="6px" h="6px" borderRadius="full" bg="brand.navy" />
                    <Box w="6px" h="6px" borderRadius="full" bg="brand.pink" />
                </HStack>
                <Text
                    fontSize="2xs"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.10em"
                    fontWeight={800}
                >
                    Activity
                </Text>
                <Text
                    fontSize="xs"
                    color="text.muted"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {count} events
                </Text>
            </HStack>
            <Button
                onClick={refreshEvents}
                isLoading={loading}
                loadingText="..."
                size="xs"
                bg="brand.navy"
                color="white"
                fontFamily="mono"
                fontSize="2xs"
                px={3}
                h="26px"
                borderRadius="6px"
                fontWeight={700}
                border="none"
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #1B2754"
                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                _hover={{ bg: 'brand.navy' }}
                _active={{
                    bg: '#1B2754',
                    transform: 'translateY(1.5px)',
                    boxShadow:
                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #1B2754',
                }}
            >
                Refresh
            </Button>
        </Flex>
    );

    if (loading) {
        return (
            <Box
                bg="card.white"
                borderRadius="12px"
                border="1px solid"
                borderColor="border.lightGray"
                overflow="hidden"
            >
                {renderHeader(0)}
                <Stack spacing={0}>
                    {SKELETON_CATS.map((cat, i) => (
                        <Box
                            key={i}
                            px={{ base: 3, md: 4 }}
                            py={2.5}
                            bg={{
                                base: TONE_TINT_LIGHT[cat],
                                _dark: TONE_TINT_DARK[cat],
                            }}
                            borderLeft={{ base: '2px solid', md: '3px solid' }}
                            borderLeftColor={getBadgeColor(cat)}
                            borderBottom={
                                i === SKELETON_CATS.length - 1
                                    ? undefined
                                    : '1px solid'
                            }
                            borderBottomColor="border.lightGray"
                            animation={`${skeletonShimmer} 1.5s ease-in-out infinite`}
                        >
                            <HStack spacing={3}>
                                <Box
                                    w="80px"
                                    h="10px"
                                    borderRadius="3px"
                                    bg="card.lightGray"
                                />
                                <Box
                                    flex={1}
                                    h="11px"
                                    borderRadius="3px"
                                    bg="card.lightGray"
                                />
                            </HStack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    }

    if (isUnauthorized) {
        return (
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                py={8}
                px={5}
                bg="card.lightGray"
                borderRadius="16px"
                border="1px dashed"
                borderColor="border.lightGray"
                gap={2}
            >
                <Text fontWeight="bold" fontSize="md" color="text.primary">
                    Sign in to view game events
                </Text>
                <Text
                    fontSize="sm"
                    color="text.muted"
                    textAlign="center"
                    maxW="320px"
                >
                    Connect your wallet from the table NavBar — the activity
                    log shows once you&apos;re authenticated.
                </Text>
            </Flex>
        );
    }

    if (events.length === 0) {
        return (
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                py={6}
                px={4}
                bg="card.lightGray"
                borderRadius="16px"
                border="1px dashed"
                borderColor="border.lightGray"
                gap={1.5}
            >
                <Text fontWeight="bold" fontSize="sm" color="text.secondary">
                    No events yet
                </Text>
                <Text fontSize="xs" color="text.muted" textAlign="center">
                    Player actions and game events will appear here as the
                    hand progresses.
                </Text>
            </Flex>
        );
    }

    return (
        <Box
            bg="card.white"
            borderRadius="12px"
            border="1px solid"
            borderColor="border.lightGray"
            overflow="hidden"
        >
            {renderHeader(events.length)}
            <Box
                maxH="70vh"
                overflowY="auto"
                lineHeight="1.4"
                sx={{
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        bg: 'card.lightGray',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bg: 'text.muted',
                        borderRadius: 'full',
                        _hover: {
                            bg: 'text.secondary',
                        },
                    },
                }}
            >
                <VStack align="stretch" gap={0} spacing={0}>
                    {events.map((event, index) => (
                        <Box
                            key={event.id}
                            px={{ base: 3, md: 4 }}
                            py={{ base: 2, md: 2.5 }}
                            bg={{
                                base:
                                    TONE_TINT_LIGHT[event.event_category] ??
                                    'transparent',
                                _dark:
                                    TONE_TINT_DARK[event.event_category] ??
                                    'transparent',
                            }}
                            borderLeft={{ base: '2px solid', md: '3px solid' }}
                            borderLeftColor={getBadgeColor(
                                event.event_category
                            )}
                            borderBottom={
                                index === events.length - 1
                                    ? undefined
                                    : '1px solid'
                            }
                            borderBottomColor="border.lightGray"
                        >
                            <HStack
                                gap={{ base: 2, md: 3 }}
                                align="flex-start"
                            >
                                <Text
                                    color="text.secondary"
                                    fontWeight={700}
                                    minW={{ base: '70px', md: '110px' }}
                                    whiteSpace="nowrap"
                                    fontSize={{ base: '11px', md: 'xs' }}
                                    fontFamily="mono"
                                    sx={{
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {formatTime(event.timestamp)}
                                </Text>
                                <Text
                                    color="text.primary"
                                    wordBreak="break-word"
                                    fontSize={{ base: 'sm', md: 'sm' }}
                                    fontWeight={500}
                                    lineHeight="1.45"
                                    flex="1"
                                    pr={1}
                                >
                                    {formatLogMessage(event)}
                                </Text>
                            </HStack>
                        </Box>
                    ))}
                </VStack>
                {hasMore && (
                    <Box
                        p={3}
                        textAlign="center"
                        borderTop="1px solid"
                        borderColor="border.lightGray"
                        bg="card.lightGray"
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
                            border="none"
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #1B2754"
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: 'brand.navy' }}
                            _active={{
                                bg: '#1B2754',
                                transform: 'translateY(1.5px)',
                                boxShadow:
                                    'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #1B2754',
                            }}
                        >
                            Load More Events
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default GameLog;
