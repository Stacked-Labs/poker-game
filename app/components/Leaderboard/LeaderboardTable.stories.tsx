'use client';

import type { Meta, StoryObj } from '@storybook/react';
import LeaderboardTable from './LeaderboardTable';
import type { LeaderboardEntry } from './LeaderboardTable';

const ADDRESSES = [
    '0xd3adb33f1234567890abcdef1234567890abcdef',
    '0xA1B2C3D4E5F6789012345678901234567890ABCD',
    '0x9876543210FEDCBA9876543210FEDCBA98765432',
    '0x1111222233334444555566667777888899990000',
    '0xAAAABBBBCCCCDDDDEEEEFFFF0000111122223333',
    '0xDEADBEEF00000000000000000000000000000001',
    '0xCAFEBABE00000000000000000000000000000002',
    '0xFACEFEED00000000000000000000000000000003',
    '0xBAADF00D00000000000000000000000000000004',
    '0x0123456789ABCDEF0123456789ABCDEF01234567',
];

const CURRENT_ADDRESS = ADDRESSES[3];

const makeEntries = (count: number): LeaderboardEntry[] =>
    Array.from({ length: count }, (_, i) => ({
        rank: i + 1,
        address: ADDRESSES[i % ADDRESSES.length],
        points: Math.max(10_000 - i * 800, 10),
        handsPlayed: Math.max(500 - i * 40, 5),
    }));

const meta = {
    title: 'Leaderboard/LeaderboardTable',
    component: LeaderboardTable,
    tags: ['autodocs'],
    argTypes: {
        currentAddress: { control: 'text' },
        total: { control: { type: 'number', min: 1 } },
    },
    args: {
        data: makeEntries(10),
        currentAddress: CURRENT_ADDRESS,
        total: 200,
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Borderless row strips with blockie avatars, tier icons, left accent bars for top-3/current/rival, and translateX hover. No table headers.',
            },
        },
    },
} satisfies Meta<typeof LeaderboardTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TopThree: Story = {
    name: 'Top 3 Podium',
    args: { data: makeEntries(3), currentAddress: ADDRESSES[0], total: 200 },
};

export const CurrentPlayerFirst: Story = {
    name: 'Current Player #1',
    args: { currentAddress: ADDRESSES[0] },
};

export const CurrentPlayerLast: Story = {
    name: 'Current Player Last',
    args: { currentAddress: ADDRESSES[9 % ADDRESSES.length] },
};

export const NoCurrentUser: Story = {
    name: 'No Connected User',
    args: { currentAddress: undefined },
};

export const Empty: Story = {
    args: { data: [], currentAddress: undefined, total: 0 },
};

export const SmallLeaderboard: Story = {
    name: 'Small Leaderboard (5)',
    args: { data: makeEntries(5), currentAddress: ADDRESSES[2], total: 5 },
};

export const SinglePlayer: Story = {
    name: 'Single Player',
    args: {
        data: [{ rank: 1, address: ADDRESSES[0], points: 500, handsPlayed: 42 }],
        currentAddress: ADDRESSES[0],
        total: 1,
    },
};
