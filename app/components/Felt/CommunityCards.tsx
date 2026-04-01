'use client'

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useSound } from '@/app/contexts/SoundProvider';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import CardComponent from '../Card';

// GameStage constants (mirror backend game.go)
const STAGE_FLOP  = 3;
const STAGE_TURN  = 4;
const STAGE_RIVER = 5;

// RIT phases
const RIT_AWAITING_CONSENT = 1;
const RIT_BOARD1           = 2;

const CARD_REVEAL_INTERVAL = 400;

const CommunityCards = ({
    activePotIndex,
}: {
    activePotIndex: number | null;
}) => {
    const { appState } = useContext(AppContext);
    const { play } = useSound();
    const playCardFlip = useCallback(() => play('card_flip'), [play]);
    const communityCards = appState.game?.communityCards;
    const ritPhase       = appState.game?.ritPhase ?? 0;
    const ritStageAtStart = appState.game?.ritStageAtStart ?? STAGE_FLOP;

    const resolvedPot = useMemo(() => {
        // During RIT phase 3+ (both boards visible), use ritFirstPots for board-1 highlighting
        if (ritPhase >= 3 && appState.game?.ritFirstPots) {
            return appState.game.ritFirstPots.find(
                (pot) => pot.winners?.some((w) => (w.winningHand?.length ?? 0) > 0)
            );
        }
        if (
            typeof activePotIndex === 'number' &&
            activePotIndex >= 0 &&
            appState.game?.pots &&
            appState.game.pots[activePotIndex]
        ) {
            return appState.game.pots[activePotIndex];
        }
        return appState.game?.pots?.find(
            (pot) => pot.winners?.some((w) => (w.winningHand?.length ?? 0) > 0)
        );
    }, [activePotIndex, appState.game?.pots, appState.game?.ritFirstPots, ritPhase]);

    const winningSet = useMemo(() => {
        const set = new Set<number>();
        const winners = resolvedPot?.winners ?? [];
        winners.forEach((w) => {
            (w.winningHand ?? []).forEach((c) => set.add(Number(c)));
        });
        return set;
    }, [resolvedPot?.winners]);
    const hasWinningCombination = winningSet.size > 0;

    // Board-1 cards are highlighted only once board-2 is also shown (phase 3+)
    const isRITShowdown = ritPhase >= 3 && hasWinningCombination;

    const isGameRunning = appState.game?.running;

    const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false, false]);
    const timersRef            = useRef<ReturnType<typeof setTimeout>[]>([]);
    const flopScheduledRef     = useRef<boolean>(false);
    const ritBoard1ScheduledRef = useRef<boolean>(false);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    useEffect(() => {
        return () => clearTimers();
    }, []);

    // ── Normal (non-RIT) reveal logic ──────────────────────────────────────────
    useEffect(() => {
        // RIT paths are handled by the effect below — skip here when RIT is active
        if (ritPhase >= RIT_AWAITING_CONSENT) return;

        const isPresent = (idx: number) => Boolean(communityCards && communityCards[idx]);
        const nonePresent = [0, 1, 2, 3, 4].every((i) => !isPresent(i));

        if (nonePresent) {
            clearTimers();
            flopScheduledRef.current = false;
            setRevealed([false, false, false, false, false]);
            return;
        }

        if (isPresent(0) && isPresent(1) && isPresent(2) && !flopScheduledRef.current) {
            flopScheduledRef.current = true;
            timersRef.current.push(setTimeout(() => setRevealed((p) => [true, p[1], p[2], p[3], p[4]]), 0));
            timersRef.current.push(setTimeout(() => setRevealed((p) => [true, true, p[2], p[3], p[4]]), 300));
            timersRef.current.push(setTimeout(() => setRevealed((p) => [true, true, true, p[3], p[4]]), 600));
        }
        if (isPresent(3)) setRevealed((p) => [p[0], p[1], p[2], true, p[4]]);
        if (isPresent(4)) setRevealed((p) => [p[0], p[1], p[2], p[3], true]);
    }, [communityCards, ritPhase]);

    // ── RIT reveal logic ───────────────────────────────────────────────────────
    useEffect(() => {
        if (ritPhase < RIT_AWAITING_CONSENT) return;

        if (ritPhase === RIT_AWAITING_CONSENT) {
            // Keep any cards the server is already sending (e.g. the flop when all-in on the flop).
            // The backend censors future cards — we just reveal whatever is present.
            clearTimers();
            flopScheduledRef.current = false;
            ritBoard1ScheduledRef.current = false;
            const isPresent = (idx: number) => Boolean(communityCards && communityCards[idx]);
            setRevealed([isPresent(0), isPresent(1), isPresent(2), isPresent(3), isPresent(4)]);
            return;
        }

        if (ritPhase === RIT_BOARD1 && !ritBoard1ScheduledRef.current) {
            ritBoard1ScheduledRef.current = true;
            clearTimers();

            // ritStageAtStart is the stage AFTER ProcessEndOfActionUpdate auto-dealt a street,
            // so the cards publicly visible BEFORE the all-in are one street less:
            //   STAGE_FLOP  (3) → all-in was preflop → 0 pre-existing cards
            //   STAGE_TURN  (4) → all-in was on flop → 3 pre-existing (the flop)
            //   STAGE_RIVER (5) → all-in was on turn → 4 pre-existing (flop+turn)
            const preExistingCount =
                ritStageAtStart === STAGE_TURN  ? 3 :
                ritStageAtStart === STAGE_RIVER ? 4 : 0;

            // Reveal pre-existing cards instantly
            setRevealed((prev) => {
                const next = [...prev];
                for (let i = 0; i < preExistingCount; i++) next[i] = true;
                return next;
            });

            // Stagger-reveal the new runout cards
            let order = 0;
            for (let i = preExistingCount; i < 5; i++) {
                const delay = order * CARD_REVEAL_INTERVAL;
                const idx = i;
                timersRef.current.push(
                    setTimeout(() => {
                        play('card_flip');
                        setRevealed((prev) => {
                            const next = [...prev];
                            next[idx] = true;
                            return next;
                        });
                    }, delay)
                );
                order++;
            }
        }
    }, [ritPhase, ritStageAtStart, play]);

    // During RIT concluded phase, keep showing board-1 cards even if running transitions
    const isRITConcluded = ritPhase === 4;
    if (!isGameRunning && !isRITConcluded) return null;
    if (!communityCards) return null;

    return (
        <>
            {[0, 1, 2, 3, 4].map((num) =>
                communityCards[num] && revealed[num] ? (
                    <CardComponent
                        key={num}
                        card={communityCards[num]}
                        placeholder={false}
                        folded={false}
                        onFlipStart={playCardFlip}
                        highlighted={winningSet.has(Number(communityCards[num] as unknown as number))}
                        dimmed={
                            hasWinningCombination &&
                            (
                                Boolean(
                                    appState.game &&
                                        appState.game.stage === 1 &&
                                        !appState.game.betting &&
                                        (appState.game.pots?.length || 0) > 0
                                ) ||
                                isRITShowdown
                            ) &&
                            !winningSet.has(Number(communityCards[num] as unknown as number))
                        }
                    />
                ) : (
                    <CardComponent
                        key={num}
                        card="placeholder"
                        placeholder={true}
                        folded={false}
                    />
                )
            )}
        </>
    );
};

export default CommunityCards;
