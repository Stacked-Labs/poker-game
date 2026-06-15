'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import ReconnectingToast from './ReconnectingToast';

const meta = {
    title: 'Toasts/ReconnectingToast',
    component: ReconnectingToast,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        onClose: () => {},
        onReconnectNow: () => {},
    },
    decorators: [
        // Full-width like the other top banner toasts.
        (Story: React.FC) => (
            <Box bg="card.lightGray" minH="100vh">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof ReconnectingToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
