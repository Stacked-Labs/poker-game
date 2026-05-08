import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import StakeFilter from './StakeFilter';
import type { StakeFilter as StakeFilterValue } from './types';

const meta = {
    title: 'PublicGames/StakeFilter',
    component: StakeFilter,
    tags: ['autodocs'],
} satisfies Meta<typeof StakeFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSelected: Story = {
    args: { stake: 'all', onStakeChange: () => {} },
};

export const MicroSelected: Story = {
    args: { stake: 'micro', onStakeChange: () => {} },
};

export const MidSelected: Story = {
    args: { stake: 'mid', onStakeChange: () => {} },
};

export const HighSelected: Story = {
    args: { stake: 'high', onStakeChange: () => {} },
};

export const Disabled: Story = {
    name: 'Disabled (when market = Free)',
    args: { stake: 'all', onStakeChange: () => {}, disabled: true },
};

function InteractiveStakeFilter() {
    const [stake, setStake] = useState<StakeFilterValue>('all');
    return <StakeFilter stake={stake} onStakeChange={setStake} />;
}

export const Interactive: Story = {
    render: () => <InteractiveStakeFilter />,
};
