'use client';

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useSound } from '@/app/contexts/SoundProvider';
import CardComponent from '../Card';
import type { Card, Pot } from '@/app/interfaces';

type BoardRowProps = {
    label: string;
    cards: Card[];
    revealed: boolean[];
    winningSet: Set<number>;
    showFaceDownBeforeReveal?: boolean;
    onFlipStart: () => void;
};

const BoardRow = ({
    label,
    cards,
    revealed,
    winningSet,
    showFaceDownBeforeReveal = false,
    onFlipStart,
}: BoardRowProps) => {
    return (
        <VStack spacing={1} width="100%">
            <Text
                color="whiteAlpha.900"
                fontSize={{ base: '10px', md: '11px' }}
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="0.05em"
            >
                {label}
            </Text>
            <Flex gap={{ base: 1, md: 1.5 }} justify="center">
                {[0, 1, 2, 3, 4].map((idx) => {
                    const hasCard = Boolean(cards?.[idx]);
                    const isShown = Boolean(revealed[idx]);
                    if (hasCard && isShown) {
                        const cardNum = Number(cards[idx]);
                        return (
                            <Box key={`${label}-card-${idx}`} width={{ base: '9.5vw', md: '44px' }} maxW="44px">
                                <CardComponent
                                    card={cards[idx]}
                                    placeholder={false}
                                    folded={false}
                                    highlighted={winningSet.has(cardNum)}
                                    onFlipStart={onFlipStart}
                                />
                            </Box>
                        );
                    }

                    if (hasCard && showFaceDownBeforeReveal) {
                        return (
                            <Box key={`${label}-card-back-${idx}`} width={{ base: '9.5vw', md: '44px' }} maxW="44px">
                                <CardComponent
                                    card="0"
                                    placeholder={false}
                                    folded={false}
                                />
                            </Box>
                        );
                    }

                    return (
                        <Box key={`${label}-placeholder-${idx}`} width={{ base: '9.5vw', md: '44px' }} maxW="44px">
                            <CardComponent
                                card="placeholder"
                                placeholder={true}
                                folded={false}
                            />
                        </Box>
                    );
                })}
            </Flex>
        </VStack>
    );
};

const getWinningSetForPot = (
    pots: Pot[] | undefined,
    activePotIndex: number | null
) => {
    const resolvedPot =
        typeof activePotIndex === 'number' &&
        activePotIndex >= 0 &&
        (pots?.[activePotIndex] ?? null)
            ? pots?.[activePotIndex]
            : pots?.find((pot) =>
                  pot.winners?.some((w) => (w.winningHand?.length ?? 0) > 0)
              );

    const set = new Set<number>();
    (resolvedPot?.winners ?? []).forEach((winner) => {
        (winner.winningHand ?? []).forEach((card) => {
            set.add(Number(card));
        });
    });
    return set;
};

const DualBoardCommunityCards = ({
    activePotIndex,
}: {
    activePotIndex: number | null;
}) => {
    const { appState } = useContext(AppContext);
    const { play } = useSound();
    const playCardFlip = useCallback(() => play('card_flip'), [play]);
    const game = appState.game;
    const isGameRunning = Boolean(game?.running);
    const board1 = useMemo(() => game?.ritBoard1Cards ?? [], [game?.ritBoard1Cards]);
    const board2 = useMemo(() => game?.ritBoard2Cards ?? [], [game?.ritBoard2Cards]);

    const [revealedBoard1, setRevealedBoard1] = useState<boolean[]>([
        false,
        false,
        false,
        false,
        false,
    ]);
    const [revealedBoard2, setRevealedBoard2] = useState<boolean[]>([
        false,
        false,
        false,
        false,
        false,
    ]);
    const board1TimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const board2TimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const board1ScheduledRef = useRef(false);
    const board2ScheduledRef = useRef(false);

    useEffect(() => {
        return () => {
            board1TimersRef.current.forEach(clearTimeout);
            board2TimersRef.current.forEach(clearTimeout);
        };
    }, []);

    useEffect(() => {
        const hasAnyBoard1 = [0, 1, 2, 3, 4].some((i) => Boolean(board1[i]));
        if (!hasAnyBoard1) {
            board1TimersRef.current.forEach(clearTimeout);
            board1TimersRef.current = [];
            board1ScheduledRef.current = false;
            setRevealedBoard1([false, false, false, false, false]);
            return;
        }

        if (
            Boolean(board1[0]) &&
            Boolean(board1[1]) &&
            Boolean(board1[2]) &&
            !board1ScheduledRef.current
        ) {
            board1ScheduledRef.current = true;
            board1TimersRef.current.push(
                setTimeout(() => {
                    setRevealedBoard1((prev) => [true, prev[1], prev[2], prev[3], prev[4]]);
                }, 0)
            );
            board1TimersRef.current.push(
                setTimeout(() => {
                    setRevealedBoard1((prev) => [true, true, prev[2], prev[3], prev[4]]);
                }, 300)
            );
            board1TimersRef.current.push(
                setTimeout(() => {
                    setRevealedBoard1((prev) => [true, true, true, prev[3], prev[4]]);
                }, 600)
            );
        }

        if (board1[3]) {
            setRevealedBoard1((prev) => [prev[0], prev[1], prev[2], true, prev[4]]);
        }
        if (board1[4]) {
            setRevealedBoard1((prev) => [prev[0], prev[1], prev[2], prev[3], true]);
        }
    }, [board1]);

    useEffect(() => {
        const hasAnyBoard2 = [0, 1, 2, 3, 4].some((i) => Boolean(board2[i]));
        if (!hasAnyBoard2) {
            board2TimersRef.current.forEach(clearTimeout);
            board2TimersRef.current = [];
            board2ScheduledRef.current = false;
            setRevealedBoard2([false, false, false, false, false]);
            return;
        }

        const board1FullyShown = revealedBoard1.every(Boolean);
        if (!board1FullyShown || board2ScheduledRef.current) {
            return;
        }

        board2ScheduledRef.current = true;

        board2TimersRef.current.push(
            setTimeout(() => {
                setRevealedBoard2((prev) => [Boolean(board2[0]), prev[1], prev[2], prev[3], prev[4]]);
            }, 0)
        );
        board2TimersRef.current.push(
            setTimeout(() => {
                setRevealedBoard2((prev) => [prev[0], Boolean(board2[1]), prev[2], prev[3], prev[4]]);
            }, 300)
        );
        board2TimersRef.current.push(
            setTimeout(() => {
                setRevealedBoard2((prev) => [prev[0], prev[1], Boolean(board2[2]), prev[3], prev[4]]);
            }, 600)
        );
        board2TimersRef.current.push(
            setTimeout(() => {
                setRevealedBoard2((prev) => [prev[0], prev[1], prev[2], Boolean(board2[3]), prev[4]]);
            }, 900)
        );
        board2TimersRef.current.push(
            setTimeout(() => {
                setRevealedBoard2((prev) => [prev[0], prev[1], prev[2], prev[3], Boolean(board2[4])]);
            }, 1200)
        );
    }, [board2, revealedBoard1]);

    const winningSetBoard1 = useMemo(
        () => getWinningSetForPot(game?.ritBoard1Pots, activePotIndex),
        [activePotIndex, game?.ritBoard1Pots]
    );
    const winningSetBoard2 = useMemo(
        () => getWinningSetForPot(game?.ritBoard2Pots, activePotIndex),
        [activePotIndex, game?.ritBoard2Pots]
    );

    if (!isGameRunning) {
        return null;
    }

    return (
        <VStack spacing={{ base: 1.5, md: 2 }} align="center">
            <BoardRow
                label="Board 1"
                cards={board1}
                revealed={revealedBoard1}
                winningSet={winningSetBoard1}
                onFlipStart={playCardFlip}
            />
            <BoardRow
                label="Board 2"
                cards={board2}
                revealed={revealedBoard2}
                winningSet={winningSetBoard2}
                showFaceDownBeforeReveal={true}
                onFlipStart={playCardFlip}
            />
        </VStack>
    );
};

export default DualBoardCommunityCards;
