'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ToastBanner from './ToastBanner';

const meta = {
    title: 'Toasts/ToastBanner',
    component: ToastBanner,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['success', 'error', 'warning', 'info'],
        },
        title: { control: 'text' },
        description: { control: 'text' },
        autoCloseMs: { control: { type: 'number', min: 0 } },
        onClose: { action: 'onClose', control: false },
    },
    args: {
        variant: 'error',
        title: 'Something went wrong',
        description: undefined,
        autoCloseMs: 0, // disabled in stories so it stays visible
        onClose: () => {},
    },
    decorators: [
        (Story: React.FC) => (
            <div style={{ width: '100%' }}>
                <Story />
            </div>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ToastBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorShort: Story = {
    name: 'Error — short message',
    args: {
        variant: 'error',
        title: 'Something went wrong',
    },
};

export const ErrorLong: Story = {
    name: 'Error — long message (mobile truncation test)',
    args: {
        variant: 'error',
        title: 'Unable to join table: the game has already started and no seats are available',
        description: 'Please try another table or wait for the next hand to begin',
    },
};

export const SuccessWithDescription: Story = {
    name: 'Success — with description',
    args: {
        variant: 'success',
        title: 'Deposit successful',
        description: '100 chips have been added to your balance',
    },
};

export const Warning: Story = {
    name: 'Warning',
    args: {
        variant: 'warning',
        title: 'Connection unstable',
        description: 'You may experience delays',
    },
};

export const Info: Story = {
    name: 'Info',
    args: {
        variant: 'info',
        title: 'New hand starting',
    },
};

/** Resize the Storybook canvas to a phone width (~390px) to see the mobile layout */
export const MobileSimulation: Story = {
    name: 'Mobile — long error (resize canvas to ~390px)',
    args: {
        variant: 'error',
        title: 'Transaction failed: insufficient balance to cover the big blind',
        description: 'Deposit more chips to continue playing at this table',
    },
    decorators: [
        (Story: React.FC) => (
            <div style={{ width: 390, margin: '0 auto' }}>
                <Story />
            </div>
        ),
    ],
};
