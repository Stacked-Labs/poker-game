'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LeaveButton from './LeaveButton';

const meta = {
    title: 'NavBar/LeaveButton',
    component: LeaveButton,
    tags: ['autodocs'],
    args: {
        isUserSeated: true,
        isLeaveRequested: false,
        settlementStuck: false,
        handleLeaveTable: () => {},
    },
    argTypes: {
        isLeaveRequested: { control: 'boolean' },
        settlementStuck: { control: 'boolean' },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Leave-table toggle button. Disabled when a stuck settlement is in progress.',
            },
        },
    },
    decorators: [
        (Story: React.FC) => (
            <div style={{ padding: 16 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof LeaveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — seated player, no leave request pending. */
export const Default: Story = {};

/** Leave already requested — button turns pink to allow cancellation. */
export const LeaveRequested: Story = {
    name: 'Leave requested',
    args: { isLeaveRequested: true },
};

/** Settlement is stuck — button is gray and non-interactive. */
export const SettlementStuck: Story = {
    name: 'Settlement stuck (disabled)',
    args: { settlementStuck: true },
};

/** Settlement stuck with leave already queued — still disabled. */
export const SettlementStuckLeaveQueued: Story = {
    name: 'Settlement stuck + leave queued (disabled)',
    args: { settlementStuck: true, isLeaveRequested: true },
};
