'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, HStack, Text, Avatar } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// ─────────────────────────────────────────────────────────
// NOTE: PointsActivityFeed is gated to pathname === '/'
// and polls the backend API. For visual review we extract
// the inner pill UI into a standalone preview component
// so it can be seen and iterated on without a backend.
// ─────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(20px); opacity: 0; }
`;

interface FeedPillProps {
    address: string;
    points: number;
    delta?: number;
    hiding?: boolean;
}

function FeedPill({ address, points, delta, hiding = false }: FeedPillProps) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
        <Box
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
                            {truncated}
                        </Text>
                        <Text color="#36A37B" fontSize="xs" fontWeight="bold">
                            {delta != null
                                ? `+${delta.toLocaleString()} pts`
                                : `${points.toLocaleString()} pts total`}
                        </Text>
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
    // Using a wrapper component since the real one is API/pathname-gated
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
        (Story: React.FC) => (
            <div
                style={{
                    background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 24,
                }}
            >
                <Story />
            </div>
        ),
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
                timer.current = setTimeout(cycle, 3000);
            }, 350);
        };
        timer.current = setTimeout(cycle, 3000);
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
