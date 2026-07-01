'use client';

import React, { useCallback, useContext, useMemo } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useSound } from '@/app/contexts/SoundProvider';
import CardComponent from '../Card';
import type { Card, Pot } from '@/app/interfaces';

// Two boards share the single community-card slot. Instead of two full rows (which forces
// the cards tiny), board 2 is dealt IN FRONT of board 1, dropped down by ~half a card:
// it covers board 1's big centre pip but never the top-left index (rank + corner suit),
// so both boards stay readable while the pair occupies ~1.5 card-heights — cards stay big.
// board 2's top, as a fraction of a card's height. Exported so the status banner
// can anchor itself below the full dual board (board 2 bottom = 1 + BOARD2_DROP).
export const BOARD2_DROP = 0.52;

// Board 2 is also nudged to the RIGHT so its columns don't sit exactly under board 1's —
// the diagonal offset reads as a deck fanned forward, not one card clipped in half, and
// is more dynamic than a straight vertical stack. Kept small so board 2 still clears the
// slot's right edge.
const BOARD2_TRANSFORM = {
    base: 'translateX(6px)',
    md: 'translateX(10px)',
    lg: 'translateX(14px)',
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

type BoardLayerProps = {
    testId: string;
    cards: Card[];
    winningSet: Set<number>;
    preExistingIndices: Set<number>;
    onFlipStart: () => void;
};

// One five-card board. Cards flex to fill the width, so they match the single-board scale.
const BoardLayer = ({
    testId,
    cards,
    winningSet,
    preExistingIndices,
    onFlipStart,
}: BoardLayerProps) => (
    <Flex
        data-testid={testId}
        gap={{ base: 1, md: 1.5, lg: 2 }}
        width="100%"
        justify="center"
    >
        {[0, 1, 2, 3, 4].map((idx) => {
            const cardVal = cards?.[idx];
            const hasCard = Boolean(cardVal);
            return (
                <Box key={`${testId}-${idx}`} flex="1 1 0" minW={0} maxW="16%">
                    {hasCard ? (
                        <CardComponent
                            card={cardVal}
                            placeholder={false}
                            folded={false}
                            highlighted={winningSet.has(Number(cardVal))}
                            skipAnimation={preExistingIndices.has(idx)}
                            onFlipStart={
                                preExistingIndices.has(idx)
                                    ? undefined
                                    : onFlipStart
                            }
                        />
                    ) : (
                        <CardComponent
                            card="placeholder"
                            placeholder={true}
                            folded={false}
                        />
                    )}
                </Box>
            );
        })}
    </Flex>
);

const DualBoardCommunityCards = ({
    activePotIndex,
}: {
    activePotIndex: number | null;
}) => {
    const { appState } = useContext(AppContext);
    const { play } = useSound();
    const playCardFlip = useCallback(() => play('card_flip'), [play]);
    const game = appState.game;
    const board1 = useMemo(
        () => game?.ritBoard1Cards ?? [],
        [game?.ritBoard1Cards]
    );
    const board2 = useMemo(
        () => game?.ritBoard2Cards ?? [],
        [game?.ritBoard2Cards]
    );

    // Positions visible before the runout — shown without a flip animation.
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
        <Box
            data-testid="dual-board-community"
            width="100%"
            position="relative"
            // Board 1 sits exactly where the single community row sits (in flow); board 2
            // is absolute and cascades into the open felt below it, so the pot above and
            // the felt's central composition stay put.
        >
            {/* Board 1 — behind, in flow (defines the block height). */}
            <Box position="relative" zIndex={1}>
                <BoardLayer
                    testId="rit-board-1"
                    cards={board1}
                    winningSet={winningSetBoard1}
                    preExistingIndices={preExistingIndices}
                    onFlipStart={playCardFlip}
                />
            </Box>

            {/* Board 2 — in front, dropped down over board 1's centre and nudged right. A
                tight contact shadow at the seam plus a softer cast lifts it off board 1, so
                board 1 reads as tucked BEHIND rather than clipped in half. */}
            <Box
                position="absolute"
                left={0}
                right={0}
                top={`${BOARD2_DROP * 100}%`}
                transform={BOARD2_TRANSFORM}
                zIndex={2}
                sx={{
                    filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.6)) drop-shadow(0 -5px 12px rgba(0,0,0,0.4))',
                }}
            >
                <BoardLayer
                    testId="rit-board-2"
                    cards={board2}
                    winningSet={winningSetBoard2}
                    preExistingIndices={preExistingIndices}
                    onFlipStart={playCardFlip}
                />
            </Box>
        </Box>
    );
};

export default DualBoardCommunityCards;
