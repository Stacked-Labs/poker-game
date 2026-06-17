import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import PayoutLadder from './PayoutLadder';

const POOL = 5_840_000_000; // $5,840

const meta = {
    title: 'Tournament/Detail/PayoutLadder',
    component: PayoutLadder,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Tournament payout ladder. Before the field locks (registration / pending) the pool and entrant count are both still moving, so concrete USDC prizes would just be noise — we show **shares only**. The Prize column appears once the tournament starts and the ladder locks.',
            },
        },
    },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={{ base: 4, md: 8 }} maxW="560px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof PayoutLadder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Before start: registration is open, field is still shifting. Shares only —
// no Prize column. This is the state in the design note.
export const BeforeStartSharesOnly: Story = {
    name: 'Before start · shares only',
    args: {
        entrants: 120,
        prizePoolUsdc: POOL,
        isFreePlay: false,
        status: 'registration',
    },
};

// Same field, but the tournament has started: the ladder locks and concrete
// USDC prizes appear alongside the shares.
export const AfterStartWithPrizes: Story = {
    name: 'After start · prizes shown',
    args: {
        entrants: 120,
        prizePoolUsdc: POOL,
        isFreePlay: false,
        status: 'running',
    },
};

// Pending tournaments are also pre-start, so they get the shares-only view.
export const PendingSharesOnly: Story = {
    name: 'Pending · shares only',
    args: {
        entrants: 42,
        prizePoolUsdc: 2_100_000_000,
        isFreePlay: false,
        status: 'pending',
    },
};

export const MidFieldLocked: Story = {
    name: 'Mid field · locked',
    args: {
        entrants: 27,
        prizePoolUsdc: 1_350_000_000,
        isFreePlay: false,
        status: 'running',
    },
};

export const SmallFieldCompleted: Story = {
    name: 'Small field · completed',
    args: {
        entrants: 9,
        prizePoolUsdc: 450_000_000,
        isFreePlay: false,
        status: 'completed',
    },
};

// Free Play never shows prizes, before or after start — only shares.
export const FreePlay: Story = {
    args: {
        entrants: 80,
        prizePoolUsdc: 0,
        isFreePlay: true,
        status: 'running',
    },
};

// Pre-start with your projected finish flagged. Still shares only.
export const BeforeStartWithYou: Story = {
    name: 'Before start · with “you”',
    args: {
        entrants: 120,
        prizePoolUsdc: POOL,
        isFreePlay: false,
        status: 'registration',
        highlightPosition: 4,
    },
};
