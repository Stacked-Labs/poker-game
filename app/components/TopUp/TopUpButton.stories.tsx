'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, DarkMode, VStack, Text } from '@chakra-ui/react';
import TopUpButton from './TopUpButton';

/**
 * Stories cover the button's surface — the BuyWidget itself is a third-party
 * iframe and is exercised in browser-based e2e (Stripe test cards on
 * Sepolia), not in Storybook. The stories below verify layout, theme, and
 * the Mini-App null-render path.
 */
const meta = {
    title: 'Components/TopUpButton',
    component: TopUpButton,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <Box p={6} bg="brand.darkNavy" minH="80px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof TopUpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PrefilledAmount: Story = {
    args: { amountUsdc: '12.50', label: 'Top up with card or crypto' },
};

export const CustomLabel: Story = {
    args: { label: 'Buy USDC' },
};

export const Dark: Story = {
    decorators: [
        (Story) => (
            <DarkMode>
                <Story />
            </DarkMode>
        ),
    ],
};

/**
 * Renders nothing — Mini-App context (Coinbase Wallet / Farcaster) hides
 * our onramp so we don't compete with the host wallet.
 *
 * To verify locally, set `window.__forceMiniApp = true` before render and
 * adjust useIsMiniApp accordingly. We don't auto-mock here because the
 * useIsMiniApp hook reads from @farcaster/miniapp-sdk and gracefully
 * returns false outside that context.
 */
export const MiniAppHidden: Story = {
    render: () => (
        <VStack spacing={2}>
            <Text fontSize="sm" color="white">
                In Mini App context, this button renders null.
            </Text>
            <TopUpButton label="(hidden in Mini App)" />
        </VStack>
    ),
};
