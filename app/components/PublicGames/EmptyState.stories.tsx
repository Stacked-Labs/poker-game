import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from './EmptyState';

const meta = {
    title: 'PublicGames/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
    parameters: {
        nextjs: { appDirectory: true },
    },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { variant: 'loading' } };
export const Error: Story = { args: { variant: 'error', onRetry: () => alert('Retrying...') } };
export const NoGames: Story = { args: { variant: 'empty' } };
