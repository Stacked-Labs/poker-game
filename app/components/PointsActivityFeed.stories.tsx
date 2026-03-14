'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, HStack, Text, Avatar, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaBolt } from 'react-icons/fa';
import { keyframes } from '@emotion/react';

// ─────────────────────────────────────────────────────────
// NOTE: PointsActivityFeed is gated to pathname === '/'
// and polls the backend API. For visual review we extract
// the inner pill UI into a standalone preview component
// so it can be seen and iterated on without a backend.
// ─────────────────────────────────────────────────────────

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

interface FeedPillProps {
    address: string;
    points: number;
    delta?: number;
    hiding?: boolean;
}

function FeedPill({ address, points, delta, hiding = false }: FeedPillProps) {
    const color = avatarColor(address);
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const pillBg = useColorModeValue('rgba(255,255,255,0.97)', 'rgba(7, 11, 28, 0.97)');
    const pillBorder = useColorModeValue('rgba(54,163,123,0.35)', 'rgba(54,163,123,0.4)');
    const labelColor = useColorModeValue('rgba(0,0,0,0.38)', 'rgba(255,255,255,0.38)');

    return (
        <Box
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
                <HStack spacing={3} align="center">
                    {/* Avatar — poker chip style */}
                    <Avatar
                        size="md"
                        bg={color}
                        color="white"
                        name={avatarInitials(address)}
                        getInitials={() => avatarInitials(address)}
                        flexShrink={0}
                        fontWeight="800"
                        fontSize="sm"
                        style={{
                            boxShadow: `0 0 0 2px rgba(255,255,255,0.14), 0 0 0 4px ${color}55, 0 0 14px ${color}45`,
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
                            color={labelColor}
                            letterSpacing="0.03em"
                            lineHeight={1}
                            mb="3px"
                            noOfLines={1}
                        >
                            {truncated}
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
                                {delta != null
                                    ? `+${delta.toLocaleString()} pts`
                                    : `${points.toLocaleString()} pts`}
                            </Text>
                        </Box>
                    </Box>
                </HStack>
            </Box>
        </Box>
    );
}

// Mock events used across stories
const MOCK_EVENTS = [
    { id: '1', address: '0xabc123def456789012345678901234567890abcd', points: 1200, delta: 25 },
    { id: '2', address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98', points: 450 },
    { id: '3', address: '0x1234567890abcdef1234567890abcdef12345678', points: 88, delta: 5 },
];

// ── Meta ────────────────────────────────────────────────

const meta = {
    title: 'Components/PointsActivityFeed',
    component: FeedPill,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Live social-proof ticker shown fixed at bottom-left of the homepage (`/`). Polls `/api/leaderboard` every 60s and cycles through recent point events with slide-in/out animations. Stories here show the **inner pill UI** directly since the real component is gated to `pathname === "/"` and requires a backend.',
            },
        },
        nextjs: { navigation: { pathname: '/' } },
    },
    decorators: [
        (Story: React.FC) => {
            const bg = document.documentElement.classList.contains('chakra-ui-dark')
                ? 'linear-gradient(135deg, #0d1117 0%, #1a2035 100%)'
                : 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)';
            return (
                <div
                    style={{
                        background: bg,
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: 24,
                    }}
                >
                    <Story />
                </div>
            );
        },
    ],
} satisfies Meta<typeof FeedPill>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ─────────────────────────────────────────────

export const WithDelta: Story = {
    name: 'Pill — with delta (+pts)',
    args: MOCK_EVENTS[0],
};

export const TotalOnly: Story = {
    name: 'Pill — total only (seed event)',
    args: MOCK_EVENTS[1],
};

export const SmallDelta: Story = {
    name: 'Pill — small delta (+5 pts)',
    args: MOCK_EVENTS[2],
};

export const SlidingOut: Story = {
    name: 'Pill — sliding out state',
    args: { ...MOCK_EVENTS[0], hiding: true },
};

function AutoCycleFeed() {
    const [index, setIndex] = useState(0);
    const [hiding, setHiding] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const cycle = () => {
            setHiding(true);
            timer.current = setTimeout(() => {
                setIndex((i) => (i + 1) % MOCK_EVENTS.length);
                setHiding(false);
                timer.current = setTimeout(cycle, 3500);
            }, 400);
        };
        timer.current = setTimeout(cycle, 3500);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, []);

    const event = MOCK_EVENTS[index];
    return (
        <FeedPill
            address={event.address}
            points={event.points}
            delta={event.delta}
            hiding={hiding}
        />
    );
}

/** Cycles through mock events automatically to preview the full ticker behaviour */
export const AutoCycle: Story = {
    name: 'Auto-cycle (simulates live feed)',
    args: MOCK_EVENTS[0],
    render: () => <AutoCycleFeed />,
};
