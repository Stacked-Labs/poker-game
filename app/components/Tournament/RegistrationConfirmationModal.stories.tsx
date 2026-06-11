'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RegistrationConfirmationModal from './RegistrationConfirmationModal';
import { makeTournament } from './reminderStoryMocks';

// The modal is a bottom sheet that portals to the viewport, so render
// fullscreen. Web Push APIs may be unavailable in the Storybook iframe; the
// component degrades to the calendar-only path, which is itself a valid state
// to review (it is what web-only iOS players see).
const meta = {
    title: 'Tournament/Reminders/RegistrationConfirmationModal',
    component: RegistrationConfirmationModal,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        isOpen: true,
        onClose: () => {},
    },
} satisfies Meta<typeof RegistrationConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstRegistration: Story = {
    name: "First registration (You're in.)",
    args: { tournament: makeTournament(), isReentry: false },
};

export const Reentry: Story = {
    name: "Re-entry (You're back in.)",
    args: { tournament: makeTournament(), isReentry: true },
};

export const FreePlay: Story = {
    name: 'Free Play',
    args: {
        tournament: makeTournament({
            name: 'Free Play Practice',
            buy_in_usdc: 0,
        }),
        isReentry: false,
    },
};
