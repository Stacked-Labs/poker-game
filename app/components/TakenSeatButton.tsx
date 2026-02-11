import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    HStack,
    Progress,
    Tooltip,
    Tag,
    Icon,
    IconButton,
} from '@chakra-ui/react';
import { MdWifiOff, MdLocalCafe, MdLogout, MdPerson } from 'react-icons/md';
import { FiSmile } from 'react-icons/fi';
import { keyframes } from '@emotion/react';
import {
    motion,
    animate,
    useAnimationControls,
    useReducedMotion,
    AnimatePresence,
} from 'framer-motion';
import { Card, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import { SocketContext } from '../contexts/WebSocketProvider';
import { useSound } from '../contexts/SoundProvider';
import CardComponent from './Card';
import { currentHandLabel } from '@/app/lib/poker/pokerHandEval';
import { sendMessage } from '@/app/hooks/server_actions';
import type { Emote } from '@/app/stores/emotes';
import { useSeatReactionsStore } from '@/app/stores/seatReactions';
import { buildSeatReactionMessage } from '@/app/utils/seatReaction';
import EmotePicker from './NavBar/Chat/EmotePicker';

const pulseBorderPink = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 45, 111, 0.55);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 45, 111, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 45, 111, 0);
  }
`;

const pulseBorderYellow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(253, 197, 29, 0.55);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(253, 197, 29, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(253, 197, 29, 0);
  }
`;

const pulseBorderGreen = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(63, 189, 138, 0.55);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(63, 189, 138, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 189, 138, 0);
  }
`;

const offlinePulse = keyframes`
  0%, 100% {
    opacity: 0.75;
  }
  50% {
    opacity: 0.85;
  }
`;

const bubbleFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const StackValue = React.memo(function StackValue({
    value,
    color,
    fontSize,
}: {
    value: number;
    color: string;
    fontSize: ResponsiveValue<string>;
}) {
    const prefersReducedMotion = useReducedMotion();
    const animationControls = useAnimationControls();
    const previousValueRef = useRef<number>(value);
    const [displayValue, setDisplayValue] = useState<number>(value);

    useEffect(() => {
        animationControls.set({ y: 0, opacity: 1 });
    }, [animationControls]);

    useEffect(() => {
        if (prefersReducedMotion) {
            setDisplayValue(value);
            previousValueRef.current = value;
            return;
        }

        const fromValue = previousValueRef.current;
        if (fromValue === value) {
            return;
        }
        previousValueRef.current = value;
        const direction = value >= fromValue ? 1 : -1;

        const controls = animate(fromValue, value, {
            duration: 0.4,
            ease: 'easeOut',
            onUpdate: (latest) => {
                setDisplayValue(Math.round(latest));
            },
        });

        animationControls.start({
            y: [direction * 6, 0],
            opacity: [0.5, 1],
            transition: { duration: 0.35, ease: 'easeOut' },
        });

        return () => {
            controls.stop();
        };
    }, [value, prefersReducedMotion, animationControls]);

    const formattedValue = useMemo(
        () =>
            Number.isFinite(displayValue)
                ? displayValue.toLocaleString('en-US')
                : '0',
        [displayValue]
    );

    return (
        <Text
            variant="seatText"
            fontSize={fontSize}
            fontWeight="bold"
            lineHeight={1}
            color={color}
            minWidth="fit-content"
        >
            <motion.span
                style={{ display: 'inline-block', willChange: 'transform' }}
                animate={animationControls}
                initial={false}
            >
                {formattedValue}
            </motion.span>
        </Text>
    );
});

const chipPositionStyles: { [key: number]: object } = {
    1: {
        justifyContent: 'center',
        '@media (orientation: portrait)': {
            top: '-30%',
        },
        '@media (orientation: landscape)': {
            top: '-25%',
        },
    },
    2: {
        justifyContent: 'center',
        '@media (orientation: portrait)': {
            top: '15%',
            right: '-110%',
            flexDirection: 'column',
        },
        '@media (orientation: landscape)': {
            top: '-25%',
            right: 0,
            flexDirection: 'row',
        },
    },
    3: {
        '@media (orientation: portrait)': {
            top: '15%',
            right: '-110%',
            flexDirection: 'column',
        },
        '@media (orientation: landscape)': {
            bottom: '23%',
            right: '-110%',
            flexDirection: 'row',
        },
    },
    4: {
        '@media (orientation: portrait)': {
            bottom: '20%',
            right: '-110%',
            flexDirection: 'column',
        },
        '@media (orientation: landscape)': {
            top: '30%',
            right: '-110%',
            flexDirection: 'row',
        },
    },
    5: {
        justifyContent: 'center',
        alignItems: 'start',
        '@media (orientation: portrait)': {
            bottom: '20%',
            right: '-110%',
            flexDirection: 'column',
        },
        '@media (orientation: landscape)': {
            bottom: '-30%',
            right: 0,
            flexDirection: 'row',
        },
    },
    6: {
        justifyContent: 'center',
        flexDirection: 'row',
        '@media (orientation: portrait)': {
            bottom: '-30%',
            right: 0,
        },
        '@media (orientation: landscape)': {
            bottom: '-30%',
            right: 0,
        },
    },
    7: {
        justifyContent: 'center',
        alignItems: 'end',
        '@media (orientation: portrait)': {
            bottom: '20%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            bottom: '-30%',
            left: 0,
            flexDirection: 'row',
        },
    },
    8: {
        alignItems: 'end',
        '@media (orientation: portrait)': {
            bottom: '20%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            top: '30%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    },
    9: {
        alignItems: 'end',
        '@media (orientation: portrait)': {
            top: '15%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            bottom: '23%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    },
    10: {
        justifyContent: 'center',
        alignItems: 'end',
        '@media (orientation: portrait)': {
            top: '15%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            top: '-25%',
            left: '0%',
            flexDirection: 'row',
        },
    },
};

const defaultPositionStyles = {
    top: '100%',
    flexDirection: 'row',
};

const timerColorMap: Record<'green' | 'yellow' | 'red' | 'gray', string> = {
    red: '#FF2D6F',
    yellow: 'brand.yellow',
    green: '#3FBD8A',
    gray: 'gray.400',
};

const TakenSeatButton = ({
    player,
    visualSeatId,
    isCurrentTurn,
    isWinner,
    isRevealed,
    winnings,
    activePotIndex,
    equity,
}: {
    player: Player;
    visualSeatId?: number;
    isCurrentTurn: boolean;
    isWinner: boolean;
    isRevealed: boolean;
    winnings: number;
    activePotIndex: number | null;
    equity: number | null;
}) => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const { play } = useSound();
    const playCardFlip = useCallback(() => play('card_flip'), [play]);
    const address = player?.address;
    const shortEthAddress = address
        ? `${address.slice(0, 2)}...${address.slice(-2)}`
        : '0x00...00';
    const isSelf = appState.clientID
        ? player.uuid === appState.clientID
        : false;
    const prefersReducedMotion = useReducedMotion();
    const seatReaction = useSeatReactionsStore(
        (state) => state.reactionsByTarget[player.uuid]
    );

    // Offline status - default to true if undefined (backwards compatibility)
    const isOffline = player.isOnline === false;
    const seatId = visualSeatId ?? player?.seatID ?? 4;

    const chipPositionSx = chipPositionStyles[seatId] || defaultPositionStyles;

    // Countdown timer logic
    const deadline = appState.game?.actionDeadline ?? 0;
    const [remaining, setRemaining] = useState<number>(0);
    const [initialDuration, setInitialDuration] = useState<number>(0); // ms
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const tickTockPlayedForDeadlineRef = useRef<number | null>(null);
    const tickTockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const actionIndex = appState.game?.action;

    useEffect(() => {
        // Stop any timer if this seat is not the current turn
        if (!isCurrentTurn) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setRemaining(0);
            tickTockPlayedForDeadlineRef.current = null;
            if (tickTockTimeoutRef.current) {
                clearTimeout(tickTockTimeoutRef.current);
                tickTockTimeoutRef.current = null;
            }
            return;
        }

        // For the active player, (re)start the timer whenever deadline changes
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!deadline || deadline === 0) {
            setRemaining(0);
            tickTockPlayedForDeadlineRef.current = null;
            if (tickTockTimeoutRef.current) {
                clearTimeout(tickTockTimeoutRef.current);
                tickTockTimeoutRef.current = null;
            }
            return;
        }

        const calcAndSet = () => {
            const diff = Math.max(deadline - Date.now(), 0);
            setRemaining(diff);
        };

        const initial = Math.max(deadline - Date.now(), 0);
        setInitialDuration(initial);

        calcAndSet();
        intervalRef.current = setInterval(calcAndSet, 250);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [deadline, actionIndex, isCurrentTurn, seatId]);

    useEffect(() => {
        if (tickTockTimeoutRef.current) {
            clearTimeout(tickTockTimeoutRef.current);
            tickTockTimeoutRef.current = null;
        }

        if (!isSelf || !isCurrentTurn || !deadline) return;

        const alreadyPlayedForThisDeadline =
            tickTockPlayedForDeadlineRef.current === deadline;

        if (alreadyPlayedForThisDeadline) return;

        const now = Date.now();
        if (deadline <= now) return;

        const msUntilPlay = Math.max(deadline - now - 5000, 0);
        tickTockTimeoutRef.current = setTimeout(() => {
            tickTockPlayedForDeadlineRef.current = deadline;
            play('tick_tock');
        }, msUntilPlay);

        return () => {
            if (tickTockTimeoutRef.current) {
                clearTimeout(tickTockTimeoutRef.current);
                tickTockTimeoutRef.current = null;
            }
        };
    }, [deadline, isCurrentTurn, isSelf, play]);

    const total = initialDuration || 1; // avoid divide by zero
    const progress = Math.min((remaining / total) * 100, 100);
    const barScheme: 'green' | 'yellow' | 'red' | 'gray' = isCurrentTurn
        ? remaining <= 5000
            ? 'red'
            : remaining <= 10000
              ? 'yellow'
              : 'green'
        : 'gray';

    const timerColor = timerColorMap[barScheme] || 'brand.navy';

    const pots = appState.game?.pots ?? [];
    const resolvedPot =
        typeof activePotIndex === 'number' &&
        activePotIndex >= 0 &&
        activePotIndex < pots.length
            ? pots[activePotIndex]
            : pots.find((pot) =>
                  pot.winners?.some((w) => (w.winningHand?.length ?? 0) > 0)
              );
    const playerWinsActivePot = resolvedPot
        ? Boolean(resolvedPot.winningPlayerNums?.includes(player.position))
        : isWinner;
    const winningSet = new Set<number>();
    if (playerWinsActivePot) {
        const winner = resolvedPot?.winners?.find(
            (w) => w.playerNum === player.position
        );
        (winner?.winningHand ?? []).forEach((card) => {
            winningSet.add(Number(card));
        });
    }
    const hasWinningComboForPlayer = winningSet.size > 0;
    const showWinnerHighlight =
        activePotIndex === null ? isWinner : playerWinsActivePot;
    const highlightVariant = isCurrentTurn
        ? 'active'
        : showWinnerHighlight
          ? 'winner'
          : null;
    const highlightBorderColor =
        highlightVariant === 'active'
            ? timerColor
            : highlightVariant === 'winner'
              ? 'brand.yellow'
              : 'brand.darkNavy';
    const highlightShadow =
        highlightVariant === 'active'
            ? barScheme === 'green'
                ? '0 6px 18px rgba(63, 189, 138, 0.35)'
                : barScheme === 'yellow'
                  ? '0 6px 18px rgba(253, 197, 29, 0.3)'
                  : '0 6px 18px rgba(255, 45, 111, 0.4)'
            : highlightVariant === 'winner'
              ? '0 6px 18px rgba(253, 197, 29, 0.3)'
              : '0 2px 8px rgba(11, 20, 48, 0.3)';
    const highlightPulse =
        highlightVariant && !prefersReducedMotion
            ? `${
                  highlightVariant === 'active'
                      ? barScheme === 'green'
                          ? pulseBorderGreen
                          : barScheme === 'yellow'
                            ? pulseBorderYellow
                            : pulseBorderPink
                      : pulseBorderYellow
              } 2s ease-out infinite`
            : 'none';
    const emoteIconColor =
        isCurrentTurn || showWinnerHighlight ? 'gray.400' : 'whiteAlpha.600';
    const emoteIconHoverBg =
        isCurrentTurn || showWinnerHighlight
            ? 'blackAlpha.50'
            : 'whiteAlpha.100';
    const emoteIconActiveBg =
        isCurrentTurn || showWinnerHighlight
            ? 'blackAlpha.100'
            : 'whiteAlpha.200';
    const canSendSeatReaction =
        Boolean(socket) &&
        socket?.readyState === WebSocket.OPEN &&
        Boolean(appState.username || appState.clientID);
    const handleSelectSeatEmote = useCallback(
        (emote: Emote) => {
            if (!socket || socket.readyState !== WebSocket.OPEN) return;
            if (!player.uuid) return;

            const payload = buildSeatReactionMessage({
                targetUuid: player.uuid,
                emoteId: emote.id,
                emoteName: emote.name,
                senderUuid: appState.clientID,
                nonce: `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                ts: Date.now(),
            });

            sendMessage(socket, payload);
        },
        [appState.clientID, player.uuid, socket]
    );
    const stackColor =
        showWinnerHighlight && winnings > 0
            ? 'brand.green'
            : isCurrentTurn
              ? 'brand.darkNavy'
              : 'white';

    // Compute hand strength label per display rules
    const strengthLabel: string | null = useMemo(() => {
        const game = appState.game;
        if (!game) return null;
        const board = (game.communityCards || [])
            .map((c) => Number(c))
            .filter((c) => c > 0); // Filter out 0 and negative values
        const hole = (player.cards || [])
            .map((c) => Number(c))
            .filter((c) => c > 0); // Filter out 0 and negative values (e.g., -1 for away players)

        // Visibility rules:
        // - Self or any player: only show once board has at least the flop (3 cards)
        // - Others: additionally require both hole cards to be valid positive numbers (visible)
        const boardHasFlop = board.length >= 3;
        if (!boardHasFlop) return null;

        // Check if both hole cards are valid (positive numbers, not -1 or 0)
        const bothHoleVisible = hole.length >= 2 && hole[0] > 0 && hole[1] > 0;

        // Determine if this seat is "self" by matching uuid against clientID when available
        const isSelf = appState.clientID
            ? player.uuid === appState.clientID
            : false;

        if (!isSelf && !bothHoleVisible) return null;

        // Only evaluate hand if we have valid hole cards
        if (!bothHoleVisible) return null;

        const label = currentHandLabel(hole as number[], board as number[]);
        return label ?? null;
    }, [appState.clientID, appState.game, player.cards, player.uuid]);

    if (!appState.game) {
        return null;
    }

    const showDealerBadge =
        appState.game.running && appState.game.dealer == player.position;
    const showCheckBubble =
        appState.game.running && player.called && player.bet === 0;
    const showBetBubble = player.bet !== 0;
    const showActionBubble = showCheckBubble || showBetBubble;
    const dealerBadgeBoxSize = { base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 };
    const actionBubbleSlotWidth = {
        base: '56px',
        md: '72px',
        lg: '76px',
        xl: '76px',
        '2xl': '92px',
    };
    const reverseDealerGroupInPortrait =
        seatId === 7 || seatId === 8 || seatId === 9 || seatId === 10;
    const reverseDealerGroupInLandscape = seatId === 8 || seatId === 9;

    return (
        <Flex
            className={`taken-seat-button ${isOffline ? 'offline' : ''}`}
            width={'100%'}
            height={'100%'}
            sx={{
                '@media (orientation: portrait)': {
                    width: '90%',
                },
            }}
            position={'relative'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            {/* Away badge moved into player info container below */}
            <Flex
                className="chip-position-container"
                position={'absolute'}
                key="betbox"
                width={'100%'}
                gap={2}
                sx={chipPositionSx}
                zIndex={5}
            >
                {showDealerBadge ? (
                    <Flex
                        width="fit-content"
                        alignItems="center"
                        gap={1}
                        pointerEvents="none"
                        sx={{
                            '@media (orientation: portrait)': {
                                flexDirection: reverseDealerGroupInPortrait
                                    ? 'row-reverse'
                                    : 'row',
                            },
                            '@media (orientation: landscape)': {
                                flexDirection: reverseDealerGroupInLandscape
                                    ? 'row-reverse'
                                    : 'row',
                            },
                        }}
                    >
                        <Text
                            fontWeight="bold"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            bg="brand.lightGray"
                            color="brand.navy"
                            width={dealerBadgeBoxSize}
                            height={dealerBadgeBoxSize}
                            variant={'seatText'}
                            zIndex={3}
                            boxShadow="0 2px 8px rgba(51, 68, 121, 0.3)"
                            flexShrink={0}
                        >
                            D
                        </Text>
                        <Flex
                            width={actionBubbleSlotWidth}
                            justifyContent="flex-start"
                            pointerEvents="none"
                            sx={{
                                '@media (orientation: portrait)': {
                                    justifyContent: reverseDealerGroupInPortrait
                                        ? 'flex-end'
                                        : 'flex-start',
                                },
                                '@media (orientation: landscape)': {
                                    justifyContent:
                                        reverseDealerGroupInLandscape
                                            ? 'flex-end'
                                            : 'flex-start',
                                },
                            }}
                        >
                            <Text
                                borderRadius="1.5rem"
                                px={{ base: 2, md: 3 }}
                                py={0}
                                width="fit-content"
                                maxWidth="100%"
                                bg={
                                    showBetBubble
                                        ? 'brand.yellow'
                                        : 'brand.lightGray'
                                }
                                fontWeight="bold"
                                color={
                                    showBetBubble
                                        ? 'brand.navy'
                                        : 'brand.darkNavy'
                                }
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                variant={'seatText'}
                                fontSize={{
                                    base: '10px',
                                    sm: '10px',
                                    md: '14px',
                                }}
                                zIndex={3}
                                boxShadow={
                                    showBetBubble
                                        ? '0 2px 8px rgba(253, 197, 29, 0.3)'
                                        : '0 2px 8px rgba(54, 163, 123, 0.3)'
                                }
                                animation={
                                    showActionBubble
                                        ? `${bubbleFadeIn} 0.25s ease-out`
                                        : undefined
                                }
                                visibility={
                                    showActionBubble ? 'visible' : 'hidden'
                                }
                                noOfLines={1}
                            >
                                {showBetBubble ? player.bet : 'Check'}
                            </Text>
                        </Flex>
                    </Flex>
                ) : null}
                {/* Check bubble - shows when player has called with no bet (checked) */}
                {!showDealerBadge && showCheckBubble && (
                    <Text
                        borderRadius="1.5rem"
                        px={{ base: 2, md: 3 }}
                        py={0}
                        w={'fit-content'}
                        bg="brand.lightGray"
                        fontWeight="bold"
                        color="brand.darkNavy"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        variant={'seatText'}
                        fontSize={{ base: '10px', sm: '10px', md: '14px' }}
                        zIndex={3}
                        boxShadow="0 2px 8px rgba(54, 163, 123, 0.3)"
                        animation={`${bubbleFadeIn} 0.25s ease-out`}
                    >
                        Check
                    </Text>
                )}
                {/* Bet amount - shows when player has bet (replaces Check if they bet later) */}
                {!showDealerBadge && showBetBubble && (
                    <Text
                        borderRadius="1.5rem"
                        px={{ base: 2, md: 3 }}
                        py={0}
                        w={'fit-content'}
                        bg="brand.yellow"
                        fontWeight="bold"
                        color="brand.navy"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        variant={'seatText'}
                        fontSize={{ base: '10px', sm: '10px', md: '14px' }}
                        zIndex={3}
                        boxShadow="0 2px 8px rgba(253, 197, 29, 0.3)"
                        animation={`${bubbleFadeIn} 0.25s ease-out`}
                    >
                        {player.bet}
                    </Text>
                )}
            </Flex>
            <Flex
                className="seat-core"
                width="100%"
                height="100%"
                position="relative"
                alignItems="center"
                justifyContent="center"
                zIndex={1}
                sx={{
                    ...(isOffline && {
                        filter: 'grayscale(100%)',
                        animation: prefersReducedMotion
                            ? 'none'
                            : `${offlinePulse} 3s ease-in-out infinite`,
                    }),
                }}
            >
                <Flex
                    className="player-cards-container"
                    position={'absolute'}
                    justifyContent={'center'}
                    width={'100%'}
                    height={'100%'}
                    gap={0}
                    left="50%"
                    transform="translateX(-50%)"
                    marginTop={{ base: 0, md: '12px' }}
                >
                    <AnimatePresence mode="wait">
                        {(() => {
                            // Determine if this is the current user's cards (needed for render condition)
                            const isSelfPlayer = appState.clientID
                                ? player.uuid === appState.clientID
                                : false;

                            const game = appState.game;

                            // Determine if we are in showdown/reveal window state (hand ended, before next hand starts)
                            const isShowdown = Boolean(
                                game &&
                                    game.stage === 1 &&
                                    !game.betting &&
                                    (game.actionDeadline ?? 0) === 0 &&
                                    ((game.pots?.length || 0) > 0 ||
                                        (game.communityCards || []).some(
                                            (card) => Number(card) > 0
                                        ))
                            );

                            // Check if player has real (revealed) cards - not [0,0] or [-1,-1]
                            const hasRevealedCards =
                                Number(player.cards[0]) > 0 &&
                                Number(player.cards[1]) > 0;

                            // Only render cards if:
                            // - Player is still in hand, OR
                            // - It's the current user (so they can see their folded cards dimmed), OR
                            // - It's showdown AND player has revealed cards (backend sends real values for showdown participants), OR
                            // - This player is the winner (so their cards remain visible even if they win by fold)
                            const shouldRenderCards =
                                appState.game.running &&
                                Number(player.cards[0]) !== -1 &&
                                (player.in ||
                                    isSelfPlayer ||
                                    (isShowdown && hasRevealedCards) ||
                                    showWinnerHighlight);

                            if (!shouldRenderCards) return null;

                            return player.cards.map(
                                (card: Card, index: number) => {
                                    const isCardWinning = winningSet.has(
                                        Number(card)
                                    );

                                    // Dimming rules:
                                    // - During showdown: winners dim ONLY non-winning cards; losers dim all cards
                                    // - Otherwise: dim players who folded / are not in hand, but NEVER dim the overall winner highlight
                                    const dimThisCard = isShowdown
                                        ? playerWinsActivePot
                                            ? hasWinningComboForPlayer
                                                ? !isCardWinning
                                                : false
                                            : true
                                        : !player.in && !showWinnerHighlight;

                                    // Folded visual (for non-showdown states) still uses folded prop,
                                    // but do not treat winner's cards as folded (they should remain visible)
                                    const foldedVisual =
                                        !isShowdown &&
                                        !player.in &&
                                        !showWinnerHighlight;

                                    // Skip flip animation for enemy players only when NOT in showdown
                                    // During showdown, allow flip animation so opponent cards reveal smoothly
                                    const skipAnimation =
                                        !isSelfPlayer && !isShowdown;

                                    return (
                                        <motion.div
                                            key={`${player.seatID}-card-${index}`}
                                            className={`player-card seat-${player.seatID}-card-${index}`}
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.9,
                                                y: 20,
                                                transition: {
                                                    duration: 0.5,
                                                    ease: 'easeOut',
                                                },
                                            }}
                                            style={{
                                                width: '48%',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                padding: 0,
                                                margin: 0,
                                            }}
                                        >
                                            <CardComponent
                                                card={card}
                                                placeholder={false}
                                                folded={foldedVisual}
                                                highlighted={isCardWinning}
                                                dimmed={dimThisCard}
                                                skipAnimation={skipAnimation}
                                                onFlipStart={playCardFlip}
                                            />
                                        </motion.div>
                                    );
                                }
                            );
                        })()}
                    </AnimatePresence>
                    {equity !== null && (
                        <Box
                            className="equity-badge"
                            position="absolute"
                            top="-6px"
                            right="-8px"
                            bg={
                                equity > 50
                                    ? '#1B7A4E'
                                    : equity >= 30
                                      ? 'gray.500'
                                      : 'red.500'
                            }
                            color="white"
                            fontSize={{ base: '9px', md: '11px' }}
                            px={{ base: '4px', md: '5px' }}
                            py={{ base: '2px', md: '3px' }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            lineHeight={1}
                            whiteSpace="nowrap"
                            pointerEvents="none"
                            zIndex={5}
                            fontWeight="bold"
                            borderRadius="full"
                            sx={{
                                '@media (orientation: portrait)': {
                                    fontSize: '12px',
                                    px: '6px',
                                    py: '3px',
                                    top: '-7px',
                                    right: '-8px',
                                },
                            }}
                        >
                            {equity}%
                        </Box>
                    )}
                </Flex>
                <Box
                    className="player-info-wrapper"
                    position={'relative'}
                    width={'110%'}
                    zIndex={1}
                    alignSelf={'flex-end'}
                >
                    <Flex
                        className="player-info-container"
                        direction={'column'}
                        bg={
                            isCurrentTurn || showWinnerHighlight
                                ? 'white'
                                : 'brand.darkNavy'
                        }
                        borderRadius={4}
                        width={'100%'}
                        paddingX={0}
                        paddingTop={{ base: 1, sm: 1, md: 2 }}
                        paddingBottom={{ base: 2, sm: 2, md: '8%' }}
                        justifySelf={'flex-end'}
                        justifyContent={'center'}
                        alignItems={'flex-start'}
                        transition={'all 0.5s ease-in-out'}
                        position={'relative'}
                        border="2px solid"
                        borderColor={
                            highlightVariant
                                ? highlightBorderColor
                                : showWinnerHighlight
                                  ? 'brand.yellow'
                                  : 'brand.darkNavy'
                        }
                        boxShadow={highlightShadow}
                        animation={highlightPulse}
                    >
                        {/* Status badges rendered above the container without affecting layout */}
                        {/* Disconnected badge - shown when player loses connection */}
                        {isOffline && (
                            <Tag
                                position="absolute"
                                top={{ base: -2, md: -3 }}
                                left={0}
                                bg="gray.600"
                                color="gray.100"
                                variant="solid"
                                size={{ base: 'xs', md: 'sm' }}
                                fontSize={{ base: '8px', md: 'sm' }}
                                px={{ base: 1, md: 2 }}
                                py={{ base: 0.1, md: 0.2 }}
                                zIndex={5}
                                fontWeight="bold"
                                borderRadius="6px"
                                boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
                                display="flex"
                                alignItems="center"
                                gap={1}
                            >
                                <Icon
                                    as={MdWifiOff}
                                    boxSize={{ base: 2.5, md: 3 }}
                                />
                                <Text
                                    as="span"
                                    display={{ base: 'none', md: 'inline' }}
                                >
                                    Offline
                                </Text>
                            </Tag>
                        )}
                        {player.stack > 0 &&
                            !player.ready &&
                            (!isSelf || !player.in) &&
                            !isOffline &&
                            !player.leaveAfterHand && (
                                <Tag
                                    position="absolute"
                                    top={{ base: -2, md: -3 }}
                                    right={0}
                                    bg={
                                        player.readyNextHand
                                            ? 'brand.lightGray'
                                            : 'brand.yellow'
                                    }
                                    color="brand.lightGray"
                                    variant="solid"
                                    size={{ base: 'xs', md: 'sm' }}
                                    fontSize={{ base: '8px', md: 'sm' }}
                                    px={{ base: 1, md: 2 }}
                                    py={{ base: 0.1, md: 0.2 }}
                                    zIndex={3}
                                    fontWeight="bold"
                                    borderRadius="6px"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon
                                        as={MdPerson}
                                        color="brand.darkNavy"
                                        boxSize={{ base: 2.5, md: 3 }}
                                    />
                                    <Text
                                        as="span"
                                        display={{ base: 'none', md: 'inline' }}
                                        color="brand.darkNavy"
                                    >
                                        {player.readyNextHand
                                            ? 'Joining...'
                                            : 'Away'}
                                    </Text>
                                </Tag>
                            )}
                        {player.sitOutNextHand &&
                            player.ready &&
                            (!isSelf || !player.in) &&
                            !isOffline &&
                            !player.leaveAfterHand && (
                                <Tag
                                    position="absolute"
                                    top={{ base: -2, md: -3 }}
                                    right={0}
                                    bg="brand.yellow"
                                    color="brand.lightNavy"
                                    variant="solid"
                                    size={{ base: 'xs', md: 'sm' }}
                                    fontSize={{ base: '8px', md: 'sm' }}
                                    px={{ base: 1, md: 2 }}
                                    py={{ base: 0.1, md: 0.2 }}
                                    zIndex={3}
                                    fontWeight="bold"
                                    borderRadius="6px"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon
                                        as={MdLocalCafe}
                                        color="brand.lightNavy"
                                        boxSize={{ base: 2.5, md: 3 }}
                                    />
                                    <Text
                                        as="span"
                                        color="brand.lightNavy"
                                        display={{ base: 'none', md: 'inline' }}
                                    >
                                        Away..
                                    </Text>
                                </Tag>
                            )}
                        {player.leaveAfterHand &&
                            (!isSelf || !player.in) &&
                            !isOffline && (
                                <Tag
                                    position="absolute"
                                    top={{ base: -2, md: -3 }}
                                    left={0}
                                    bg="brand.pink"
                                    color="brand.lightGray"
                                    variant="solid"
                                    size={{ base: 'xs', md: 'sm' }}
                                    fontSize={{ base: '8px', md: 'sm' }}
                                    px={{ base: 1, md: 2 }}
                                    py={{ base: 0.1, md: 0.2 }}
                                    zIndex={4}
                                    fontWeight="bold"
                                    borderRadius="6px"
                                    boxShadow="0 2px 8px rgba(235, 11, 92, 0.4)"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon
                                        as={MdLogout}
                                        boxSize={{ base: 2.5, md: 3 }}
                                    />
                                    <Text
                                        as="span"
                                        color="brand.lightGray"
                                        display={{ base: 'none', md: 'inline' }}
                                    >
                                        Leaving..
                                    </Text>
                                </Tag>
                            )}
                        {strengthLabel && (
                            <Tag
                                position="absolute"
                                top={{ base: -1, md: -3 }}
                                left={'50%'}
                                transform={'translateX(-50%)'}
                                bg="brand.green"
                                color="white"
                                variant="solid"
                                size={{ base: 'xs', md: 'sm' }}
                                fontSize={{ base: '8px', md: 'sm' }}
                                px={{ base: 1, md: 2 }}
                                py={{ base: 0, md: 0.5 }}
                                whiteSpace="nowrap"
                                pointerEvents="none"
                                zIndex={4}
                                fontWeight="bold"
                                borderRadius="6px"
                                boxShadow="0 2px 8px rgba(54, 163, 123, 0.3)"
                            >
                                {strengthLabel}
                            </Tag>
                        )}
                        <AnimatePresence>
                            {seatReaction && (
                                <motion.div
                                    key={seatReaction.id}
                                    initial={{ opacity: 0, scale: 0.7, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.85, y: -6 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: 'easeOut',
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '-1%',
                                        top: '-65%',
                                        zIndex: 6,
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <Flex
                                        alignItems="center"
                                        justifyContent="center"
                                        bg={
                                            isCurrentTurn || showWinnerHighlight
                                                ? 'blackAlpha.200'
                                                : 'whiteAlpha.300'
                                        }
                                        borderRadius="4px"
                                        padding={{ base: 0.5, md: 1 }}
                                        boxShadow="0 6px 16px rgba(0, 0, 0, 0.25)"
                                    >
                                        <Box
                                            as="img"
                                            src={seatReaction.emoteUrl}
                                            alt={seatReaction.emoteName}
                                            height={{
                                                base: '24px',
                                                md: '38px',
                                            }}
                                            minWidth={{
                                                base: '24px',
                                                md: '42px',
                                            }}
                                            maxWidth={{
                                                base: '50px',
                                                md: '100px',
                                            }}
                                            width="auto"
                                            display="block"
                                            borderRadius="4px"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </Flex>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Box width="100%" px={{ base: 1, md: 1 }}>
                            <HStack
                                spacing={2}
                                className="player-info-header"
                                width="100%"
                                justifyContent="space-between"
                                alignItems="center"
                                pb={{ base: 1 }}
                            >
                                <Flex
                                    alignItems="center"
                                    gap={{ base: 1 }}
                                    minWidth={0}
                                >
                                    <Tooltip
                                        label={shortEthAddress}
                                        hasArrow
                                        bg="brand.navy"
                                        color="white"
                                        borderRadius="md"
                                    >
                                        <Text
                                            className="player-username"
                                            variant={'seatText'}
                                            fontSize={{
                                                base: '10px',
                                                md: 'xs',
                                                lg: 'sm',
                                            }}
                                            fontWeight={'bold'}
                                            color={
                                                isCurrentTurn ||
                                                showWinnerHighlight
                                                    ? 'brand.darkNavy'
                                                    : 'white'
                                            }
                                            cursor="pointer"
                                            isTruncated
                                        >
                                            {player.username}
                                        </Text>
                                    </Tooltip>
                                    {canSendSeatReaction && isSelf ? (
                                        <EmotePicker
                                            onSelectEmote={
                                                handleSelectSeatEmote
                                            }
                                            columns={5}
                                            maxHeight="220px"
                                            width={{
                                                base: '230px',
                                                md: '260px',
                                            }}
                                            showSearch={false}
                                            popoverContentProps={{
                                                zIndex: 2000,
                                                borderWidth: 2,
                                                borderColor: 'input.lightGray',
                                                bg: 'card.white',
                                            }}
                                            popoverArrowProps={{
                                                border: 'none',
                                                boxShadow: 'lg',
                                                bg: 'card.white',
                                            }}
                                            popoverBodyProps={{
                                                bg: 'card.white',
                                            }}
                                            trigger={
                                                <IconButton
                                                    aria-label="Seat emotes"
                                                    icon={
                                                        <Icon
                                                            as={FiSmile}
                                                            boxSize={{
                                                                base: 3.5,
                                                                md: 5,
                                                            }}
                                                        />
                                                    }
                                                    size={{ base: 'xs' }}
                                                    variant="ghost"
                                                    color={emoteIconColor}
                                                    height={{
                                                        base: '14px',
                                                        md: '22px',
                                                    }}
                                                    width={{
                                                        base: '14px',
                                                        md: '22px',
                                                    }}
                                                    minW="unset"
                                                    borderRadius="full"
                                                    bg="transparent"
                                                    border="none"
                                                    boxShadow="none"
                                                    outline="none"
                                                    _hover={{
                                                        bg: emoteIconHoverBg,
                                                    }}
                                                    _active={{
                                                        bg: emoteIconActiveBg,
                                                    }}
                                                    _focus={{
                                                        boxShadow: 'none',
                                                    }}
                                                    _focusVisible={{
                                                        boxShadow: 'none',
                                                    }}
                                                />
                                            }
                                        />
                                    ) : (
                                        <Box
                                            aria-hidden
                                            width={{ base: '14px', md: '22px' }}
                                            height={{
                                                base: '14px',
                                                md: '22px',
                                            }}
                                            flexShrink={0}
                                        />
                                    )}
                                </Flex>
                                <Flex
                                    className="player-stack-container"
                                    alignItems="center"
                                    justifyContent="center"
                                    gap={{ base: 1, md: 2 }}
                                >
                                    <StackValue
                                        value={player.stack}
                                        color={stackColor}
                                        fontSize={{
                                            base: 'xs',
                                            md: 'sm',
                                            lg: 'md',
                                        }}
                                    />
                                </Flex>
                            </HStack>
                        </Box>

                        {/* Countdown timer – progress only, stretches edge to edge */}
                        {(() => {
                            const timerVisible =
                                isCurrentTurn && deadline > 0 && remaining > 0;

                            return (
                                <Box
                                    className="player-timer-container"
                                    width="100%"
                                    display="flex"
                                    flexDirection="row"
                                    alignItems="center"
                                    position="absolute"
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    visibility={
                                        timerVisible ? 'visible' : 'hidden'
                                    }
                                    overflow="hidden"
                                    pointerEvents="none"
                                >
                                    <Progress
                                        className="player-timer-bar"
                                        value={progress}
                                        height={{ base: 1.5, sm: 1.5, md: 2 }}
                                        width="100%"
                                        colorScheme={barScheme}
                                        borderRadius={0}
                                        sx={{
                                            '& > div': {
                                                bg: timerColor,
                                            },
                                        }}
                                    />
                                </Box>
                            );
                        })()}
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
