import type { Meta, StoryObj } from '@storybook/react';
import PublicGamesHero from './PublicGamesHero';

const meta = {
    title: 'PublicGames/PublicGamesHero',
    component: PublicGamesHero,
    tags: ['autodocs'],
    parameters: {
        nextjs: { appDirectory: true },
    },
} satisfies Meta<typeof PublicGamesHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
