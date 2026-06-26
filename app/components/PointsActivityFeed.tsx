'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playerDisplayName } from '@/app/utils/address';
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

type PointsEventKind = 'live' | 'standings';

interface PointsEvent {
    id: string;
    address: string;
    xUsername?: string | null;
    xDisplayName?: string | null;
    xProfileImageUrl?: string | null;
    points: number;
    delta?: number;
    rank?: number;
    kind: PointsEventKind;
}

const STANDINGS_POOL_SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
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
    xUsername?: string | null;
    xDisplayName?: string | null;
    xProfileImageUrl?: string | null;
    points: number;
    delta?: number;
    rank?: number;
    kind?: PointsEventKind;
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
    xUsername,
    xDisplayName,
    xProfileImageUrl,
    points,
    delta,
    rank,
    kind = 'live',
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
    const standingsChipBg = useColorModeValue('brand.darkNavy', 'rgba(255, 255, 255, 0.10)');

    const isStandings = kind === 'standings';
    const labelText = isStandings
        ? rank
            ? `Rank #${rank}`
            : 'On the leaderboard'
        : 'Stacked points';
    const chipBg = isStandings ? standingsChipBg : 'brand.green';
    const chipText = isStandings
        ? `${points.toLocaleString()} PTS`
        : delta != null
            ? `+${delta.toLocaleString()}`
            : points.toLocaleString();

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
                    {xProfileImageUrl ? (
                        <Box
                            as="img"
                            src={xProfileImageUrl}
                            alt=""
                            w="34px"
                            h="34px"
                            borderRadius="full"
                            flexShrink={0}
                            objectFit="cover"
                            boxShadow="0 1px 2px rgba(11, 20, 48, 0.18)"
                        />
                    ) : (
                        <ChipAvatar seed={address} reducedMotion={reducedMotion} />
                    )}
                    <Box flex={1} minW={0}>
                        <Text
                            fontSize="13px"
                            fontFamily={xUsername ? 'body' : 'mono'}
                            fontWeight={700}
                            color={addressColor}
                            letterSpacing={xUsername ? '0' : '0.02em'}
                            lineHeight={1.2}
                            noOfLines={1}
                        >
                            {playerDisplayName(
                                xUsername ? `@${xUsername}` : null,
                                address,
                                xDisplayName
                            ) || truncate(address)}
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
                            {labelText}
                        </Text>
                    </Box>
                    <Box
                        bg={chipBg}
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
                            {chipText}
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
    const standingsPool = useRef<PointsEvent[]>([]);
    const standingsCursor = useRef(0);
    const displayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const reducedMotion = usePrefersReducedMotion();

    const visible = pathname === '/';

    const drawStandings = useCallback((): PointsEvent | null => {
        const pool = standingsPool.current;
        if (pool.length === 0) return null;
        const idx = standingsCursor.current % pool.length;
        standingsCursor.current = (standingsCursor.current + 1) % pool.length;
        const base = pool[idx];
        return { ...base, id: `${base.address}-rotate-${Date.now()}` };
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        if (!backendUrl) return;
        try {
            const res = await fetch(`${backendUrl}/api/leaderboard`);
            if (!res.ok) return;
            const data: { leaderboard: { address: string; points: number; xUsername?: string | null; xDisplayName?: string | null; xProfileImageUrl?: string | null }[] } =
                await res.json();

            const liveEvents: PointsEvent[] = [];
            const standings: PointsEvent[] = [];

            data.leaderboard.forEach((entry, i) => {
                const prev = prevSnapshot.current.get(entry.address);
                if (
                    snapshotInitialized.current &&
                    prev !== undefined &&
                    entry.points > prev
                ) {
                    liveEvents.push({
                        id: `${entry.address}-${Date.now()}`,
                        address: entry.address,
                        xUsername: entry.xUsername,
                        xDisplayName: entry.xDisplayName,
                        xProfileImageUrl: entry.xProfileImageUrl,
                        points: entry.points,
                        delta: entry.points - prev,
                        kind: 'live',
                    });
                }
                if (i < STANDINGS_POOL_SIZE && entry.points > 0) {
                    standings.push({
                        id: `${entry.address}-rank-${i + 1}`,
                        address: entry.address,
                        xUsername: entry.xUsername,
                        xDisplayName: entry.xDisplayName,
                        xProfileImageUrl: entry.xProfileImageUrl,
                        points: entry.points,
                        rank: i + 1,
                        kind: 'standings',
                    });
                }
                prevSnapshot.current.set(entry.address, entry.points);
            });

            const wasFirstFetch = !snapshotInitialized.current;
            snapshotInitialized.current = true;
            standingsPool.current = shuffle(standings);
            standingsCursor.current = 0;

            if (liveEvents.length > 0) {
                // Live deltas jump the queue so real activity is seen first.
                setQueue((q) => [...liveEvents, ...q]);
            } else if (wasFirstFetch && standingsPool.current.length > 0) {
                // Seed the very first pill on landing so the feed is never silent.
                const first = drawStandings();
                if (first) setQueue((q) => (q.length === 0 ? [first] : q));
            }
        } catch {
            // non-critical UI; ignore
        }
    }, [backendUrl, drawStandings]);

    useEffect(() => {
        if (!visible) return;
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [visible, fetchLeaderboard]);

    const showNext = useCallback(() => {
        gapTimer.current = null;
        setQueue((q) => {
            let next: PointsEvent | null = null;
            let rest: PointsEvent[] = q;
            if (q.length > 0) {
                [next, ...rest] = q;
            } else {
                next = drawStandings();
            }
            if (!next) return q;

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
    }, [drawStandings]);

    useEffect(() => {
        if (!visible) return;
        if (current !== null) return;
        if (gapTimer.current) return;
        if (queue.length > 0 || standingsPool.current.length > 0) {
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
                xUsername={current.xUsername}
                xDisplayName={current.xDisplayName}
                xProfileImageUrl={current.xProfileImageUrl}
                points={current.points}
                delta={current.delta}
                rank={current.rank}
                kind={current.kind}
                hiding={hiding}
                reducedMotion={!!reducedMotion}
            />
        </Box>
    );
}
