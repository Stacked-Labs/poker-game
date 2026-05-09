'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text, VStack } from '@chakra-ui/react';
import ExternalLink from './ExternalLink';

const meta = {
    title: 'Components / ExternalLink',
    component: ExternalLink,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Standardized external linkout: quiet at rest (`brand.navy` light / `brand.lightGray` dark), `brand.green` underline on hover, with a trailing FiExternalLink hint icon that brightens on hover. Use anywhere we point to off-app destinations (Basescan, X profiles, social, docs).',
            },
        },
    },
    argTypes: {
        href: { control: 'text' },
        iconSize: {
            control: 'text',
            description: 'CSS size string passed to the trailing icon.',
        },
        children: { control: 'text' },
    },
    args: {
        href: 'https://basescan.org/address/0xFA04e1d9C8b3F1b0b8E01A25C9d4568b0C2c445b',
        children: 'View on Basescan',
    },
    decorators: [
        (Story) => (
            <Box p={6} maxW="420px">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — text + trailing icon. Hover to see the green underline + icon brighten. */
export const Default: Story = {};

/** Larger trailing icon — useful inside hero copy or lists with bigger typography. */
export const LargerIcon: Story = {
    name: 'Larger icon',
    args: { iconSize: '14px' },
};

/** Tiny icon — pairs with `2xs` text inside compact chips (e.g. truncated address pills). */
export const CompactIcon: Story = {
    name: 'Compact icon (2xs context)',
    args: {
        iconSize: '9px',
        children: '0xFA04...445b',
        bg: 'card.lightGray',
        px: 2,
        py: 0.5,
        borderRadius: '6px',
        fontSize: '2xs',
        fontWeight: 'medium',
    },
};

/** Inline inside body copy — verifies baseline alignment in a paragraph. */
export const InlineInText: Story = {
    name: 'Inline in paragraph',
    render: (args) => (
        <Text fontSize="sm" color="text.secondary" lineHeight="tall">
            Chips are held by the table contract and returned as USDC on withdrawal.{' '}
            <ExternalLink {...args} fontWeight="semibold">
                View contract
            </ExternalLink>{' '}
            for the full ledger.
        </Text>
    ),
};

/** Stack of three to compare resting / hover / focus tones in both color modes. */
export const Variants: Story = {
    name: 'Variants stack',
    render: (args) => (
        <VStack align="start" spacing={3}>
            <ExternalLink {...args}>View on Basescan</ExternalLink>
            <ExternalLink href="https://x.com/stacked_poker">@stacked_poker</ExternalLink>
            <ExternalLink href="https://t.me/stacked" iconSize="13px" fontWeight="semibold">
                Join the Telegram
            </ExternalLink>
        </VStack>
    ),
};
