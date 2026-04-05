import type { Meta, StoryObj } from '@storybook/react';
import SeatIndicator from './SeatIndicator';

const meta = {
    title: 'PublicGames/SeatIndicator',
    component: SeatIndicator,
    tags: ['autodocs'],
    argTypes: {
        playerCount: { control: { type: 'range', min: 0, max: 9, step: 1 } },
        maxPlayers: { control: { type: 'range', min: 2, max: 9, step: 1 } },
    },
} satisfies Meta<typeof SeatIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { playerCount: 0, maxPlayers: 9 } };
export const HalfFull: Story = { args: { playerCount: 4, maxPlayers: 9 } };
export const NearlyFull: Story = { args: { playerCount: 8, maxPlayers: 9 } };
export const Full: Story = { args: { playerCount: 9, maxPlayers: 9 } };
export const SmallTable: Story = { args: { playerCount: 3, maxPlayers: 4 } };
