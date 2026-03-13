'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DepositSuccessToast from './DepositSuccessToast';

const meta = {
    title: 'Toasts/DepositSuccessToast',
    component: DepositSuccessToast,
    tags: ['autodocs'],
    argTypes: {
        amount: {
            control: { type: 'number', min: 0, step: 1 },
            description: 'Deposit amount in chips/credits',
            table: { defaultValue: { summary: '100' } },
        },
        onClose: {
            action: 'onClose',
            control: false,
            description: 'Called when the toast finishes its exit animation',
        },
        formatAmount: {
            control: false,
            description: 'Optional formatter — defaults to toLocaleString',
        },
    },
    args: {
        amount: 100,
        onClose: () => {},
    },
    decorators: [
        (Story: React.FC) => (
            // Toast is designed to sit at the top of the viewport — simulate that context
            <div style={{ width: '100%', maxWidth: 600 }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Full-width banner toast shown after a successful deposit. Features a glitch text effect ("Cr3d1ts 1nj3ct3d" → "Credits Injected"), animated counter, scan-line overlay, and auto-closes after the configured duration. Uses `brand.green` background.',
            },
        },
        layout: 'fullscreen',
    },
} satisfies Meta<typeof DepositSuccessToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Default — 100 chips',
    args: { amount: 100 },
};

export const SmallDeposit: Story = {
    name: 'Small — 1 chip',
    args: { amount: 1 },
};

export const LargeDeposit: Story = {
    name: 'Large — 10,000 chips',
    args: { amount: 10000 },
};

export const CustomFormat: Story = {
    name: 'Custom formatter — USDC',
    args: {
        amount: 50,
        formatAmount: (n: number) => `$${n.toFixed(2)} USDC`,
    },
};

function RemountableToast({ amount, formatAmount }: { amount: number; formatAmount?: (n: number) => string }) {
    const [key, setKey] = React.useState(0);
    const [visible, setVisible] = React.useState(true);

    const replay = () => {
        setVisible(false);
        setTimeout(() => {
            setKey((k) => k + 1);
            setVisible(true);
        }, 50);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {visible && (
                <DepositSuccessToast
                    key={key}
                    amount={amount}
                    formatAmount={formatAmount}
                    onClose={() => setVisible(false)}
                />
            )}
            <div style={{ padding: '0 16px' }}>
                <button
                    onClick={replay}
                    style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        background: '#36A37B',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                    }}
                >
                    ↺ Replay
                </button>
            </div>
        </div>
    );
}

/** Remountable version so you can replay the glitch + counter animation without refreshing */
export const Remountable: Story = {
    name: 'Remountable — replay animation',
    render: (args) => <RemountableToast amount={args.amount} formatAmount={args.formatAmount} />,
    args: { amount: 250 },
};
