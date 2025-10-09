import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Box } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import CardComponent from '../Card';

const CommunityCards = () => {
    const { appState } = useContext(AppContext);
    const communityCards = appState.game?.communityCards;
    const potWithWinningHand = appState.game?.pots?.find(
        (pot) => pot.winningHand && pot.winningHand.length > 0
    );
    const winningHand = potWithWinningHand?.winningHand ?? [];
    const winningSet = new Set<number>(
        winningHand.map((c: number | string) => Number(c))
    );

    const isGameRunning = appState.game?.running;

    const cards = [0, 1, 2, 3, 4];

    // Local reveal state to stagger community cards on the flop
    const [revealed, setRevealed] = useState<boolean[]>([
        false,
        false,
        false,
        false,
        false,
    ]);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const flopScheduledRef = useRef<boolean>(false);

    useEffect(() => {
        // Cleanup any queued timers on unmount or when new hand resets
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, []);

    useEffect(() => {
        const isPresent = (idx: number) =>
            Boolean(communityCards && communityCards[idx]);

        const nonePresent = [0, 1, 2, 3, 4].every((i) => !isPresent(i));

        // If a new hand starts (no community cards), reset reveal state and flags
        if (nonePresent) {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
            flopScheduledRef.current = false;
            setRevealed([false, false, false, false, false]);
            return;
        }

        // Flop: reveal indices 0,1,2 sequentially if all three are present
        if (
            isPresent(0) &&
            isPresent(1) &&
            isPresent(2) &&
            !flopScheduledRef.current
        ) {
            flopScheduledRef.current = true;

            // Reveal first immediately, second after 300ms, third after 600ms
            timersRef.current.push(
                setTimeout(() => {
                    setRevealed((prev) => [
                        true,
                        prev[1],
                        prev[2],
                        prev[3],
                        prev[4],
                    ]);
                }, 0)
            );
            timersRef.current.push(
                setTimeout(() => {
                    setRevealed((prev) => [
                        true,
                        true,
                        prev[2],
                        prev[3],
                        prev[4],
                    ]);
                }, 300)
            );
            timersRef.current.push(
                setTimeout(() => {
                    setRevealed((prev) => [true, true, true, prev[3], prev[4]]);
                }, 600)
            );
        }

        // Turn and River: reveal immediately when present
        if (isPresent(3)) {
            setRevealed((prev) => [prev[0], prev[1], prev[2], true, prev[4]]);
        }
        if (isPresent(4)) {
            setRevealed((prev) => [prev[0], prev[1], prev[2], prev[3], true]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [communityCards]);

    if (!isGameRunning) {
        return null;
    }

    if (communityCards && isGameRunning) {
        return (
            <>
                {cards.map((num, i) => (
                    <Box
                        key={i}
                        flex="1 1 20%"
                        maxW={{ base: '15%', md: '20%', lg: '18%' }}
                        display="flex"
                        height="100%"
                    >
                        {appState.game?.communityCards[num] && revealed[num] ? (
                            <CardComponent
                                card={appState.game.communityCards[num]}
                                placeholder={false}
                                // During showdown, dim community cards that are not part of winning hand
                                folded={false}
                                highlighted={winningSet.has(
                                    Number(
                                        appState.game.communityCards[
                                            num
                                        ] as unknown as number
                                    )
                                )}
                                dimmed={
                                    // Showdown is when game is at stage 1, not betting, and we have pots
                                    Boolean(
                                        appState.game &&
                                            appState.game.stage === 1 &&
                                            !appState.game.betting &&
                                            (appState.game.pots?.length || 0) >
                                                0
                                    ) &&
                                    !winningSet.has(
                                        Number(
                                            appState.game.communityCards[
                                                num
                                            ] as unknown as number
                                        )
                                    )
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
                ))}
            </>
        );
    }

    return null;
};

export default CommunityCards;
