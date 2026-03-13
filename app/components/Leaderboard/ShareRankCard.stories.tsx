'use client';

import type { Meta, StoryObj } from '@storybook/react';
import ShareRankCard from './ShareRankCard';

const meta = {
    title: 'Leaderboard/ShareRankCard',
    component: ShareRankCard,
    tags: ['autodocs'],
    argTypes: {
        rank: {
            control: { type: 'number', min: 1, max: 500 },
            description: 'Player rank (1 = first place)',
        },
        points: {
            control: { type: 'number', min: 0, step: 10 },
            description: 'Total leaderboard points',
        },
        address: {
            control: 'text',
            description: 'Full EVM wallet address',
        },
        total: {
            control: { type: 'number', min: 1 },
            description: 'Total number of players on the leaderboard — affects tier cutoffs',
        },
    },
    args: {
        rank: 1,
        points: 9200,
        address: '0xd3adb33f1234567890abcdef1234567890abcdef',
        total: 200,
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Renders a "Share Rank" button that opens a modal with a shareable card (poker-table background + tier chip + big rank number). Supports Twitter/X share and PNG download via `html-to-image`. Tier is derived from `rank / total` ratio.',
            },
        },
    },
} satisfies Meta<typeof ShareRankCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Tier cutoffs with total=200:
// Diamond: rank <= 10  (top 5%)
// Gold:    rank <= 30  (top 15%)
// Silver:  rank <= 60  (top 30%)
// Bronze:  rank <= 100 (top 50%)
// Iron:    rank > 100

export const Diamond: Story = {
    name: '💎 Diamond — rank #1',
    args: { rank: 1, points: 9200 },
};

export const Gold: Story = {
    name: '⭐ Gold — rank #20',
    args: { rank: 20, points: 3400 },
};

export const Silver: Story = {
    name: '🥈 Silver — rank #45',
    args: { rank: 45, points: 1200 },
};

export const Bronze: Story = {
    name: '🥉 Bronze — rank #80',
    args: { rank: 80, points: 450 },
};

export const Iron: Story = {
    name: '🔩 Iron — rank #150',
    args: { rank: 150, points: 30 },
};

export const ZeroPoints: Story = {
    name: 'Edge — 0 pts (Iron)',
    args: { rank: 200, points: 0, total: 200 },
};

export const SmallLeaderboard: Story = {
    name: 'Small leaderboard (5 players)',
    args: { rank: 1, points: 500, total: 5 },
};

export const HighRankNumber: Story = {
    name: 'Edge — rank #999',
    args: { rank: 999, points: 5, total: 1000 },
};
