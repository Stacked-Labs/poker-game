import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FilterBar from './FilterBar';
import type { FilterValue } from './types';

const meta = {
    title: 'PublicGames/FilterBar',
    component: FilterBar,
    tags: ['autodocs'],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSelected: Story = {
    args: { filter: 'all', onFilterChange: () => {} },
};

export const CryptoSelected: Story = {
    args: { filter: 'crypto', onFilterChange: () => {} },
};

export const FreeSelected: Story = {
    args: { filter: 'free', onFilterChange: () => {} },
};

function InteractiveFilterBar() {
    const [filter, setFilter] = useState<FilterValue>('all');
    return <FilterBar filter={filter} onFilterChange={setFilter} />;
}

export const Interactive: Story = {
    render: () => <InteractiveFilterBar />,
};
