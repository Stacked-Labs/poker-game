'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useColorModeValue } from '@chakra-ui/react';
import SessionPointsBadge from './SessionPointsBadge';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

const initialState = usePointsAnimationStore.getState();

// Mirrors the real NavBar bg so the badge is previewed in context
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
                    'Session points badge shown in the NavBar. Heat level changes color and glow: **cold** (<50 pts, green dim), **warm** (50–199, green glow), **hot** (200–499, yellow), **overcharge** (500+, pink pulse).',
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
    const labelColor = useColorModeValue('#555', '#888');
    return (
        <NavbarDecorator>
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
                    sessionTotal: {sessionTotal}
                </div>
            </div>
        </NavbarDecorator>
    );
}

export const Interactive: Story = {
    name: 'Interactive — trigger +pts',
    render: () => <InteractiveBadge />,
};
