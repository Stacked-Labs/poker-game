import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    HStack,
    Progress,
    Tooltip,
    Tag,
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
    const isSelf = appState.clientID
        ? player.uuid === appState.clientID
        : false;
    const prefersReducedMotion = useReducedMotion();

    // Chip positions based on orientation - portrait uses column layouts, landscape uses row layouts
    // Each seat has portrait and landscape positioning defined via CSS media queries
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
                flexDirection: 'column',
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
                flexDirection: 'column',
            },
            '@media (orientation: landscape)': {
                top: '30%',
                left: '-110%',
                flexDirection: 'row-reverse',
            },
        },
        9: {
            alignItems: 'end',
            '@media (orientation: portrait)': {
                top: '15%',
                left: '-110%',
                flexDirection: 'column',
            },
            '@media (orientation: landscape)': {
                bottom: '23%',
                left: '-110%',
                flexDirection: 'row-reverse',
            },
        },
        10: {
            justifyContent: 'center',
            alignItems: 'end',
            '@media (orientation: portrait)': {
                top: '15%',
                left: '-110%',
                flexDirection: 'column',
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
    const chipPositionSx =
        chipPositionStyles[player?.seatID || 4] || defaultPositionStyles;

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
                {/* Check bubble - shows when player has called with no bet (checked) */}
                {appState.game.running && player.called && player.bet === 0 && (
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
                {(() => {
                    // Determine if this is the current user's cards (needed for render condition)
                    const isSelfPlayer = appState.clientID
                        ? player.uuid === appState.clientID
                        : false;

                    // Determine if we are in showdown state
                    const isShowdown = Boolean(
                        appState.game &&
                            appState.game.stage === 1 &&
                            !appState.game.betting &&
                            (appState.game.pots?.length || 0) > 0
                    );

                    // Check if player has real (revealed) cards - not [0,0] or [-1,-1]
                    const hasRevealedCards =
                        Number(player.cards[0]) > 0 &&
                        Number(player.cards[1]) > 0;

                    // Only render cards if:
                    // - Player is still in hand, OR
                    // - It's the current user (so they can see their folded cards dimmed), OR
                    // - It's showdown AND player has revealed cards (backend sends real values for showdown participants)
                    const shouldRenderCards =
                        appState.game.running &&
                        Number(player.cards[0]) !== -1 &&
                        (player.in ||
                            isSelfPlayer ||
                            (isShowdown && hasRevealedCards));

                    if (!shouldRenderCards) return null;

                    return player.cards.map((card: Card, index: number) => {
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

                        // Skip flip animation for enemy players only when NOT in showdown
                        // During showdown, allow flip animation so opponent cards reveal smoothly
                        const skipAnimation = !isSelfPlayer && !isShowdown;

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
                    });
                })()}
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
    );
};

export default TakenSeatButton;
