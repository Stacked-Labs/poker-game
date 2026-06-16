'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, HStack, useColorMode } from '@chakra-ui/react';
import { FaCoins, FaCrown } from 'react-icons/fa';
import {
    WithdrawPromptModalView,
    type WithdrawPromptRow,
} from './WithdrawPromptModal';

const noop = () => {};

const chipRow: WithdrawPromptRow = {
    icon: FaCoins,
    iconColor: 'brand.yellow',
    label: 'Chip Balance',
    primaryValue: '$2.50',
    secondary: '250 chips',
    actionLabel: 'Withdraw',
    isLoading: false,
    onClick: noop,
    testId: 'prompt-withdraw-chips-btn',
};

const rakeRow: WithdrawPromptRow = {
    icon: FaCrown,
    iconColor: 'brand.yellow',
    label: 'Host Rewards',
    primaryValue: '$0.7500',
    actionLabel: 'Collect',
    isLoading: false,
    onClick: noop,
    testId: 'prompt-collect-rake-btn',
};

const ColorModeToggle = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <HStack position="fixed" top={4} left={4} zIndex={9999}>
            <Button size="xs" onClick={toggleColorMode}>
                {colorMode} → toggle
            </Button>
        </HStack>
    );
};

const meta = {
    title: 'Components/WithdrawPromptModal',
    component: WithdrawPromptModalView,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Auto-prompted on the table page when the user is NOT seated, the table is crypto, and they have a withdrawable on-chain balance (chips, host rewards, or both). Verify legibility in both color modes — the modal lives over the table felt.',
            },
        },
    },
    decorators: [
        (Story) => (
            <Box
                minH="100vh"
                width="100%"
                bgGradient="radial(circle at 50% 35%, #1a3a2e 0%, #0d1f17 80%)"
                position="relative"
                p={4}
            >
                <ColorModeToggle />
                <Story />
            </Box>
        ),
    ],
    args: {
        isOpen: true,
        onClose: noop,
        heading: 'You have funds to collect',
        rows: [chipRow, rakeRow],
    },
} satisfies Meta<typeof WithdrawPromptModalView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BothBalances: Story = {};

export const ChipsOnly: Story = {
    args: {
        heading: 'You have USDC to withdraw',
        rows: [chipRow],
    },
};

export const HostRewardsOnly: Story = {
    args: {
        heading: 'You have host rewards to collect',
        rows: [rakeRow],
    },
};

export const LargeBalance: Story = {
    args: {
        heading: 'You have funds to collect',
        rows: [
            {
                ...chipRow,
                primaryValue: '$1,234.56',
                secondary: '123,456 chips',
            },
            {
                ...rakeRow,
                primaryValue: '$87.1234',
            },
        ],
    },
};

export const WithdrawInFlight: Story = {
    args: {
        heading: 'You have funds to collect',
        rows: [
            { ...chipRow, isLoading: true },
            rakeRow,
        ],
    },
};

export const ChipSettling: Story = {
    args: {
        heading: 'Your USDC is settling on-chain',
        rows: [
            {
                ...chipRow,
                pending: true,
                pendingMessage: 'Settling on-chain…',
            },
        ],
    },
};

export const SettlingPlusHostRewards: Story = {
    args: {
        heading: 'You have funds to collect',
        rows: [
            {
                ...chipRow,
                pending: true,
                pendingMessage: 'Settling on-chain…',
            },
            rakeRow,
        ],
    },
};
