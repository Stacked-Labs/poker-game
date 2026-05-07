'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, VStack, useColorModeValue } from '@chakra-ui/react';
import { PointsPill } from './PointsActivityFeed';

// PointsActivityFeed is gated to pathname === '/' and polls a
// backend. These stories render the inner pill directly so it can
// be reviewed without a backend.

const MOCK_EVENTS = [
    { id: '1', address: '0xabc123def456789012345678901234567890abcd', points: 1200, delta: 25 },
    { id: '2', address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98', points: 4520, delta: 250 },
    { id: '3', address: '0x1234567890abcdef1234567890abcdef12345678', points: 88, delta: 5 },
    { id: '4', address: '0xdeadbeef00112233445566778899aabbccddeeff', points: 12450, delta: 1200 },
];

function StagedSurface({ children }: { children: React.ReactNode }) {
    const bg = useColorModeValue('#ECEEF5', '#0B1430');
    return (
        <Box bg={bg} minH="100vh" p={{ base: 4, md: 8 }}>
            {children}
        </Box>
    );
}

const meta = {
    title: 'Components/PointsActivityFeed',
    component: PointsPill,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Live social-proof pill shown bottom-left on `/`. Renders a chip-avatar with a randomized suit glyph, a truncated address, and a flat felt-green points chip.',
            },
        },
        nextjs: { navigation: { pathname: '/' } },
    },
    decorators: [
        (Story) => (
            <StagedSurface>
                <Story />
            </StagedSurface>
        ),
    ],
} satisfies Meta<typeof PointsPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDelta: Story = {
    name: 'With delta (+pts)',
    args: MOCK_EVENTS[0],
};

export const LargeDelta: Story = {
    name: 'Large delta (+1,200)',
    args: MOCK_EVENTS[3],
};

export const SmallDelta: Story = {
    name: 'Small delta (+5)',
    args: MOCK_EVENTS[2],
};

export const TotalOnly: Story = {
    name: 'Total only (no delta)',
    args: { address: MOCK_EVENTS[1].address, points: MOCK_EVENTS[1].points },
};

export const SlidingOut: Story = {
    name: 'Sliding-out state',
    args: { ...MOCK_EVENTS[0], hiding: true },
};

export const Stack: Story = {
    name: 'Stack — variety of suits',
    render: () => (
        <VStack align="start" spacing={4}>
            {MOCK_EVENTS.map((e) => (
                <PointsPill key={e.id} address={e.address} points={e.points} delta={e.delta} />
            ))}
        </VStack>
    ),
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
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, []);

    const event = MOCK_EVENTS[index];
    return (
        <Box position="absolute" bottom={{ base: 4, md: 8 }} left={{ base: 4, md: 8 }}>
            <PointsPill
                address={event.address}
                points={event.points}
                delta={event.delta}
                hiding={hiding}
            />
        </Box>
    );
}

export const AutoCycle: Story = {
    name: 'Auto-cycle (live preview)',
    args: MOCK_EVENTS[0],
    render: () => <AutoCycleFeed />,
};
