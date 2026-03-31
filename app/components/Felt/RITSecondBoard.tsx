'use client';

import React, { useContext, useMemo } from 'react';
import { Flex } from '@chakra-ui/react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import CardComponent from '../Card';

// GameStage constants matching the backend
const STAGE_PREFLOP = 2;
const STAGE_FLOP = 3;
const STAGE_TURN = 4;

const RITSecondBoard = () => {
    const { appState } = useContext(AppContext);
    const game = appState.game;
    const secondBoard = game?.ritSecondBoard;
    const stageAtStart = game?.ritStageAtStart ?? STAGE_PREFLOP;

    // Determine which card indices are "new" (dealt after the runout point).
    // Cards shared with board 1 are not shown — they're already visible above.
    const newCardStartIndex = useMemo(() => {
        switch (stageAtStart) {
            case STAGE_FLOP:
                return 3; // flop shared, show turn+river
            case STAGE_TURN:
                return 4; // flop+turn shared, show river only
            default:
                return 0; // preflop: all 5 cards are new
        }
    }, [stageAtStart]);

    const winningSet = useMemo(() => {
        const set = new Set<number>();
        const pots = game?.ritSecondPots ?? [];
        pots.forEach((pot) => {
            (pot.winners ?? []).forEach((w) => {
                (w.winningHand ?? []).forEach((c) => set.add(Number(c)));
            });
        });
        return set;
    }, [game?.ritSecondPots]);

    const hasWinningCombination = winningSet.size > 0;

    if (!secondBoard || secondBoard.length === 0) return null;

    const newCards = secondBoard.slice(newCardStartIndex);

    return (
        <Flex gap={1} justify="center" data-testid="rit-second-board-cards">
            {newCards.map((card, i) => (
                <CardComponent
                    key={newCardStartIndex + i}
                    card={card}
                    placeholder={false}
                    folded={false}
                    highlighted={winningSet.has(Number(card as unknown as number))}
                    dimmed={
                        hasWinningCombination &&
                        !winningSet.has(Number(card as unknown as number))
                    }
                />
            ))}
        </Flex>
    );
};

export default RITSecondBoard;
