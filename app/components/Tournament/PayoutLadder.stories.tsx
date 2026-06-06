import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import PayoutLadder from './PayoutLadder';

const POOL = 5_840_000_000; // $5,840

const meta = {
    title: 'Tournament/Detail/PayoutLadder',
    component: PayoutLadder,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
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

export const BigFieldProjected: Story = {
    args: {
        entrants: 120,
        prizePoolUsdc: POOL,
        isFreePlay: false,
        status: 'registration',
    },
};

export const BigFieldLocked: Story = {
    args: {
        entrants: 120,
        prizePoolUsdc: POOL,
        isFreePlay: false,
        status: 'running',
    },
};

export const MidField: Story = {
    args: {
        entrants: 27,
        prizePoolUsdc: 1_350_000_000,
        isFreePlay: false,
        status: 'running',
    },
};

export const SmallField: Story = {
    args: {
        entrants: 9,
        prizePoolUsdc: 450_000_000,
        isFreePlay: false,
        status: 'completed',
    },
};

export const FreePlay: Story = {
    args: {
        entrants: 80,
        prizePoolUsdc: 0,
        isFreePlay: true,
        status: 'running',
    },
};
