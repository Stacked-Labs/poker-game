'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import FriendInvite from './FriendInvite';

const shareUrl = 'https://stackedpoker.io/tournament/1284/free?c=ABCD&ref=42';
const shareText = 'I saved you a free seat on Stacked Poker.';

const meta = {
    title: 'Tournament/FreeEntry/FriendInvite',
    component: FriendInvite,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <Box maxW="600px">
                <Story />
            </Box>
        ),
    ],
    args: {
        shareText,
        shareUrl,
        tweetUrl: 'https://x.com/intent/tweet',
        telegramUrl: 'https://t.me/share/url',
        copied: false,
        onCopy: () => {},
    },
} satisfies Meta<typeof FriendInvite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreshNoneJoined: Story = {
    name: 'Fresh — none joined',
    args: { joined: 0, issued: 3 },
};

export const SomeJoined: Story = {
    name: 'Some joined',
    args: { joined: 1, issued: 3 },
};

export const Copied: Story = {
    name: 'Copied state',
    args: { joined: 1, issued: 3, copied: true },
};

export const AllUsed: Story = {
    name: 'All invites used',
    args: { joined: 3, issued: 3 },
};
