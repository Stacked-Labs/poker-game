'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useColorModeValue } from '@chakra-ui/react';
import SessionPointsBadge from './SessionPointsBadge';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

const initialState = usePointsAnimationStore.getState();

function NavbarDecorator({ children }: { children: React.ReactNode }) {
    const navbarBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(46, 46, 54, 0.95)');
    return (
        <div
            style={{
                background: navbarBg,
                padding: '16px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 8,
            }}
        >
            {children}
        </div>
    );
}

const meta = {
    title: 'NavBar/SessionPointsBadge',
    component: SessionPointsBadge,
    tags: ['autodocs'],
    beforeEach: () => {
        usePointsAnimationStore.setState(initialState, true);
    },
    decorators: [
        (Story: React.FC) => (
            <NavbarDecorator>
                <Story />
            </NavbarDecorator>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Session points badge in the at-table NavBar. Hairline pill + diagonal stripe overlay; tilted inner chip with dashed edge ring. Chip shifts color by tier: green (<200) → gold (200–999) → pink (1K+). K-compact numerals. Per-hand: chip rocks tilt + scale ticks, ghost +X drifts up.',
            },
        },
    },
} satisfies Meta<typeof SessionPointsBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stack_Empty: Story = {
    name: 'Stack tier — 0 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 0 }, false);
    },
};

export const Stack_Mid: Story = {
    name: 'Stack tier — 150 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 150 }, false);
    },
};

export const Gold_Low: Story = {
    name: 'Gold tier — 250 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 250 }, false);
    },
};

export const Gold_High: Story = {
    name: 'Gold tier — 999 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 999 }, false);
    },
};

export const Overcharge_OneK: Story = {
    name: 'Overcharge — 1.5K',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 1500 }, false);
    },
};

export const Overcharge_BigK: Story = {
    name: 'Overcharge — 12.3K',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 12340 }, false);
    },
};

export const Overcharge_HugeK: Story = {
    name: 'Overcharge — 125K',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 125000 }, false);
    },
};

function InteractiveBadge() {
    const triggerPoints = usePointsAnimationStore((s) => s.triggerPoints);
    const sessionTotal = usePointsAnimationStore((s) => s.sessionTotal);
    const labelColor = useColorModeValue('#555', '#888');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <SessionPointsBadge />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5, 25, 100, 250, 1000, 5000].map((pts) => (
                    <button
                        key={pts}
                        onClick={() => triggerPoints(pts)}
                        style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            background: '#36A37B',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: 12,
                        }}
                    >
                        +{pts >= 1000 ? `${pts / 1000}K` : pts}
                    </button>
                ))}
                <button
                    onClick={() => usePointsAnimationStore.setState(initialState, true)}
                    style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        background: 'transparent',
                        color: labelColor,
                        border: '1px solid currentColor',
                        cursor: 'pointer',
                        fontSize: 12,
                    }}
                >
                    reset
                </button>
            </div>
            <div style={{ color: labelColor, fontSize: 11, fontFamily: 'monospace' }}>
                sessionTotal: {sessionTotal.toLocaleString()}
            </div>
        </div>
    );
}

export const Interactive: Story = {
    name: 'Interactive — trigger +pts',
    decorators: [(Story) => <Story />],
    render: () => <InteractiveBadge />,
};
