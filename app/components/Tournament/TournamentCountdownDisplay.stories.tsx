'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, VStack, Text } from '@chakra-ui/react';
import TournamentCountdownDisplay from './TournamentCountdownDisplay';
import { fromNow, MINUTE } from './reminderStoryMocks';

// Render on the adaptive reminder surface the banner uses, so the chip reads in
// both light and dark mode (toggle the theme in the toolbar).
const Surface = (Story: React.FC) => (
    <Box bg="reminder.surface" p={6} borderRadius="12px" w="fit-content">
        <Story />
    </Box>
);

const meta = {
    title: 'Tournament/Reminders/CountdownDisplay',
    component: TournamentCountdownDisplay,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [Surface],
} satisfies Meta<typeof TournamentCountdownDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FarOut: Story = {
    name: 'Far out (relative, no badge)',
    args: { scheduledStartAt: fromNow(2 * 60 * MINUTE) },
};

export const StartingSoon: Story = {
    name: 'Starting soon (green badge)',
    args: { scheduledStartAt: fromNow(12 * MINUTE) },
};

export const FinalMinute: Story = {
    name: 'Final minute (ticking mm:ss)',
    args: { scheduledStartAt: fromNow(40_000) },
};

export const LateRegClosing: Story = {
    name: 'Late reg closing (pink filled pill)',
    args: {
        scheduledStartAt: fromNow(25 * MINUTE),
        lateRegCloseAt: fromNow(9 * MINUTE),
    },
};

// All three sizes side by side for a quick scale check.
export const Sizes: Story = {
    name: 'Sizes (sm / md / lg)',
    render: () => (
        <VStack align="start" spacing={4}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <Box key={size}>
                    <Text fontSize="xs" color="text.muted" mb={1}>
                        {size}
                    </Text>
                    <TournamentCountdownDisplay
                        scheduledStartAt={fromNow(12 * MINUTE)}
                        size={size}
                    />
                </Box>
            ))}
        </VStack>
    ),
};
