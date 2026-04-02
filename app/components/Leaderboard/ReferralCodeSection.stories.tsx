'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThirdwebProvider } from 'thirdweb/react';
import ReferralCodeSection from './ReferralCodeSection';

const meta = {
    title: 'Leaderboard/ReferralCodeSection',
    component: ReferralCodeSection,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <ThirdwebProvider>
                <div style={{ maxWidth: 380, padding: 16 }}>
                    <Story />
                </div>
            </ThirdwebProvider>
        ),
    ],
    argTypes: {
        referralInfo: { control: 'object' },
    },
    args: {
        referralInfo: {
            count: 3,
            multiplier: 1.0,
            nextTier: { required: 5, multiplier: 1.1 },
            hasReferrer: false,
        },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Borderless referral section: code + text-link copy, inline multiplier progress, and collapsible "Have a referral code?" input with framer-motion animation.',
            },
        },
    },
} satisfies Meta<typeof ReferralCodeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoReferrals: Story = {
    name: 'No Referrals',
    args: {
        referralInfo: { count: 0, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: false },
    },
};

export const FirstTierUnlocked: Story = {
    name: '1.1x Tier Unlocked',
    args: {
        referralInfo: { count: 8, multiplier: 1.1, nextTier: { required: 20, multiplier: 1.2 }, hasReferrer: false },
    },
};

export const MaxTier: Story = {
    name: 'Max Tier (1.2x)',
    args: {
        referralInfo: { count: 25, multiplier: 1.2, nextTier: null, hasReferrer: false },
    },
};

export const AlreadyReferred: Story = {
    name: 'Referral Already Applied',
    args: {
        referralInfo: { count: 3, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: true },
    },
};

export const Loading: Story = {
    name: 'Loading State',
    args: { referralInfo: undefined },
};

export const AlmostNextTier: Story = {
    name: 'Almost Next Tier (4/5)',
    args: {
        referralInfo: { count: 4, multiplier: 1.0, nextTier: { required: 5, multiplier: 1.1 }, hasReferrer: false },
    },
};
