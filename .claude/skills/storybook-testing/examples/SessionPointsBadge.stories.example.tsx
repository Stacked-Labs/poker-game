/**
 * EXAMPLE — not a real story file.
 * Shows a complete, well-structured story for a store-driven component.
 * Copy this pattern when writing stories for SessionPointsBadge or similar.
 */
import type { Meta, StoryObj } from '@storybook/react';
import SessionPointsBadge from '@/app/components/NavBar/SessionPointsBadge';
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
            <div style={{ background: '#060812', padding: '32px', display: 'inline-flex' }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Session points badge shown in the NavBar. Color and glow change based on heat level: cold (<50), warm (50–199), hot (200–499), overcharge (500+).',
            },
        },
    },
} satisfies Meta<typeof SessionPointsBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cold: Story = {
    name: 'Cold (0 pts)',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 0 }, false);
    },
};

export const Warm: Story = {
    name: 'Warm (75 pts)',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 75 }, false);
    },
};

export const Hot: Story = {
    name: 'Hot (250 pts)',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 250 }, false);
    },
};

export const Overcharge: Story = {
    name: 'Overcharge (600 pts)',
    beforeEach: () => {
        usePointsAnimationStore.setState({ sessionTotal: 600 }, false);
    },
};

export const WithDeltaAnimation: Story = {
    name: 'Interactive — trigger delta',
    render: () => {
        const triggerPoints = usePointsAnimationStore((s) => s.triggerPoints);
        return (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <SessionPointsBadge />
                <button
                    onClick={() => triggerPoints(25)}
                    style={{ padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}
                >
                    +25 pts
                </button>
                <button
                    onClick={() => triggerPoints(100)}
                    style={{ padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}
                >
                    +100 pts
                </button>
            </div>
        );
    },
};
