'use client'

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useSound } from '@/app/contexts/SoundProvider';
import { Box } from '@chakra-ui/react';
import { useReducedMotion } from 'framer-motion';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LuRabbit } from 'react-icons/lu';
import CardComponent from '../Card';
import type { Card } from '@/app/interfaces';

const RABBIT_SLOT_OPACITY = 0.85;

// Folded-corner overlay — dark triangle in the top-right with a translucent
// rabbit icon. Rendered absolutely on top of the card back; no layout impact.
const FOLD_PCT = 38;
const RabbitFoldedCorner: React.FC<{ visible: boolean; reducedMotion: boolean }> = ({
    visible,
    reducedMotion,
}) => (
    <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        userSelect="none"
        borderRadius="10%"
        overflow="hidden"
        opacity={visible ? 1 : 0}
        transition={reducedMotion ? undefined : 'opacity 0.2s ease'}
    >
        <Box
            position="absolute"
            top={0}
            right={0}
            w={`${FOLD_PCT}%`}
            sx={{
                aspectRatio: '1 / 1',
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                background: 'rgba(0, 0, 0, 0.55)',
            }}
        />
        <Box
            position="absolute"
            top={0}
            right={0}
            w={`${FOLD_PCT}%`}
            sx={{
                aspectRatio: '1 / 1',
                background:
                    'linear-gradient(to bottom left, transparent 47%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.55) 52%, transparent 53%)',
            }}
        />
        <Box
            position="absolute"
            top={`${FOLD_PCT * 0.1}%`}
            right={`${FOLD_PCT * 0.1}%`}
            w={`${FOLD_PCT * 0.4}%`}
            sx={{ aspectRatio: '1 / 1' }}
            color="rgba(255, 255, 255, 0.4)"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <LuRabbit size="100%" />
        </Box>
    </Box>
);

// Lightweight rabbit icon shown on the revealed front face. Same position as
// the folded-corner overlay's icon, but without the dark triangle so it
// doesn't visually fight the card flip.
const RabbitFrontMarker: React.FC<{ visible: boolean; reducedMotion: boolean }> = ({
    visible,
    reducedMotion,
}) => (
    <Box
        position="absolute"
        top={`${FOLD_PCT * 0.1}%`}
        right={`${FOLD_PCT * 0.1}%`}
        w={`${FOLD_PCT * 0.4}%`}
        pointerEvents="none"
        userSelect="none"
        sx={{ aspectRatio: '1 / 1' }}
        color="rgba(0, 0, 0, 0.55)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        opacity={visible ? 1 : 0}
        transition={reducedMotion ? undefined : 'opacity 0.2s ease'}
    >
        <LuRabbit size="100%" />
    </Box>
);

const CommunityCards = ({
    activePotIndex,
}: {
    activePotIndex: number | null;
}) => {
    const { appState } = useContext(AppContext);
    const { play } = useSound();
    const playCardFlip = useCallback(() => play('card_flip'), [play]);
    const communityCards = appState.game?.communityCards;
    const rabbitCards = appState.game?.rabbitCards;
    const prefersReducedMotion = useReducedMotion();

    const resolvedPot = useMemo(() => {
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
    }, [activePotIndex, appState.game?.pots]);

    const winningSet = useMemo(() => {
        const set = new Set<number>();
        const winners = resolvedPot?.winners ?? [];
        winners.forEach((w) => {
            (w.winningHand ?? []).forEach((c) => set.add(Number(c)));
        });
        return set;
    }, [resolvedPot?.winners]);

    const hasWinningCombination = winningSet.size > 0;
    const isGameRunning = appState.game?.running;

    const dealtCount = useMemo(
        () => (communityCards ?? []).filter(Boolean).length,
        [communityCards]
    );

    const hasRabbitCards = (rabbitCards?.length ?? 0) > 0;

    const [rabbitRevealed, setRabbitRevealed] = useState(false);
    const [hoveredRabbitIdx, setHoveredRabbitIdx] = useState<number | null>(null);
    // Delay the persistent rabbit marker on the front face until the flip
    // animation completes (~600 ms: 300 ms pre-flip + 300 ms transform), so the
    // overlay doesn't sit static while the card is rotating.
    const [showRevealedMarker, setShowRevealedMarker] = useState(false);
    const markerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const prevRabbitRef = useRef<typeof rabbitCards>(undefined);
    useEffect(() => {
        if (prevRabbitRef.current !== rabbitCards) {
            prevRabbitRef.current = rabbitCards;
            if (!rabbitCards?.length) {
                setRabbitRevealed(false);
                setHoveredRabbitIdx(null);
                setShowRevealedMarker(false);
                if (markerTimerRef.current) {
                    clearTimeout(markerTimerRef.current);
                    markerTimerRef.current = null;
                }
            }
        }
    }, [rabbitCards]);

    useEffect(() => {
        return () => {
            if (markerTimerRef.current) clearTimeout(markerTimerRef.current);
        };
    }, []);

    const revealRabbit = useCallback(() => {
        playCardFlip();
        setRabbitRevealed(true);
        setHoveredRabbitIdx(null);
        if (markerTimerRef.current) clearTimeout(markerTimerRef.current);
        if (prefersReducedMotion) {
            setShowRevealedMarker(true);
        } else {
            markerTimerRef.current = setTimeout(
                () => setShowRevealedMarker(true),
                650
            );
        }
    }, [playCardFlip, prefersReducedMotion]);

    const cards = [0, 1, 2, 3, 4];

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
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, []);

    useEffect(() => {
        const isPresent = (idx: number) =>
            Boolean(communityCards && communityCards[idx]);

        const nonePresent = [0, 1, 2, 3, 4].every((i) => !isPresent(i));

        if (nonePresent) {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
            flopScheduledRef.current = false;
            setRevealed([false, false, false, false, false]);
            return;
        }

        if (
            isPresent(0) &&
            isPresent(1) &&
            isPresent(2) &&
            !flopScheduledRef.current
        ) {
            flopScheduledRef.current = true;

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
                {cards.map((num, i) => {
                    const realCard = appState.game?.communityCards[num];

                    if (realCard && revealed[num]) {
                        return (
                            <CardComponent
                                key={i}
                                card={realCard}
                                placeholder={false}
                                folded={false}
                                onFlipStart={playCardFlip}
                                highlighted={winningSet.has(Number(realCard as unknown as number))}
                                dimmed={
                                    hasWinningCombination &&
                                    Boolean(
                                        appState.game &&
                                            appState.game.stage === 1 &&
                                            !appState.game.betting &&
                                            (appState.game.pots?.length || 0) > 0
                                    ) &&
                                    !winningSet.has(Number(realCard as unknown as number))
                                }
                            />
                        );
                    }

                    const rabbitIdx = num - dealtCount;
                    if (
                        hasRabbitCards &&
                        rabbitIdx >= 0 &&
                        rabbitCards &&
                        rabbitIdx < rabbitCards.length
                    ) {
                        if (rabbitRevealed) {
                            return (
                                <Box
                                    key={i}
                                    data-testid={`rabbit-card-${num}`}
                                    width="100%"
                                    position="relative"
                                    sx={{
                                        aspectRatio: '3 / 4',
                                        opacity: RABBIT_SLOT_OPACITY,
                                    }}
                                    title="Would have been dealt"
                                >
                                    <CardComponent
                                        card={rabbitCards[rabbitIdx]}
                                        placeholder={false}
                                        folded={false}
                                        onFlipStart={playCardFlip}
                                    />
                                    <RabbitFrontMarker
                                        visible={showRevealedMarker}
                                        reducedMotion={!!prefersReducedMotion}
                                    />
                                </Box>
                            );
                        }

                        return (
                            <Box
                                key={i}
                                data-testid="rabbit-card-placeholder"
                                width="100%"
                                position="relative"
                                cursor="pointer"
                                role="button"
                                tabIndex={0}
                                aria-label="Rabbit card — click to reveal what would have been dealt"
                                sx={{ aspectRatio: '3 / 4', opacity: RABBIT_SLOT_OPACITY }}
                                onMouseEnter={() => setHoveredRabbitIdx(num)}
                                onMouseLeave={() =>
                                    setHoveredRabbitIdx((prev) =>
                                        prev === num ? null : prev
                                    )
                                }
                                onFocus={() => setHoveredRabbitIdx(num)}
                                onBlur={() =>
                                    setHoveredRabbitIdx((prev) =>
                                        prev === num ? null : prev
                                    )
                                }
                                onClick={revealRabbit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        revealRabbit();
                                    }
                                }}
                            >
                                <CardComponent
                                    card={'0' as unknown as Card}
                                    placeholder={false}
                                    folded={false}
                                    skipAnimation={true}
                                />
                                <RabbitFoldedCorner
                                    visible={hoveredRabbitIdx === num}
                                    reducedMotion={!!prefersReducedMotion}
                                />
                            </Box>
                        );
                    }

                    return (
                        <CardComponent
                            key={i}
                            card="placeholder"
                            placeholder={true}
                            folded={false}
                        />
                    );
                })}
            </>
        );
    }

    return null;
};

export default CommunityCards;
