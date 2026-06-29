'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, VStack, useColorModeValue } from '@chakra-ui/react';
import { PointsPill } from './PointsActivityFeed';

// PointsActivityFeed is gated to pathname === '/' and polls a
// backend. These stories render the inner pill directly so it can
// be reviewed without a backend.

const MOCK_EVENTS = [
    { id: '1', address: '0xabc123def456789012345678901234567890abcd', points: 1200, delta: 25, kind: 'live' as const },
    { id: '2', address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98', points: 4520, delta: 250, kind: 'live' as const },
    { id: '3', address: '0x1234567890abcdef1234567890abcdef12345678', points: 88, delta: 5, kind: 'live' as const },
    { id: '4', address: '0xdeadbeef00112233445566778899aabbccddeeff', points: 12450, delta: 1200, kind: 'live' as const },
];

const MOCK_STANDINGS = [
    { id: 's1', address: '0xdeadbeef00112233445566778899aabbccddeeff', points: 12450, rank: 1, kind: 'standings' as const },
    { id: 's2', address: '0x9f8e7d6c5b4a3210fedcba9876543210fedcba98', points: 9820,  rank: 2, kind: 'standings' as const },
    { id: 's3', address: '0xabc123def456789012345678901234567890abcd', points: 4520,  rank: 3, kind: 'standings' as const },
    { id: 's4', address: '0x1234567890abcdef1234567890abcdef12345678', points: 1860,  rank: 7, kind: 'standings' as const },
];

const MIXED_FEED = [
    MOCK_STANDINGS[0],
    MOCK_EVENTS[1],
    MOCK_STANDINGS[2],
    MOCK_EVENTS[3],
    MOCK_STANDINGS[1],
    MOCK_STANDINGS[3],
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
                    'Live social-proof pill shown bottom-left on `/`. Renders the player avatar (X photo when linked, otherwise a deterministic blockie derived from their address), a truncated address or @handle, and a flat felt-green points chip.',
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
    name: 'Stack — address blockies',
    render: () => (
        <VStack align="start" spacing={4}>
            {MOCK_EVENTS.map((e) => (
                <PointsPill key={e.id} address={e.address} points={e.points} delta={e.delta} kind={e.kind} />
            ))}
        </VStack>
    ),
};

// Avatar resolves X photo first, address blockie otherwise. This pair proves
// both paths render correctly in the pill (linked @handle vs raw address).
const X_AVATAR =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23EB0B5C"/><text x="48" y="64" font-size="48" text-anchor="middle" fill="white" font-family="sans-serif">M</text></svg>';

export const IdentityXVsAddress: Story = {
    name: 'Identity — X linked vs. address blockie',
    render: () => (
        <VStack align="start" spacing={4}>
            <PointsPill
                address={MOCK_STANDINGS[0].address}
                xUsername="degenmike"
                xDisplayName="Degen Mike"
                xProfileImageUrl={X_AVATAR}
                points={MOCK_STANDINGS[0].points}
                rank={MOCK_STANDINGS[0].rank}
                kind="standings"
            />
            <PointsPill {...MOCK_STANDINGS[1]} />
        </VStack>
    ),
};

// Standings pills — what fills the feed when there's no real activity.
// Honest framing: "RANK #N · 1,860 PTS" in a neutral chip, not a green
// "+pts" badge that would impersonate just-earned activity.
export const StandingsRank1: Story = {
    name: 'Standings — Rank #1',
    args: MOCK_STANDINGS[0],
};

export const StandingsRank3: Story = {
    name: 'Standings — Rank #3',
    args: MOCK_STANDINGS[2],
};

export const StandingsRank7: Story = {
    name: 'Standings — Rank #7',
    args: MOCK_STANDINGS[3],
};

export const StandingsStack: Story = {
    name: 'Standings — full top-N stack',
    render: () => (
        <VStack align="start" spacing={4}>
            {MOCK_STANDINGS.map((e) => (
                <PointsPill
                    key={e.id}
                    address={e.address}
                    points={e.points}
                    rank={e.rank}
                    kind={e.kind}
                />
            ))}
        </VStack>
    ),
};

export const SideBySide: Story = {
    name: 'Side-by-side — live vs. standings',
    render: () => (
        <VStack align="start" spacing={4}>
            <PointsPill {...MOCK_EVENTS[1]} />
            <PointsPill {...MOCK_STANDINGS[0]} />
            <PointsPill {...MOCK_EVENTS[3]} />
            <PointsPill {...MOCK_STANDINGS[2]} />
        </VStack>
    ),
};

function AutoCycleFeed({ events }: { events: typeof MIXED_FEED }) {
    const [index, setIndex] = useState(0);
    const [hiding, setHiding] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const cycle = () => {
            setHiding(true);
            timer.current = setTimeout(() => {
                setIndex((i) => (i + 1) % events.length);
                setHiding(false);
                timer.current = setTimeout(cycle, 3500);
            }, 400);
        };
        timer.current = setTimeout(cycle, 3500);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [events.length]);

    const event = events[index];
    return (
        <Box position="absolute" bottom={{ base: 4, md: 8 }} left={{ base: 4, md: 8 }}>
            <PointsPill
                address={event.address}
                points={event.points}
                delta={'delta' in event ? event.delta : undefined}
                rank={'rank' in event ? event.rank : undefined}
                kind={event.kind}
                hiding={hiding}
            />
        </Box>
    );
}

export const AutoCycleLive: Story = {
    name: 'Auto-cycle — live deltas only',
    args: MOCK_EVENTS[0],
    render: () => <AutoCycleFeed events={MOCK_EVENTS} />,
};

export const AutoCycleStandings: Story = {
    name: 'Auto-cycle — standings only (quiet site)',
    args: MOCK_STANDINGS[0],
    render: () => <AutoCycleFeed events={MOCK_STANDINGS} />,
};

export const AutoCycleMixed: Story = {
    name: 'Auto-cycle — mixed live + standings (typical feed)',
    args: MOCK_EVENTS[0],
    render: () => <AutoCycleFeed events={MIXED_FEED} />,
};
