'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, HStack, Text, Avatar } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { keyframes } from '@emotion/react';

const POLL_INTERVAL_MS = 60_000;
const DISPLAY_DURATION_MS = 4_000;
const MIN_GAP_MS = 5_000;
const MAX_GAP_MS = 12_000;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(20px); opacity: 0; }
`;

interface PointsEvent {
    id: string;
    address: string;
    points: number;
    delta?: number;
}

function truncate(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function randomGap() {
    return MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
}

export default function PointsActivityFeed() {
    const pathname = usePathname();
    const [queue, setQueue] = useState<PointsEvent[]>([]);
    const [current, setCurrent] = useState<PointsEvent | null>(null);
    const [hiding, setHiding] = useState(false);
    const prevSnapshot = useRef<Map<string, number>>(new Map());
    const displayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    // Only show on the landing page
    const visible = pathname === '/';

    const fetchLeaderboard = useCallback(async () => {
        if (!backendUrl) return;
        try {
            const res = await fetch(`${backendUrl}/api/leaderboard`);
            if (!res.ok) return;
            const data: { leaderboard: { address: string; points: number }[] } =
                await res.json();

            const events: PointsEvent[] = [];
            const isFirstFetch = prevSnapshot.current.size === 0;

            for (const entry of data.leaderboard) {
                const prev = prevSnapshot.current.get(entry.address);
                if (isFirstFetch) {
                    // Seed with top 5 as "intro" events (no delta)
                    if (events.length < 5) {
                        events.push({
                            id: `${entry.address}-seed-${Date.now()}-${events.length}`,
                            address: entry.address,
                            points: entry.points,
                        });
                    }
                } else if (prev !== undefined && entry.points > prev) {
                    events.push({
                        id: `${entry.address}-${Date.now()}`,
                        address: entry.address,
                        points: entry.points,
                        delta: entry.points - prev,
                    });
                }
                prevSnapshot.current.set(entry.address, entry.points);
            }

            if (events.length > 0) {
                setQueue((q) => [...q, ...events]);
            }
        } catch {
            // silently ignore network errors — this is non-critical UI
        }
    }, [backendUrl]);

    // Poll for updates
    useEffect(() => {
        if (!visible) return;
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [visible, fetchLeaderboard]);

    // Display loop: dequeue → show → hide → wait gap → repeat
    const showNext = useCallback(() => {
        setQueue((q) => {
            if (q.length === 0) return q;
            const [next, ...rest] = q;
            setCurrent(next);
            setHiding(false);

            // Schedule hide
            displayTimer.current = setTimeout(() => {
                setHiding(true);
                // After hide animation (300ms), clear and schedule next
                setTimeout(() => {
                    setCurrent(null);
                    gapTimer.current = setTimeout(showNext, randomGap());
                }, 300);
            }, DISPLAY_DURATION_MS);

            return rest;
        });
    }, []);

    // Kick off the display loop whenever queue gets a first item
    useEffect(() => {
        if (!visible) return;
        if (current === null && queue.length > 0 && !gapTimer.current) {
            gapTimer.current = setTimeout(showNext, randomGap());
        }
    }, [visible, queue, current, showNext]);

    // Cleanup
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
            animation={`${hiding ? slideOut : slideIn} 0.3s ease forwards`}
            pointerEvents="none"
        >
            <Box
                bg="rgba(11, 20, 48, 0.92)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(54, 163, 123, 0.35)"
                borderRadius="14px"
                px={4}
                py={3}
                boxShadow="0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(54,163,123,0.1)"
                maxW="300px"
            >
                <HStack spacing={3} align="center">
                    <Avatar
                        size="sm"
                        border="2px solid"
                        borderColor="brand.green"
                        flexShrink={0}
                    />
                    <Box>
                        <Text
                            color="rgba(255,255,255,0.6)"
                            fontSize="10px"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            mb={0.5}
                        >
                            🃏 Points earned
                        </Text>
                        <Text
                            color="white"
                            fontSize="sm"
                            fontWeight="semibold"
                            fontFamily="mono"
                            lineHeight="1.3"
                        >
                            {truncate(current.address)}
                        </Text>
                        <Text
                            color="#36A37B"
                            fontSize="xs"
                            fontWeight="bold"
                        >
                            {current.delta != null
                                ? `+${current.delta.toLocaleString()} pts`
                                : `${current.points.toLocaleString()} pts total`}
                        </Text>
                    </Box>
                </HStack>
            </Box>
        </Box>
    );
}
