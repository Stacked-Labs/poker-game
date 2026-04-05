'use client';

import React, { useCallback, useContext, useMemo } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useSound } from '@/app/contexts/SoundProvider';
import CardComponent from '../Card';
import type { Card, Pot } from '@/app/interfaces';

type BoardRowProps = {
    label: string;
    cards: Card[];
    winningSet: Set<number>;
    // Positions (0–4) that were already known before the runout — skip flip animation.
    preExistingIndices: Set<number>;
    onFlipStart: () => void;
};

const BoardRow = ({
    label,
    cards,
    winningSet,
    preExistingIndices,
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
                    const cardVal = cards?.[idx];
                    const hasCard = Boolean(cardVal);

                    if (hasCard) {
                        const cardNum = Number(cardVal);
                        return (
                            <Box key={`${label}-card-${idx}`} width={{ base: '9.5vw', md: '44px' }} maxW="44px">
                                <CardComponent
                                    card={cardVal}
                                    placeholder={false}
                                    folded={false}
                                    highlighted={winningSet.has(cardNum)}
                                    skipAnimation={preExistingIndices.has(idx)}
                                    onFlipStart={preExistingIndices.has(idx) ? undefined : onFlipStart}
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
    const board1 = useMemo(() => game?.ritBoard1Cards ?? [], [game?.ritBoard1Cards]);
    const board2 = useMemo(() => game?.ritBoard2Cards ?? [], [game?.ritBoard2Cards]);

    // Positions that were visible before the runout — shown without flip animation.
    const preExistingIndices = useMemo(() => {
        const set = new Set<number>();
        (game?.ritPreExistingCards ?? []).forEach((card, i) => {
            if (Number(card) !== 0) set.add(i);
        });
        return set;
    }, [game?.ritPreExistingCards]);

    const winningSetBoard1 = useMemo(
        () => getWinningSetForPot(game?.ritBoard1Pots, activePotIndex),
        [activePotIndex, game?.ritBoard1Pots]
    );
    const winningSetBoard2 = useMemo(
        () => getWinningSetForPot(game?.ritBoard2Pots, activePotIndex),
        [activePotIndex, game?.ritBoard2Pots]
    );

    if (!game?.running) return null;
    if (!board1.some(Boolean) && !board2.some(Boolean)) return null;

    return (
        <VStack spacing={{ base: 1.5, md: 2 }} align="center">
            <BoardRow
                label="Board 1"
                cards={board1}
                winningSet={winningSetBoard1}
                preExistingIndices={preExistingIndices}
                onFlipStart={playCardFlip}
            />
            <BoardRow
                label="Board 2"
                cards={board2}
                winningSet={winningSetBoard2}
                preExistingIndices={preExistingIndices}
                onFlipStart={playCardFlip}
            />
        </VStack>
    );
};

export default DualBoardCommunityCards;
