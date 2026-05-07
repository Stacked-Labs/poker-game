'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    HStack,
    Text,
    useColorModeValue,
    usePrefersReducedMotion,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { keyframes } from '@emotion/react';

const POLL_INTERVAL_MS = 60_000;
const DISPLAY_DURATION_MS = 4_000;
const MIN_GAP_MS = 5_000;
const MAX_GAP_MS = 12_000;

const EASE_OUT_QUART = 'cubic-bezier(0.25, 1, 0.5, 1)';

const slideIn = keyframes`
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateY(0);   opacity: 1; }
  to   { transform: translateY(12px); opacity: 0; }
`;

// Chip flips face-up on deal-in, like a card off the deck.
const chipFlip = keyframes`
  from { transform: rotateY(180deg); }
  to   { transform: rotateY(0); }
`;

interface PointsEvent {
    id: string;
    address: string;
    points: number;
    delta?: number;
}

// Suits are decorative: drawn at random per event, pairing brand
// color with shape so identity survives color-blindness checks.
const SUITS = [
    { glyph: '♠', token: 'brand.darkNavy' },
    { glyph: '♥', token: 'brand.pink' },
    { glyph: '♦', token: 'brand.navy' },
    { glyph: '♣', token: 'brand.green' },
] as const;

type Suit = (typeof SUITS)[number];

function truncate(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function randomSuit(): Suit {
    return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function randomGap() {
    return MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
}

export interface PointsPillProps {
    address: string;
    points: number;
    delta?: number;
    hiding?: boolean;
    reducedMotion?: boolean;
}

// Chip avatar: poker-chip cross-section with a suit glyph. Dashed
// outer ring stands in for the painted edge stripes on a real chip.
function ChipAvatar({ reducedMotion, seed }: { reducedMotion?: boolean; seed?: string }) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const suit = useMemo(() => randomSuit(), [seed]);
    const flip = reducedMotion
        ? undefined
        : `${chipFlip} 0.55s ${EASE_OUT_QUART} backwards`;
    return (
        <Box
            w="34px"
            h="34px"
            borderRadius="full"
            bg={suit.token}
            border="2px dashed"
            borderColor="rgba(255, 255, 255, 0.55)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            boxShadow="0 1px 2px rgba(11, 20, 48, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.08)"
            animation={flip}
            sx={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        >
            <Text
                as="span"
                fontSize="15px"
                lineHeight={1}
                color="white"
                fontWeight={800}
                aria-hidden
            >
                {suit.glyph}
            </Text>
        </Box>
    );
}

function PillFrame({
    hiding,
    reducedMotion,
    children,
}: {
    hiding?: boolean;
    reducedMotion?: boolean;
    children: React.ReactNode;
}) {
    const animation = reducedMotion
        ? undefined
        : `${hiding ? slideOut : slideIn} 0.35s ${EASE_OUT_QUART} forwards`;
    return (
        <Box animation={animation} pointerEvents="none">
            {children}
        </Box>
    );
}

export function PointsPill({
    address,
    points,
    delta,
    hiding,
    reducedMotion,
}: PointsPillProps) {
    const bg = useColorModeValue('white', '#171717');
    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.08)',
        'rgba(255, 255, 255, 0.08)',
    );
    const addressColor = useColorModeValue('brand.darkNavy', 'brand.lightGray');
    const labelColor = useColorModeValue(
        'rgba(11, 20, 48, 0.55)',
        'rgba(236, 238, 245, 0.55)',
    );
    const stripeColor = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255, 255, 255, 0.05)',
    );

    return (
        <PillFrame hiding={hiding} reducedMotion={reducedMotion}>
            <Box
                position="relative"
                bg={bg}
                border="1px solid"
                borderColor={border}
                borderRadius="2xl"
                px={4}
                py={3}
                maxW="300px"
                boxShadow="card.lift"
                overflow="hidden"
                _after={{
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 6px, ${stripeColor} 6px 7px)`,
                    opacity: 0.55,
                }}
            >
                <HStack spacing={3} align="center" position="relative" zIndex={1}>
                    <ChipAvatar seed={address} reducedMotion={reducedMotion} />
                    <Box flex={1} minW={0}>
                        <Text
                            fontSize="13px"
                            fontFamily="mono"
                            fontWeight={700}
                            color={addressColor}
                            letterSpacing="0.02em"
                            lineHeight={1.2}
                            noOfLines={1}
                        >
                            {truncate(address)}
                        </Text>
                        <Text
                            fontSize="11px"
                            color={labelColor}
                            letterSpacing="0.04em"
                            textTransform="uppercase"
                            fontWeight={700}
                            lineHeight={1.2}
                            mt="2px"
                        >
                            stacked points
                        </Text>
                    </Box>
                    <Box
                        bg="brand.green"
                        borderRadius="md"
                        px={2.5}
                        py={1}
                        flexShrink={0}
                    >
                        <Text
                            fontSize="12px"
                            fontWeight={800}
                            color="white"
                            letterSpacing="0.02em"
                            lineHeight={1}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {delta != null
                                ? `+${delta.toLocaleString()}`
                                : points.toLocaleString()}
                        </Text>
                    </Box>
                </HStack>
            </Box>
        </PillFrame>
    );
}

export default function PointsActivityFeed() {
    const pathname = usePathname();
    const [queue, setQueue] = useState<PointsEvent[]>([]);
    const [current, setCurrent] = useState<PointsEvent | null>(null);
    const [hiding, setHiding] = useState(false);
    const prevSnapshot = useRef<Map<string, number>>(new Map());
    const snapshotInitialized = useRef(false);
    const displayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const reducedMotion = usePrefersReducedMotion();

    const visible = pathname === '/';

    const fetchLeaderboard = useCallback(async () => {
        if (!backendUrl) return;
        try {
            const res = await fetch(`${backendUrl}/api/leaderboard`);
            if (!res.ok) return;
            const data: { leaderboard: { address: string; points: number }[] } =
                await res.json();

            const events: PointsEvent[] = [];

            for (const entry of data.leaderboard) {
                const prev = prevSnapshot.current.get(entry.address);
                if (
                    snapshotInitialized.current &&
                    prev !== undefined &&
                    entry.points > prev
                ) {
                    events.push({
                        id: `${entry.address}-${Date.now()}`,
                        address: entry.address,
                        points: entry.points,
                        delta: entry.points - prev,
                    });
                }
                prevSnapshot.current.set(entry.address, entry.points);
            }

            snapshotInitialized.current = true;

            if (events.length > 0) {
                setQueue((q) => [...q, ...events]);
            }
        } catch {
            // non-critical UI; ignore
        }
    }, [backendUrl]);

    useEffect(() => {
        if (!visible) return;
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [visible, fetchLeaderboard]);

    const showNext = useCallback(() => {
        setQueue((q) => {
            if (q.length === 0) return q;
            const [next, ...rest] = q;
            setCurrent(next);
            setHiding(false);

            displayTimer.current = setTimeout(() => {
                setHiding(true);
                setTimeout(() => {
                    setCurrent(null);
                    gapTimer.current = setTimeout(showNext, randomGap());
                }, 350);
            }, DISPLAY_DURATION_MS);

            return rest;
        });
    }, []);

    useEffect(() => {
        if (!visible) return;
        if (current === null && queue.length > 0 && !gapTimer.current) {
            gapTimer.current = setTimeout(showNext, randomGap());
        }
    }, [visible, queue, current, showNext]);

    useEffect(() => {
        return () => {
            if (displayTimer.current) clearTimeout(displayTimer.current);
            if (gapTimer.current) clearTimeout(gapTimer.current);
        };
    }, []);

    if (!visible || !current) return null;

    return (
        <Box
            position="fixed"
            bottom={{ base: 4, md: 6 }}
            left={{ base: 4, md: 6 }}
            zIndex={200}
        >
            <PointsPill
                address={current.address}
                points={current.points}
                delta={current.delta}
                hiding={hiding}
                reducedMotion={!!reducedMotion}
            />
        </Box>
    );
}
