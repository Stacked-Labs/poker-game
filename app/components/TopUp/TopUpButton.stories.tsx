'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    DarkMode,
    HStack,
    Icon,
    Text,
    VStack,
} from '@chakra-ui/react';
import { FaInfoCircle, FaPlus } from 'react-icons/fa';

/**
 * Presentational replica of `TopUpButton` for visual review.
 *
 * The real `TopUpButton` returns `null` when `isTestnetOnly` (the app is
 * configured for Base Sepolia only — Storybook's default) or when running
 * inside a Mini App host. Those hide-paths matter, but they leave nothing
 * to show in Storybook. This story renders a styled replica so layout,
 * theme, and copy are reviewable without needing a real wallet or mainnet
 * env. The actual BuyWidget surface is a third-party iframe and is
 * exercised end-to-end in browser testing (Stripe test cards on Sepolia
 * once mainnet is enabled).
 */
interface TopUpButtonStoryProps {
    label?: string;
    amountUsdc?: string;
    /** When true, render a "would render null" placeholder (mini app / testnet). */
    hidden?: boolean;
    hiddenReason?: 'mini-app' | 'testnet';
}

const TopUpButtonStory: React.FC<TopUpButtonStoryProps> = ({
    label = 'Top up',
    amountUsdc,
    hidden = false,
    hiddenReason = 'mini-app',
}) => {
    if (hidden) {
        return (
            <VStack
                spacing={2}
                p={3}
                bg="rgba(255,255,255,0.04)"
                border="1px dashed rgba(255,255,255,0.16)"
                borderRadius="md"
                maxW="320px"
            >
                <HStack spacing={2} color="whiteAlpha.700">
                    <Icon as={FaInfoCircle} boxSize={3.5} />
                    <Text fontSize="xs" fontWeight="semibold">
                        TopUpButton renders null here
                    </Text>
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
                    {hiddenReason === 'mini-app'
                        ? 'Inside a Mini App host (Coinbase Wallet / Farcaster), we hide our onramp so the host wallet can use its own.'
                        : 'thirdweb Bridge only works on mainnet, so we hide the button in testnet-only deployments.'}
                </Text>
            </VStack>
        );
    }

    return (
        <Button
            variant="solid"
            colorScheme="green"
            leftIcon={<Icon as={FaPlus} boxSize={3} />}
        >
            {label}
            {amountUsdc ? ` ${amountUsdc} USDC` : ''}
        </Button>
    );
};

const meta = {
    title: 'Components/TopUp/TopUpButton',
    component: TopUpButtonStory,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <Box p={6} bg="brand.darkNavy" minH="80px">
                <Story />
            </Box>
        ),
    ],
    argTypes: {
        label: {
            control: 'text',
            description: 'Button copy. Defaults to "Top up".',
        },
        amountUsdc: {
            control: 'text',
            description:
                'Optional pre-fill (USDC decimal string). The real button forwards this to BuyWidget as the suggested amount.',
        },
        hidden: {
            control: 'boolean',
            description:
                'When true, render the "hidden" placeholder — the real button returns null in these cases.',
        },
        hiddenReason: {
            control: { type: 'select' },
            options: ['mini-app', 'testnet'],
            description: 'Which null-render reason to illustrate.',
        },
    },
    args: {
        label: 'Top up',
        hidden: false,
        hiddenReason: 'mini-app',
    },
} satisfies Meta<typeof TopUpButtonStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default button — what users see post-connect on a mainnet build. */
export const Default: Story = {};

/** Pre-filled with the missing USDC amount, surfaced from `TakeSeatModal`. */
export const PrefilledAmount: Story = {
    args: {
        amountUsdc: '12.50',
        label: 'Top up with card or crypto',
    },
};

/** Custom label, useful for a "Buy USDC" entry in a wallet menu. */
export const CustomLabel: Story = {
    args: { label: 'Buy USDC' },
};

/** Dark mode variant. */
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
 * Hidden — Mini App host context. The real `TopUpButton` returns `null`
 * here so we don't nest an onramp inside the host's own.
 */
export const HiddenInMiniApp: Story = {
    args: { hidden: true, hiddenReason: 'mini-app' },
};

/**
 * Hidden — testnet-only deployment. thirdweb Bridge only routes mainnets;
 * the real button returns `null` to avoid an empty/broken widget.
 */
export const HiddenOnTestnet: Story = {
    args: { hidden: true, hiddenReason: 'testnet' },
};

/**
 * Playground — toggle every control to inspect every state.
 */
export const Playground: Story = {
    name: 'Playground — all controls',
    args: { label: 'Top up', amountUsdc: '25.00' },
};
