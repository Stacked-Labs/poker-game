'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, HStack, Text, Avatar, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaBolt } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { keyframes } from '@emotion/react';

const POLL_INTERVAL_MS = 60_000;
const DISPLAY_DURATION_MS = 4_000;
const MIN_GAP_MS = 5_000;
const MAX_GAP_MS = 12_000;

const slideIn = keyframes`
  0%   { transform: translateY(20px) scale(0.94); opacity: 0; }
  60%  { transform: translateY(-4px) scale(1.02); opacity: 1; }
  100% { transform: translateY(0)    scale(1);    opacity: 1; }
`;

const slideOut = keyframes`
  0%   { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(20px); opacity: 0; }
`;

// Pulsing live dot
const livePing = keyframes`
  0%   { box-shadow: 0 0 0 0   rgba(54,163,123,0.9); }
  70%  { box-shadow: 0 0 0 6px rgba(54,163,123,0);   }
  100% { box-shadow: 0 0 0 0   rgba(54,163,123,0);   }
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

const AVATAR_COLORS = [
    '#6C63FF', '#E85D75', '#F4A261', '#2A9D8F', '#E76F51',
    '#457B9D', '#9B5DE5', '#8338EC', '#FB5607', '#3A86FF',
];

function avatarColor(addr: string): string {
    let hash = 0;
    for (let i = 0; i < addr.length; i++) hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarInitials(addr: string): string {
    return addr.slice(2, 4).toUpperCase();
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

    const visible = pathname === '/';

    const pillBg = useColorModeValue('rgba(255,255,255,0.97)', 'rgba(7, 11, 28, 0.97)');
    const pillBorder = useColorModeValue('rgba(54,163,123,0.35)', 'rgba(54,163,123,0.4)');
    const labelColor = useColorModeValue('rgba(0,0,0,0.38)', 'rgba(255,255,255,0.38)');
    const addressColor = useColorModeValue('rgba(0,0,0,0.38)', 'rgba(255,255,255,0.38)');

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

    const color = avatarColor(current.address);

    return (
        <Box
            position="fixed"
            bottom={{ base: 4, md: 6 }}
            left={{ base: 4, md: 6 }}
            zIndex={200}
            animation={`${hiding ? slideOut : slideIn} 0.4s ease forwards`}
            pointerEvents="none"
        >
            <Box
                bg={pillBg}
                backdropFilter="blur(20px)"
                border="1px solid"
                borderColor={pillBorder}
                borderRadius="18px"
                px={4}
                py="14px"
                maxW="290px"
                boxShadow="0 8px 32px rgba(0,0,0,0.2)"
            >

                <HStack spacing={3} align="center" position="relative">
                    {/* Avatar — poker chip style via layered box-shadow */}
                    <Avatar
                        size="md"
                        bg={color}
                        color="white"
                        name={avatarInitials(current.address)}
                        getInitials={() => avatarInitials(current.address)}
                        flexShrink={0}
                        fontWeight="800"
                        fontSize="sm"
                        style={{
                            boxShadow: `0 0 0 2px rgba(255,255,255,0.14), 0 0 0 4px ${color}55, 0 0 16px ${color}50`,
                        }}
                    />

                    <Box flex={1} minW={0}>
                        {/* Header row */}
                        <HStack spacing={1.5} mb="3px" align="center">
                            <Text
                                fontSize="11px"
                                letterSpacing="0.06em"
                                textTransform="uppercase"
                                color={labelColor}
                                fontWeight="700"
                                lineHeight={1}
                            >
                                <Icon as={FaBolt} mr="4px" boxSize="9px" />Just earned
                            </Text>
                            {/* Live indicator */}
                            <Box
                                w="5px"
                                h="5px"
                                borderRadius="full"
                                bg="brand.green"
                                flexShrink={0}
                                animation={`${livePing} 1.6s ease-in-out infinite`}
                            />
                        </HStack>

                        {/* Address */}
                        <Text
                            fontSize="11px"
                            fontFamily="mono"
                            color={addressColor}
                            letterSpacing="0.03em"
                            lineHeight={1}
                            mb="3px"
                            noOfLines={1}
                        >
                            {truncate(current.address)}
                        </Text>

                        {/* Points badge */}
                        <Box
                            display="inline-flex"
                            alignItems="center"
                            px="10px"
                            py="4px"
                            bg="linear-gradient(135deg, #36A37B 0%, #1f7a59 100%)"
                            borderRadius="full"
                            boxShadow="0 2px 8px rgba(54,163,123,0.4)"
                        >
                            <Text
                                fontSize="12px"
                                fontWeight="700"
                                color="white"
                                letterSpacing="0.02em"
                                lineHeight={1}
                            >
                                {current.delta != null
                                    ? `+${current.delta.toLocaleString()} pts`
                                    : `${current.points.toLocaleString()} pts`}
                            </Text>
                        </Box>
                    </Box>
                </HStack>
            </Box>
        </Box>
    );
}
