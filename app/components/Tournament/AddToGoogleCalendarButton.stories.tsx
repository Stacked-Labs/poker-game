'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import AddToGoogleCalendarButton from './AddToGoogleCalendarButton';
import { makeTournament } from './reminderStoryMocks';

// Render on the adaptive reminder surface so the button reads in both modes.
const Frame = (Story: React.FC) => (
    <Box bg="reminder.surface" p={6} borderRadius="16px" w="360px">
        <Story />
    </Box>
);

const meta = {
    title: 'Tournament/Reminders/AddToGoogleCalendarButton',
    component: AddToGoogleCalendarButton,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [Frame],
} satisfies Meta<typeof AddToGoogleCalendarButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RealMoney: Story = {
    name: 'Real-money tournament',
    args: { tournament: makeTournament() },
};

export const FreePlay: Story = {
    name: 'Free Play tournament',
    args: {
        tournament: makeTournament({
            name: 'Free Play Practice',
            buy_in_usdc: 0,
        }),
    },
};
