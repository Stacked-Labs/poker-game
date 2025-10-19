import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    PositionProps,
    HStack,
    Progress,
    Tooltip,
    Tag,
    useBreakpointValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Card, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import CardComponent from './Card';
import { currentHandLabel } from '@/app/lib/poker/pokerHandEval';

const pulseWhiteGlow = keyframes`
  0% { box-shadow: 0 0 6px 5px rgba(255, 255, 255, 0.6); }
  50% { box-shadow: 0 0 9px 6px rgba(255, 255, 255, 0.6); }
  100% { box-shadow: 0 0 6px 5px rgba(255, 255, 255, 0.6); }
`;

const pulseGoldGlow = keyframes`
  0% { box-shadow: 0 0 6px 5px rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 9px 6px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 6px 5px rgba(255, 215, 0, 0.6); }
`;

const TakenSeatButton = ({
    player,
    isCurrentTurn,
    isWinner,
    isRevealed,
    winnings,
}: {
    player: Player;
    isCurrentTurn: boolean;
    isWinner: boolean;
    isRevealed: boolean;
    winnings: number;
}) => {
    const { appState } = useContext(AppContext);
    const address = player?.address;
    const shortEthAddress = address
        ? `${address.slice(0, 2)}...${address.slice(-2)}`
        : '0x00...00';
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;

    const chipPositions: {
        [key: number]: {
            [key: string]: ResponsiveValue<
                PositionProps['top' | 'right' | 'left'] | 'row' | 'column'
            >;
        };
    } = {
        1: {
            top: {
                base: '-46%',
                md: isMobile ? '-45%' : '-10%',
                '2xl': '-18%',
            },
            justifyContent: { base: 'center' },
        },
        2: {
            top: { base: '-15%', md: isMobile ? '15%' : '-10%', '2xl': '-18%' },
            right: { base: '-105%', md: isMobile ? '-70%' : 0, '2xl': 0 },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        3: {
            bottom: { base: '18%', md: '40%', lg: '23%' },
            right: { base: '-105%', md: '-105%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        4: {
            top: { base: '15%', md: '40%', lg: '30%' },
            right: { base: '-107%', md: '-105%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        5: {
            bottom: {
                base: '10%',
                md: isMobile ? '20%' : '-30%',
                '2xl': '-30%',
            },
            right: { base: '-107%', md: isMobile ? '-70%' : 0, '2xl': 0 },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'left', md: 'start' },
            justifyContent: { base: 'center' },
        },
        6: {
            bottom: {
                base: '-50%',
                md: isMobile ? '-45%' : '-30%',
                '2xl': '-30%',
            },
            right: { base: 0, md: 0, '2xl': 0 },
            flexDirection: { base: 'row', md: 'row' },
            justifyContent: { base: 'center' },
        },
        7: {
            bottom: {
                base: '10%',
                md: isMobile ? '20%' : '-30%',
                '2xl': '-30%',
            },
            left: { base: '-105%', md: isMobile ? '-70%' : 0, '2xl': 0 },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
        8: {
            top: { base: '15%', md: '40%', lg: '30%' },
            left: { base: '-105%', md: '-105%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        9: {
            bottom: { base: '18%', md: '40%', lg: '23%' },
            left: { base: '-105%', md: isMobile ? '-105%' : 0, lg: '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        10: {
            top: { base: '-15%', md: isMobile ? '15%' : '-10%', '2xl': '-18%' },
            left: { base: '-105%', md: isMobile ? '-68%' : '0%', '2xl': '0%' },
            flexDirection: {
                base: 'column',
                md: isMobile ? 'row-reverse' : 'row',
            },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
    };

    const defaultPosition = { top: '100%', flexDirection: 'row' };
    const chipPosition = chipPositions[player?.seatID || 4] || defaultPosition;

    const glowAnimation = isCurrentTurn
        ? `${pulseWhiteGlow} 2s ease-in-out 0.2s infinite`
        : isWinner
          ? `${pulseGoldGlow} 2s ease-in-out 0.5s infinite`
          : 'none';

    // Countdown timer logic
    const deadline = appState.game?.actionDeadline ?? 0;
    const [remaining, setRemaining] = useState<number>(0);
    const [initialDuration, setInitialDuration] = useState<number>(0); // ms
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const actionIndex = appState.game?.action;

    useEffect(() => {
        // Stop any timer if this seat is not the current turn
        if (!isCurrentTurn) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setRemaining(0);
            return;
        }

        // For the active player, (re)start the timer whenever deadline changes
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!deadline || deadline === 0) {
            setRemaining(0);
            return;
        }

        const calcAndSet = () => {
            const diff = Math.max(deadline - Date.now(), 0);
            setRemaining(diff);
        };

        const initial = Math.max(deadline - Date.now(), 0);
        setInitialDuration(initial);

        // Debug log
        console.log(
            `⏱️ Seat ${player.seatID} timer start: now=${Date.now()} deadline=${deadline} (duration=${initial}ms, seconds=${Math.ceil(initial / 1000)})`
        );

        calcAndSet();
        intervalRef.current = setInterval(calcAndSet, 250);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Debug log for cleanup
            console.log(`⏹️ Seat ${player.seatID} timer cleared`);
        };
    }, [deadline, actionIndex, isCurrentTurn, player.seatID]);

    const total = initialDuration || 1; // avoid divide by zero
    const progress = Math.min((remaining / total) * 100, 100);
    const seconds = Math.ceil(remaining / 1000);
    const secondsText = seconds.toString().padStart(2, '0');
    const barScheme: 'green' | 'yellow' | 'red' | 'gray' = isCurrentTurn
        ? remaining <= 5000
            ? 'red'
            : remaining <= 10000
              ? 'yellow'
              : 'green'
        : 'gray';

    // Only show winning hand effects when this player is actually a winner
    // Use the isWinner prop from Table component instead of trying to read stale pot data
    const winningSet = new Set<number>();

    if (isWinner) {
        // Build a set of winning cards from the first pot with a winning hand
        const potWithWinningHand = appState.game?.pots?.find(
            (pot) => pot.winningHand && pot.winningHand.length > 0
        );
        if (potWithWinningHand?.winningHand) {
            potWithWinningHand.winningHand.forEach((card) => {
                winningSet.add(Number(card));
            });
        }
    }

    // Compute hand strength label per display rules
    const strengthLabel: string | null = useMemo(() => {
        const game = appState.game;
        if (!game) return null;
        const board = (game.communityCards || [])
            .map((c) => Number(c))
            .filter(Boolean);
        const hole = (player.cards || []).map((c) => Number(c)).filter(Boolean);

        // Visibility rules:
        // - Self or any player: only show once board has at least the flop (3 cards)
        // - Others: additionally require both hole cards to be non-zero (visible)
        const boardHasFlop = board.length >= 3;
        if (!boardHasFlop) return null;

        const bothHoleVisible =
            hole.length >= 2 && hole[0] !== 0 && hole[1] !== 0;

        // Determine if this seat is "self" by matching uuid against clientID when available
        const isSelf = appState.clientID
            ? player.uuid === appState.clientID
            : false;

        if (!isSelf && !bothHoleVisible) return null;

        const label = currentHandLabel(hole as number[], board as number[]);
        return label ?? null;
    }, [appState.clientID, appState.game, player.cards, player.uuid]);

    if (!appState.game) {
        return null;
    }

    return (
        <Flex
            className="taken-seat-button"
            width={'100%'}
            height={'100%'}
            position={'relative'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            {/* Away badge moved into player info container below */}
            <Flex
                position={'absolute'}
                key="betbox"
                {...chipPosition}
                width={'100%'}
                gap={2}
            >
                {appState.game.running &&
                    appState.game.dealer == player.position && (
                        <Text
                            fontWeight="semibold"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            bg="white"
                            color="black"
                            width={{ base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 }}
                            height={{ base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 }}
                            variant={'seatText'}
                            zIndex={3}
                        >
                            D
                        </Text>
                    )}
                {player.bet !== 0 && (
                    <Text
                        borderRadius="1.5rem"
                        px={4}
                        py={1}
                        w={'fit-content'}
                        bg="amber.300"
                        fontWeight="semibold"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor={'gray'}
                        variant={'seatText'}
                        zIndex={3}
                    >
                        {player.bet}
                    </Text>
                )}
            </Flex>
            <Flex
                className="player-cards-container"
                position={'absolute'}
                justifyContent={'center'}
                width={'100%'}
                height={'100%'}
                gap={0}
                left="50%"
                transform="translateX(-50%)"
            >
                {appState.game.running &&
                    player.cards.map((card: Card, index: number) => {
                        // Determine if we are in showdown state
                        const isShowdown = Boolean(
                            appState.game &&
                                appState.game.stage === 1 &&
                                !appState.game.betting &&
                                (appState.game.pots?.length || 0) > 0
                        );

                        const isCardWinning = winningSet.has(Number(card));

                        // Dimming rules:
                        // - During showdown: winners dim ONLY non-winning cards; losers dim all cards
                        // - Otherwise: dim players who folded / are not in hand
                        const dimThisCard = isShowdown
                            ? isWinner
                                ? !isCardWinning
                                : true
                            : !player.in;

                        // Folded visual (for non-showdown states) still uses folded prop
                        const foldedVisual = !isShowdown && !player.in;

                        // DEBUG: Log shouldDim logic for winners/losers at showdown
                        if (isShowdown && (isWinner || winningSet.size > 0)) {
                            console.log('🏆 WINNER DEBUG:', {
                                player: player.username,
                                isWinner,
                                isRevealed,
                                playerIn: player.in,
                                shouldDim: dimThisCard,
                                hasWinningCards: winningSet.size > 0,
                            });
                        }
                        return (
                            <Box
                                key={`${card}-${index}`}
                                className={`player-card seat-${player.seatID}-card-${index}`}
                                width="40%" // narrower than 50% so the pair is centred
                                display="flex"
                                ml={
                                    index === 1
                                        ? { base: '0%', md: '-2%', lg: '0%' }
                                        : '0'
                                }
                                mr={
                                    index === 0
                                        ? { base: '0%', md: '-2%', lg: '0%' }
                                        : '0'
                                }
                            >
                                <CardComponent
                                    card={card}
                                    placeholder={false}
                                    folded={foldedVisual}
                                    highlighted={isCardWinning}
                                    dimmed={dimThisCard}
                                />
                            </Box>
                        );
                    })}
            </Flex>
            <Flex
                className="player-info-container"
                direction={'column'}
                bg={isCurrentTurn || isWinner ? 'white' : 'gray.50'}
                borderRadius={{ base: 4, md: 8, lg: 12, xl: 12, '2xl': 12 }}
                width={'110%'}
                paddingX={4}
                paddingY={1}
                zIndex={2}
                justifySelf={'flex-end'}
                justifyContent={'center'}
                alignItems={'center'}
                alignSelf={'flex-end'}
                animation={glowAnimation}
                transition={'all 0.5s ease-in-out'}
                position={'relative'}
            >
                {/* Away badge rendered above the container without affecting layout */}
                {player.stack > 0 && !player.ready && (
                    <Tag
                        position="absolute"
                        top={-3}
                        right={1}
                        colorScheme="yellow"
                        variant="subtle"
                        size={{ base: 'xs', md: 'sm' }}
                        fontSize={{ base: '8px', md: 'sm' }}
                        px={{ base: 1, md: 2 }}
                        py={{ base: 0.5, md: 0 }}
                        zIndex={3}
                    >
                        Away
                    </Tag>
                )}
                {strengthLabel && (
                    <Tag
                        position="absolute"
                        top={{ base: -2, md: -3 }}
                        left={'50%'}
                        transform={'translateX(-50%)'}
                        colorScheme={'teal'}
                        variant="solid"
                        size={{ base: 'xs', md: 'sm' }}
                        fontSize={{ base: '8px', md: 'sm' }}
                        px={{ base: 1, md: 2 }}
                        py={{ base: 0, md: 0.5 }}
                        whiteSpace="nowrap"
                        pointerEvents="none"
                        zIndex={4}
                    >
                        {strengthLabel}
                    </Tag>
                )}
                <HStack spacing={2} className="player-info-header">
                    <Tooltip label={shortEthAddress} hasArrow>
                        <Text
                            className="player-username"
                            variant={'seatText'}
                            fontWeight={'bold'}
                            color={
                                isCurrentTurn || isWinner
                                    ? 'gray.700'
                                    : 'gray.300'
                            }
                            cursor="pointer"
                        >
                            {player.username}
                        </Text>
                    </Tooltip>
                    <Box
                        position={'relative'}
                        display={'inline-flex'}
                        alignItems={'center'}
                    >
                        <Text
                            className="player-stack"
                            variant={'seatText'}
                            color={
                                isCurrentTurn || isWinner
                                    ? 'gray.700'
                                    : 'gray.300'
                            }
                        >
                            {player.stack}
                        </Text>
                        {/* Winnings overlay – positioned next to the stack on the same line */}
                        <Text
                            className="player-winnings-overlay"
                            variant={'seatText'}
                            color={'green.600'}
                            fontWeight={'bold'}
                            position={'absolute'}
                            left={'110%'}
                            pointerEvents={'none'}
                            zIndex={2}
                            opacity={isWinner && winnings > 0 ? 1 : 0}
                        >
                            {`+${Math.round(winnings)}`}
                        </Text>
                    </Box>
                </HStack>

                {/* Countdown timer – keep box rendered for consistent height */}
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
                            alignSelf="stretch"
                            visibility={timerVisible ? 'visible' : 'hidden'}
                        >
                            {/* Numeric time – hidden on small screens */}
                            <Text
                                className="player-timer-count"
                                fontSize={{ base: 'xs', md: 'sm' }}
                                textAlign="center"
                                color={`${barScheme}.700`}
                                display={{ base: 'none', md: 'block' }}
                                mr={2}
                            >
                                {`00:${secondsText}`}
                            </Text>
                            {/* Progress bar */}
                            <Progress
                                className="player-timer-bar"
                                value={progress}
                                height={{ base: 1, md: 2 }}
                                width="100%"
                                colorScheme={barScheme}
                                borderRadius="md"
                            />
                        </Box>
                    );
                })()}
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
