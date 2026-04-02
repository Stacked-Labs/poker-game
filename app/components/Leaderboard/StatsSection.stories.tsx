'use client';

import type { Meta, StoryObj } from '@storybook/react';
import StatsSection from './StatsSection';

const meta = {
    title: 'Leaderboard/StatsSection',
    component: StatsSection,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 380, padding: 16 }}>
                <Story />
            </div>
        ),
    ],
    argTypes: {
        stats: { control: 'object' },
    },
    args: {
        stats: { gamesCreated: 12, gamesPlayed: 47, handsPlayed: 284 },
    },
    parameters: {
        docs: {
            description: {
                component:
                    '3-column stat display: number stacked over label, separated by thin vertical dividers. Tables (green), Games (pink), Hands (yellow).',
            },
        },
    },
} satisfies Meta<typeof StatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ZeroStats: Story = {
    name: 'Zero Stats',
    args: { stats: { gamesCreated: 0, gamesPlayed: 0, handsPlayed: 0 } },
};

export const HighStats: Story = {
    name: 'High Stats',
    args: { stats: { gamesCreated: 150, gamesPlayed: 1234, handsPlayed: 8742 } },
};

