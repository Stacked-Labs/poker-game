'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Button, Icon } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import FreeClaimScreen, { type ClaimTournament } from './FreeClaimScreen';
import FriendInvite from '@/app/components/Tournament/FriendInvite';

// A guarantee-led event (pre-fill: prize pool is null, the host guarantee leads).
const guaranteed: ClaimTournament = {
    name: 'Friday Freezeout',
    status: 'registration',
    scheduled_start_at: '2026-07-03T23:30:00Z',
    buy_in_usdc: 25_000_000,
    guarantee_usdc: 500_000_000,
    prize_pool_usdc: null,
};

const walletStub = (
    <Button variant="tactilePrimary" size="lg" w="full">
        Sign in to claim
    </Button>
);

const calendarStub = (
    <Button
        variant="tactileNeutral"
        w="full"
        leftIcon={<Icon as={FiCalendar} boxSize={4} />}
    >
        Add to Google Calendar
    </Button>
);

const friendInviteStub = (
    <FriendInvite
        joined={0}
        issued={3}
        shareText="I saved you a free seat on Stacked Poker."
        shareUrl="https://stackedpoker.io/tournament/1284/free?c=ABCD"
        tweetUrl="https://x.com/intent/tweet"
        telegramUrl="https://t.me/share/url"
        copied={false}
        onCopy={() => {}}
    />
);

const meta = {
    title: 'Tournament/FreeEntry/FreeClaimScreen',
    component: FreeClaimScreen,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        tournament: guaranteed,
        onClaim: () => {},
        onView: () => {},
        onRetry: () => {},
    },
} satisfies Meta<typeof FreeClaimScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvailableSignedIn: Story = {
    name: 'Available — signed in',
    args: {
        status: 'available',
        isAuthenticated: true,
        reminder: { mode: 'checkbox', checked: true, onChange: () => {} },
    },
};

export const AvailableSignedOut: Story = {
    name: 'Available — signed out',
    args: {
        status: 'available',
        isAuthenticated: false,
        reminder: { mode: 'checkbox', checked: true, onChange: () => {} },
        walletSlot: walletStub,
    },
};

export const AvailableIOSReminder: Story = {
    name: 'Available — iOS reminder fallback',
    args: {
        status: 'available',
        isAuthenticated: true,
        reminder: { mode: 'ios' },
        calendarSlot: calendarStub,
    },
};

export const Success: Story = {
    args: {
        status: 'success',
        friendInviteSlot: friendInviteStub,
    },
};

export const Full: Story = { args: { status: 'full' } };
export const Started: Story = { args: { status: 'started' } };
export const Used: Story = { args: { status: 'used' } };
export const Invalid: Story = { args: { status: 'invalid', tournament: undefined } };
export const Disabled: Story = { args: { status: 'disabled' } };
export const AlreadyRegistered: Story = {
    name: 'Already registered',
    args: { status: 'registered' },
};
export const SelfClaim: Story = {
    name: 'Self-claim',
    args: { status: 'self_claim' },
};
export const NetworkError: Story = {
    name: 'Network error',
    args: { status: 'error', tournament: undefined },
};
