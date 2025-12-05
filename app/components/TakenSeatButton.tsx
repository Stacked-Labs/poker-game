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
import {
    motion,
    animate,
    useAnimationControls,
    useReducedMotion,
} from 'framer-motion';
import { Card, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import CardComponent from './Card';
import { currentHandLabel } from '@/app/lib/poker/pokerHandEval';

const pulseBorderPink = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(235, 11, 92, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(235, 11, 92, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(235, 11, 92, 0);
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

const StackValue = ({
    value,
    color,
    fontSize,
}: {
    value: number;
    color: string;
    fontSize: ResponsiveValue<string>;
}) => {
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
};

const TakenSeatButton = ({
    player,
    isCurrentTurn,
    isWinner,
    isRevealed,
    winnings,
    activePotIndex,
}: {
    player: Player;
    isCurrentTurn: boolean;
    isWinner: boolean;
    isRevealed: boolean;
    winnings: number;
    activePotIndex: number | null;
}) => {
    const { appState } = useContext(AppContext);
    const address = player?.address;
    const shortEthAddress = address
        ? `${address.slice(0, 2)}...${address.slice(-2)}`
        : '0x00...00';
    const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
    const isSelf = appState.clientID
        ? player.uuid === appState.clientID
        : false;
    const prefersReducedMotion = useReducedMotion();

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
                md: isMobile ? '-45%' : '-16%',
                '2xl': '-18%',
            },
            justifyContent: { base: 'center' },
        },
        2: {
            top: { base: '-15%', md: isMobile ? '15%' : '-16%', '2xl': '-18%' },
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
            top: { base: '-15%', md: isMobile ? '15%' : '-16%', '2xl': '-18%' },
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

        calcAndSet();
        intervalRef.current = setInterval(calcAndSet, 250);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [deadline, actionIndex, isCurrentTurn, player.seatID]);

    const total = initialDuration || 1; // avoid divide by zero
    const progress = Math.min((remaining / total) * 100, 100);
    const barScheme: 'green' | 'yellow' | 'red' | 'gray' = isCurrentTurn
        ? remaining <= 5000
            ? 'red'
            : remaining <= 10000
              ? 'yellow'
              : 'green'
        : 'gray';

    const pots = appState.game?.pots ?? [];
    const resolvedPot =
        typeof activePotIndex === 'number' &&
        activePotIndex >= 0 &&
        activePotIndex < pots.length
            ? pots[activePotIndex]
            : pots.find((pot) => pot.winningHand && pot.winningHand.length > 0);
    const playerWinsActivePot = resolvedPot
        ? Boolean(resolvedPot.winningPlayerNums?.includes(player.position))
        : isWinner;
    const winningSet = new Set<number>();
    if (playerWinsActivePot && resolvedPot?.winningHand) {
        resolvedPot.winningHand.forEach((card) => {
            winningSet.add(Number(card));
        });
    }
    const showWinnerHighlight =
        activePotIndex === null ? isWinner : playerWinsActivePot;
    const highlightVariant = isCurrentTurn
        ? 'active'
        : showWinnerHighlight
          ? 'winner'
          : null;
    const highlightBorderColor =
        highlightVariant === 'active'
            ? 'brand.pink'
            : highlightVariant === 'winner'
              ? 'brand.yellow'
              : 'brand.darkNavy';
    const highlightShadow =
        highlightVariant === 'active'
            ? '0 6px 18px rgba(235, 11, 92, 0.35)'
            : highlightVariant === 'winner'
              ? '0 6px 18px rgba(253, 197, 29, 0.3)'
              : '0 2px 8px rgba(11, 20, 48, 0.3)';
    const highlightPulse =
        highlightVariant && !prefersReducedMotion
            ? `${
                  highlightVariant === 'active'
                      ? pulseBorderPink
                      : pulseBorderYellow
              } 2s ease-out infinite`
            : 'none';
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
                            fontWeight="bold"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            bg="brand.lightGray"
                            color="brand.navy"
                            width={{ base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 }}
                            height={{ base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 }}
                            variant={'seatText'}
                            zIndex={3}
                            boxShadow="0 2px 8px rgba(51, 68, 121, 0.3)"
                        >
                            D
                        </Text>
                    )}
                {player.bet !== 0 && (
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
                        fontSize={{ base: '10px', md: '16px' }}
                        zIndex={3}
                        boxShadow="0 2px 8px rgba(253, 197, 29, 0.3)"
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
                marginTop={{ base: 0, md: '12px' }}
            >
                {appState.game.running &&
                    Number(player.cards[0]) !== -1 &&
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
                            ? playerWinsActivePot
                                ? !isCardWinning
                                : true
                            : !player.in;

                        // Folded visual (for non-showdown states) still uses folded prop
                        const foldedVisual = !isShowdown && !player.in;

                        // Determine if this is the current user's cards
                        const isSelf = appState.clientID
                            ? player.uuid === appState.clientID
                            : false;

                        // Skip flip animation for enemy players - they should show front immediately
                        const skipAnimation = !isSelf;

                        // DEBUG: Log shouldDim logic for winners/losers at showdown
                        if (
                            isShowdown &&
                            (playerWinsActivePot || winningSet.size > 0)
                        ) {
                            console.log('🏆 WINNER DEBUG:', {
                                player: player.username,
                                isWinner,
                                playerWinsActivePot,
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
                                width={{ base: '48%' }} // narrower than 50% so the pair is centred, bigger on md screens
                                display="flex"
                                alignItems="flex-start"
                                justifyContent="flex-start"
                                p={0}
                                m={0}
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
                                    skipAnimation={skipAnimation}
                                />
                            </Box>
                        );
                    })}
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
                    paddingTop={{ base: 1 }}
                    paddingBottom={{ base: 2, md: 6 }}
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
                    {player.stack > 0 &&
                        !player.ready &&
                        (!isSelf || !player.in) && (
                            <Tag
                                position="absolute"
                                top={{ base: -2, md: -3 }}
                                right={0}
                                bg={
                                    player.readyNextHand
                                        ? 'brand.lightGray'
                                        : 'brand.yellow'
                                }
                                color={
                                    player.readyNextHand
                                        ? 'brand.darkNavy'
                                        : 'text.secondary'
                                }
                                variant="solid"
                                size={{ base: 'xs', md: 'sm' }}
                                fontSize={{ base: '8px', md: 'sm' }}
                                px={{ base: 1, md: 1 }}
                                py={{ base: 0.1, md: 0.2 }}
                                zIndex={3}
                                fontWeight="bold"
                                borderRadius="6px"
                            >
                                {player.readyNextHand
                                    ? 'Joining next hand'
                                    : 'Away'}
                            </Tag>
                        )}
                    {player.sitOutNextHand &&
                        player.ready &&
                        (!isSelf || !player.in) && (
                            <Tag
                                position="absolute"
                                top={{ base: -2, md: -3 }}
                                right={0}
                                bg="brand.lightGray"
                                color="brand.darkNavy"
                                variant="solid"
                                size={{ base: 'xs', md: 'sm' }}
                                fontSize={{ base: '8px', md: 'sm' }}
                                px={{ base: 1, md: 1 }}
                                py={{ base: 0.1, md: 0.2 }}
                                zIndex={3}
                                fontWeight="bold"
                                borderRadius="6px"
                            >
                                Sitting out..
                            </Tag>
                        )}
                    {player.leaveAfterHand && (!isSelf || !player.in) && (
                        <Tag
                            position="absolute"
                            top={{ base: -2, md: -3 }}
                            left={0}
                            bg="brand.pink"
                            color="white"
                            variant="solid"
                            size={{ base: 'xs', md: 'sm' }}
                            fontSize={{ base: '8px', md: 'sm' }}
                            px={{ base: 1, md: 2 }}
                            py={{ base: 0.1, md: 0.2 }}
                            zIndex={3}
                            fontWeight="bold"
                            borderRadius="6px"
                            boxShadow="0 2px 8px rgba(235, 11, 92, 0.4)"
                        >
                            Leaving soon
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
                    <Box width="100%" px={{ base: 1, md: 1 }}>
                        <HStack
                            spacing={2}
                            className="player-info-header"
                            width="100%"
                            justifyContent="space-between"
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
                                        isCurrentTurn || showWinnerHighlight
                                            ? 'brand.darkNavy'
                                            : 'white'
                                    }
                                    cursor="pointer"
                                >
                                    {player.username}
                                </Text>
                            </Tooltip>
                            <Flex
                                className="player-stack-container"
                                alignItems={'center'}
                                justifyContent={'center'}
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

                        // Brand color scheme mapping
                        const timerColorMap = {
                            red: 'brand.pink',
                            yellow: 'brand.yellow',
                            green: 'brand.green',
                            gray: 'gray.400',
                        };

                        const timerColor =
                            timerColorMap[barScheme] || 'brand.navy';

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
                                visibility={timerVisible ? 'visible' : 'hidden'}
                                overflow="hidden"
                                pointerEvents="none"
                            >
                                <Progress
                                    className="player-timer-bar"
                                    value={progress}
                                    height={{ base: 1.5, md: 2 }}
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
    );
};

export default TakenSeatButton;
