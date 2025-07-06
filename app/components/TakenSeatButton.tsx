import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    PositionProps,
    HStack,
    Progress,
    Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Card, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import CardComponent from './Card';

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
}: {
    player: Player;
    isCurrentTurn: boolean;
    isWinner: boolean;
}) => {
    const { appState } = useContext(AppContext);
    const address = player?.address;
    const shortEthAddress = address
        ? `${address.slice(0, 2)}...${address.slice(-2)}`
        : '0x00...00';

    const chipPositions: {
        [key: number]: {
            [key: string]: ResponsiveValue<
                PositionProps['top' | 'right' | 'left'] | 'row' | 'column'
            >;
        };
    } = {
        1: {
            top: { base: '-45%', md: '-25%', '2xl': '-28%' },
            justifyContent: { base: 'center' },
        },
        2: {
            top: { base: '0%', md: '-25%', '2xl': '-28%' },
            right: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        3: {
            bottom: { base: '0%', md: '40%', lg: '23%' },
            right: { base: '-110%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        4: {
            top: { base: '0%', md: '40%', lg: '30%' },
            right: { base: '-105%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row' },
        },
        5: {
            bottom: { base: '-70%', md: '-35%', '2xl': '-30%' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'center', md: 'start' },
            justifyContent: { base: 'center' },
        },
        6: {
            bottom: { base: '0%', md: '-35%', '2xl': '-30%' },
            right: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            justifyContent: { base: 'center' },
        },
        7: {
            bottom: { base: '0%', md: '-35%', '2xl': '-30%' },
            left: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'end', md: 'start' },
            justifyContent: { base: 'center' },
        },
        8: {
            top: { base: '0%', md: '40%', lg: '30%' },
            left: { base: '-110%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        9: {
            bottom: { base: '0%', md: '40%', lg: '23%' },
            left: { base: '-110%', md: '-110%', lg: '-110%' },
            flexDirection: { base: 'column', md: 'row-reverse' },
            alignItems: { base: 'end', md: 'start' },
        },
        10: {
            top: { base: '0%', md: '-25%', '2xl': '-28%' },
            left: { base: '-110%', md: '0', '2xl': '0' },
            flexDirection: { base: 'column', md: 'row' },
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
    }, [deadline, actionIndex, isCurrentTurn]);

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

    if (!appState.game) {
        return null;
    }

    return (
        <Flex
            className="taken-seat-button"
            width={{ base: 100, lg: 150, '2xl': 250 }}
            height={'100%'}
            position={'relative'}
            alignItems={'center'}
            justifyContent={'center'}
        >
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
                        return (
                            <Box
                                key={`${card}-${index}`}
                                className={`player-card seat-${player.seatID}-card-${index}`}
                                width="100%"
                                display="flex"
                            >
                                <CardComponent
                                    card={card}
                                    placeholder={false}
                                    folded={!player.in}
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
            >
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
                    <Text
                        className="player-stack"
                        variant={'seatText'}
                        color={
                            isCurrentTurn || isWinner ? 'gray.700' : 'gray.300'
                        }
                    >
                        {player.stack}
                    </Text>
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
