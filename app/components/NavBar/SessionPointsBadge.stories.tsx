'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SessionPointsBadge from './SessionPointsBadge';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

const initialState = usePointsAnimationStore.getState();

const meta = {
    title: 'NavBar/SessionPointsBadge',
    component: SessionPointsBadge,
    tags: ['autodocs'],
    beforeEach: () => {
        usePointsAnimationStore.setState(initialState, true);
    },
    decorators: [
        (Story: React.FC) => (
            <div
                style={{
                    background: '#060812',
                    padding: '32px 48px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 8,
                }}
            >
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Session points badge shown in the NavBar. Heat level changes color and glow: **cold** (<50 pts, green dim), **warm** (50–199, green glow), **hot** (200–499, yellow), **overcharge** (500+, purple pulse).',
            },
        },
    },
} satisfies Meta<typeof SessionPointsBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cold: Story = {
    name: 'Cold — 0 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 0 }, false);
    },
};

export const Warm: Story = {
    name: 'Warm — 75 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 75 }, false);
    },
};

export const Hot: Story = {
    name: 'Hot — 250 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 250 }, false);
    },
};

export const Overcharge: Story = {
    name: 'Overcharge — 600 pts',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 600 }, false);
    },
};

function InteractiveBadge() {
    const triggerPoints = usePointsAnimationStore((s) => s.triggerPoints);
    const sessionTotal = usePointsAnimationStore((s) => s.sessionTotal);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <SessionPointsBadge />
            <div style={{ display: 'flex', gap: 8 }}>
                {[10, 25, 100, 200].map((pts) => (
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
                        +{pts}
                    </button>
                ))}
                <button
                    onClick={() => usePointsAnimationStore.setState(initialState, true)}
                    style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        background: '#333',
                        color: '#aaa',
                        border: '1px solid #555',
                        cursor: 'pointer',
                        fontSize: 12,
                    }}
                >
                    reset
                </button>
            </div>
            <div style={{ color: '#666', fontSize: 11, fontFamily: 'monospace' }}>
                sessionTotal: {sessionTotal}
            </div>
        </div>
    );
}

export const Interactive: Story = {
    name: 'Interactive — trigger +pts',
    render: () => <InteractiveBadge />,
};
