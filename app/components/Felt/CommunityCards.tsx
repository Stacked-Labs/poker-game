'use client'

import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useSound } from '@/app/contexts/SoundProvider';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useReducedMotion } from 'framer-motion';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import CardComponent from '../Card';

const fadeInSlide = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
`;

// Custom card back for unrevealed rabbit slots — dark navy with pink rabbit silhouette.
// Shares the same 0 0 24 32 viewBox as the rest of the card system.
const RabbitCardBack = ({ idSuffix = '' }: { idSuffix?: string }) => {
    const patternId = `rabbitDotPattern${idSuffix}`;
    const glowId = `rabbitGlow${idSuffix}`;
    return (
        <svg width="100%" height="100%" viewBox="0 0 24 32" style={{ display: 'block' }}>
            <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="3" height="3">
                    <circle cx="1.5" cy="1.5" r="0.35" fill="#EB0B5C" opacity="0.18" />
                </pattern>
                <radialGradient id={glowId} cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#EB0B5C" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0B1430" stopOpacity="0" />
                </radialGradient>
            </defs>
            {/* Card background */}
            <rect width="24" height="32" rx="2.5" ry="2.5" fill="#0B1430" stroke="#EB0B5C" strokeWidth="0.65" strokeOpacity="0.6" />
            {/* Pink radial glow */}
            <rect width="24" height="32" rx="2.5" ry="2.5" fill={`url(#${glowId})`} />
            {/* Dot texture overlay */}
            <rect x="2" y="2" width="20" height="28" rx="1.5" ry="1.5" fill={`url(#${patternId})`} />
            {/* Inner inset border */}
            <rect x="2.75" y="2.75" width="18.5" height="26.5" rx="1.5" ry="1.5" fill="none" stroke="#EB0B5C" strokeWidth="0.45" strokeOpacity="0.3" />
            {/* Rabbit silhouette — centered at (12, 17) */}
            <g transform="translate(12, 17)" fill="#EB0B5C" opacity="0.72">
                {/* Ears */}
                <ellipse cx="-3.2" cy="-13" rx="2.1" ry="5.6" />
                <ellipse cx="3.2" cy="-13" rx="2.1" ry="5.6" />
                {/* Inner ear detail */}
                <ellipse cx="-3.2" cy="-13" rx="1.1" ry="3.8" fill="#0B1430" opacity="0.5" />
                <ellipse cx="3.2" cy="-13" rx="1.1" ry="3.8" fill="#0B1430" opacity="0.5" />
                {/* Head */}
                <circle cx="0" cy="-4.5" r="4.3" />
                {/* Body */}
                <ellipse cx="0" cy="5" rx="5.2" ry="6.5" />
                {/* Eyes with yellow pupils */}
                <circle cx="-1.6" cy="-5.4" r="0.9" fill="#FDC51D" opacity="0.9" />
                <circle cx="1.6" cy="-5.4" r="0.9" fill="#FDC51D" opacity="0.9" />
                <circle cx="-1.6" cy="-5.4" r="0.45" fill="#0B1430" />
                <circle cx="1.6" cy="-5.4" r="0.45" fill="#0B1430" />
                {/* Nose */}
                <ellipse cx="0" cy="-2.8" rx="0.9" ry="0.65" fill="#FDC51D" opacity="0.95" />
                {/* Paws */}
                <ellipse cx="-3.8" cy="10.5" rx="2.2" ry="1.4" />
                <ellipse cx="3.8" cy="10.5" rx="2.2" ry="1.4" />
                {/* Fluffy tail */}
                <circle cx="5.8" cy="2.5" r="1.5" opacity="0.5" />
            </g>
            {/* Corner question marks */}
            <text x="3" y="8" fontSize="5" fill="#EB0B5C" fillOpacity="0.5" fontFamily="sans-serif" fontWeight="bold">?</text>
            <text x="21" y="30" fontSize="5" fill="#EB0B5C" fillOpacity="0.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="end">?</text>
        </svg>
    );
};

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

    // Number of real community cards dealt this hand.
    const dealtCount = useMemo(
        () => (communityCards ?? []).filter(Boolean).length,
        [communityCards]
    );

    // Whether rabbit cards are available to show (post-concession, feature enabled).
    const hasRabbitCards = (rabbitCards?.length ?? 0) > 0;

    // Single reveal flag: one click on any rabbit placeholder reveals all.
    const [rabbitRevealed, setRabbitRevealed] = useState(false);
    // Hover state: hovering any placeholder peeks all rabbit cards simultaneously.
    const [isRabbitHovering, setIsRabbitHovering] = useState(false);

    // Reset reveal/hover state when rabbit cards change (new hand or new set).
    const prevRabbitRef = useRef<typeof rabbitCards>(undefined);
    useEffect(() => {
        if (prevRabbitRef.current !== rabbitCards) {
            prevRabbitRef.current = rabbitCards;
            if (!rabbitCards?.length) {
                setRabbitRevealed(false);
                setIsRabbitHovering(false);
            }
        }
    }, [rabbitCards]);

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
                {cards.map((num, i) => {
                    const realCard = appState.game?.communityCards[num];

                    // Real card: already dealt and locally revealed.
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

                    // Rabbit card slot: this index was undealt, and we have a rabbit card for it.
                    const rabbitIdx = num - dealtCount;
                    if (hasRabbitCards && rabbitIdx >= 0 && rabbitCards && rabbitIdx < rabbitCards.length) {
                        if (rabbitRevealed) {
                            // Revealed rabbit card: dimmed + desaturated + pink glow border + rabbit badge.
                            // Staggered fade-in so cards don't all appear at once.
                            return (
                                <Box
                                    key={i}
                                    data-testid={`rabbit-card-${num}`}
                                    position="relative"
                                    width="100%"
                                    borderRadius="10%"
                                    borderWidth="1.5px"
                                    borderStyle="solid"
                                    borderColor="rgba(235, 11, 92, 0.45)"
                                    boxShadow="0 0 10px 2px rgba(235, 11, 92, 0.18)"
                                    sx={{
                                        aspectRatio: '3 / 4',
                                        opacity: prefersReducedMotion ? 1 : 0,
                                        animation: prefersReducedMotion
                                            ? undefined
                                            : `${fadeInSlide} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${rabbitIdx * 100}ms forwards`,
                                    }}
                                    title="Would have been dealt"
                                >
                                    {/* Slightly desaturated and dimmed card face */}
                                    <Box
                                        position="absolute"
                                        top="0"
                                        left="0"
                                        width="100%"
                                        height="100%"
                                        sx={{ opacity: 0.78, filter: 'saturate(0.6)' }}
                                    >
                                        <CardComponent
                                            card={rabbitCards[rabbitIdx]}
                                            placeholder={false}
                                            folded={false}
                                            dimmed={false}
                                        />
                                    </Box>
                                    {/* Rabbit badge — top-right corner indicator */}
                                    <Box
                                        position="absolute"
                                        top="3px"
                                        right="3px"
                                        zIndex={11}
                                        pointerEvents="none"
                                        userSelect="none"
                                        bg="rgba(235, 11, 92, 0.85)"
                                        borderRadius="full"
                                        w="12px"
                                        h="12px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontSize="7px"
                                        lineHeight={1}
                                    >
                                        🐇
                                    </Box>
                                </Box>
                            );
                        }

                        // Unrevealed rabbit placeholder: custom card back with peek-on-hover.
                        // Hovering any placeholder slides the back up, revealing the face beneath.
                        // Clicking (or pressing Enter/Space) reveals all rabbit cards.
                        return (
                            <Box
                                key={i}
                                data-testid="rabbit-card-placeholder"
                                width="100%"
                                position="relative"
                                borderRadius="10%"
                                overflow="hidden"
                                cursor="pointer"
                                role="button"
                                tabIndex={0}
                                aria-label="Rabbit card — hover to peek, click to reveal"
                                borderWidth="1.5px"
                                borderStyle="solid"
                                borderColor="rgba(235, 11, 92, 0.55)"
                                boxShadow={
                                    isRabbitHovering
                                        ? '0 0 16px 4px rgba(235, 11, 92, 0.4)'
                                        : '0 0 6px 1px rgba(235, 11, 92, 0.2)'
                                }
                                transition="box-shadow 0.3s ease, transform 0.1s cubic-bezier(0.19, 1, 0.22, 1)"
                                _active={{ transform: 'scale(0.97)' }}
                                sx={{ aspectRatio: '3 / 4' }}
                                onMouseEnter={() => setIsRabbitHovering(true)}
                                onMouseLeave={() => setIsRabbitHovering(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        playCardFlip();
                                        setRabbitRevealed(true);
                                        setIsRabbitHovering(false);
                                    }
                                }}
                                onClick={() => {
                                    playCardFlip();
                                    setRabbitRevealed(true);
                                    setIsRabbitHovering(false);
                                }}
                            >
                                {/* Card face — always rendered in the back layer so the peek reveals it */}
                                <Box
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                    zIndex={1}
                                >
                                    <CardComponent
                                        card={rabbitCards[rabbitIdx]}
                                        placeholder={false}
                                        folded={false}
                                        skipAnimation={true}
                                    />
                                </Box>

                                {/* Rabbit card back — slides up on hover, clipped by overflow:hidden */}
                                <Box
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                    zIndex={2}
                                    sx={{
                                        transform:
                                            isRabbitHovering && !prefersReducedMotion
                                                ? 'translateY(-33%)'
                                                : 'translateY(0)',
                                        transition:
                                            'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    }}
                                >
                                    <RabbitCardBack idSuffix={String(i)} />
                                </Box>
                            </Box>
                        );
                    }

                    // Standard placeholder for undealt slots with no rabbit card.
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
