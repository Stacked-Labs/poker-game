import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import ShareResultButton from './ShareResultButton';

// In headless chromium `navigator.share` is absent, so these render the DESKTOP
// branch (the explicit menu). Click the button to open Post to X / Copy link.
// On a real mobile / Safari the same component renders a plain button that opens
// the native share sheet instead.

const meta = {
    title: 'Tournament/ShareResultButton',
    component: ShareResultButton,
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <Box w="320px" p={6} bg="#0B1130" borderRadius="16px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof ShareResultButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResultNeutral: Story = {
    args: {
        shareText:
            'Finished 14th of 20 in Nightly $50 on @stacked_poker. On-chain poker on Base.',
        shareUrl: 'https://stackedpoker.io/tournament/7',
    },
};

export const InvitePrimary: Story = {
    args: {
        label: 'Invite a friend',
        variant: 'tactilePrimary',
        shareText: "I saved you a seat on Stacked. Your first entry's on me.",
        shareUrl: 'https://stackedpoker.io/tournament/7/free?c=abc123',
    },
};
