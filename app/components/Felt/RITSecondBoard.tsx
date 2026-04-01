'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import CardComponent from '../Card';
import { useSound } from '@/app/contexts/SoundProvider';

// GameStage constants (mirror backend game.go)
const STAGE_TURN  = 4;
const STAGE_RIVER = 5;

const CARD_REVEAL_INTERVAL = 400;

const RITSecondBoard = () => {
    const { appState } = useContext(AppContext);
    const { play } = useSound();
    const game         = appState.game;
    const secondBoard  = game?.ritSecondBoard;
    const stageAtStart = game?.ritStageAtStart ?? 3; // default STAGE_FLOP = preflop all-in

    // Card slots shared with board-1 → invisible spacers (same cards, not repeated).
    // stageAtStart is the stage AFTER the all-in street was auto-dealt:
    //   STAGE_FLOP  (3) → preflop all-in → 0 shared, all 5 are new
    //   STAGE_TURN  (4) → flop all-in    → 3 shared (same flop), new: turn+river
    //   STAGE_RIVER (5) → turn all-in    → 4 shared (flop+turn), new: river only
    const newCardStartIndex = useMemo(() => {
        switch (stageAtStart) {
            case STAGE_TURN:  return 3;
            case STAGE_RIVER: return 4;
            default:          return 0;
        }
    }, [stageAtStart]);

    const winningSet = useMemo(() => {
        const set = new Set<number>();
        (game?.ritSecondPots ?? []).forEach((pot) => {
            (pot.winners ?? []).forEach((w) => {
                (w.winningHand ?? []).forEach((c) => set.add(Number(c)));
            });
        });
        return set;
    }, [game?.ritSecondPots]);

    const hasWinningCombination = winningSet.size > 0;

    const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false, false]);
    const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
    const scheduledRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, []);

    useEffect(() => {
        if (!secondBoard || secondBoard.length === 0) {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
            scheduledRef.current = null;
            setRevealed([false, false, false, false, false]);
            return;
        }

        const boardKey = secondBoard.map(String).join(',');
        if (scheduledRef.current === boardKey) return;
        scheduledRef.current = boardKey;

        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setRevealed([false, false, false, false, false]);

        const newIndices: number[] = [];
        for (let i = newCardStartIndex; i < 5; i++) {
            if (secondBoard[i]) newIndices.push(i);
        }
        newIndices.forEach((cardIdx, order) => {
            timersRef.current.push(
                setTimeout(() => {
                    play('card_flip');
                    setRevealed((prev) => {
                        const next = [...prev];
                        next[cardIdx] = true;
                        return next;
                    });
                }, order * CARD_REVEAL_INTERVAL)
            );
        });
    }, [secondBoard, newCardStartIndex, play]);

    // Always render — face-down backs show from phase 3 before secondBoard data arrives.
    return (
        <>
            {[0, 1, 2, 3, 4].map((idx) => {
                if (idx < newCardStartIndex) {
                    return (
                        <Box
                            key={idx}
                            width="100%"
                            sx={{ aspectRatio: '3 / 4' }}
                            visibility="hidden"
                        />
                    );
                }

                const card = secondBoard?.[idx];

                if (!revealed[idx] || !card) {
                    return (
                        <CardComponent
                            key={idx}
                            card="0"
                            placeholder={false}
                            folded={false}
                            skipAnimation
                        />
                    );
                }

                return (
                    <CardComponent
                        key={idx}
                        card={card}
                        placeholder={false}
                        folded={false}
                        highlighted={winningSet.has(Number(card as unknown as number))}
                        dimmed={
                            hasWinningCombination &&
                            !winningSet.has(Number(card as unknown as number))
                        }
                    />
                );
            })}
        </>
    );
};

export default RITSecondBoard;
