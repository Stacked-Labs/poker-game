import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import StructureSheet from './StructureSheet';

const meta = {
    title: 'Tournament/Detail/StructureSheet',
    component: StructureSheet,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={{ base: 4, md: 8 }} maxW="640px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof StructureSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TurboRunning: Story = {
    args: {
        blindStructure: 'turbo',
        startingStack: 10_000,
        lateRegLevels: 3,
        currentLevel: 7,
    },
};

export const DeepRegistration: Story = {
    args: {
        blindStructure: 'deep',
        startingStack: 30_000,
        lateRegLevels: 2,
        currentLevel: null,
    },
};

export const Hyper: Story = {
    args: {
        blindStructure: 'hyper',
        startingStack: 10_000,
        lateRegLevels: 3,
        currentLevel: 4,
    },
};

export const Collapsed: Story = {
    args: {
        blindStructure: 'regular',
        startingStack: 20_000,
        lateRegLevels: 3,
        currentLevel: null,
        defaultOpen: false,
    },
};
