'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import FloatingPointsText from './FloatingPointsText';
import { usePointsAnimationStore } from '@/app/stores/pointsAnimation';

const initialState = usePointsAnimationStore.getState();

const meta = {
    title: 'Animations/FloatingPointsText',
    component: FloatingPointsText,
    tags: ['autodocs'],
    beforeEach: () => {
        usePointsAnimationStore.setState(initialState, true);
    },
    decorators: [
        (Story: React.FC) => (
            // Needs a positioned parent — the animation uses position: absolute
            <div
                style={{
                    position: 'relative',
                    background: '#0d1117',
                    width: 200,
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    border: '1px solid #1e2a3a',
                }}
            >
                <Story />
                <span style={{ color: '#444', fontSize: 12 }}>← animation appears above here</span>
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Floating "+N pts" text that rises and fades over 2.2s. Rendered with `position: absolute` so it must be inside a relatively-positioned parent. Triggered via `usePointsAnimationStore.triggerPoints(n)`. Respects `prefers-reduced-motion`.',
            },
        },
    },
} satisfies Meta<typeof FloatingPointsText>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveFloat() {
    const triggerPoints = usePointsAnimationStore((s) => s.triggerPoints);
    return (
        <div
            style={{
                position: 'relative',
                background: '#0d1117',
                width: 220,
                height: 140,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                borderRadius: 12,
                border: '1px solid #1e2a3a',
            }}
        >
            <FloatingPointsText />
            <div style={{ color: '#555', fontSize: 11 }}>animation origin</div>
            <div style={{ display: 'flex', gap: 8 }}>
                {[5, 25, 100].map((pts) => (
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
            </div>
        </div>
    );
}

function AutoPlayFloat() {
    const triggerPoints = usePointsAnimationStore((s) => s.triggerPoints);
    React.useEffect(() => {
        triggerPoints(50);
    }, [triggerPoints]);
    return (
        <div
            style={{
                position: 'relative',
                background: '#0d1117',
                width: 220,
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                border: '1px solid #1e2a3a',
            }}
        >
            <FloatingPointsText />
        </div>
    );
}

/** Click the button to trigger the animation. It self-clears after ~2.2s. */
export const Interactive: Story = {
    name: 'Interactive — fire animation',
    render: () => <InteractiveFloat />,
};

/** Fires immediately on mount so the reviewer sees the animation without clicking. */
export const AutoPlay: Story = {
    name: 'Auto-play on mount',
    render: () => <AutoPlayFloat />,
};
