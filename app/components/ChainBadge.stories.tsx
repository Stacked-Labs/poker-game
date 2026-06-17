import type { Meta, StoryObj } from '@storybook/react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import ChainBadge from './ChainBadge';

const meta = {
    title: 'Components/ChainBadge',
    component: ChainBadge,
    tags: ['autodocs'],
    parameters: { nextjs: { appDirectory: true } },
    decorators: [
        (Story) => (
            <Box
                bg="card.white"
                p={6}
                borderRadius="14px"
                boxShadow="card.lift"
            >
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof ChainBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base mainnet, official lockup (square + "Base" in Base Sans).
export const BaseMainnet: Story = {
    args: { chain: 'base' },
};

// Base Sepolia, lockup + testnet tag.
export const BaseSepolia: Story = {
    args: { chain: 'base-sepolia' },
};

// Square symbol only, for compact spots.
export const SymbolOnly: Story = {
    args: { chain: 'base', variant: 'symbol' },
};

export const Sizes: Story = {
    render: () => (
        <VStack align="start" spacing={4}>
            <ChainBadge chain="base" size="sm" />
            <ChainBadge chain="base" size="md" />
            <ChainBadge chain="base-sepolia" size="md" />
        </VStack>
    ),
};

// A non-Base chain falls back to logo + plain label.
export const OtherChain: Story = {
    args: { chain: 'arbitrum' },
};

export const AllVariants: Story = {
    render: () => (
        <HStack spacing={6} flexWrap="wrap">
            <ChainBadge chain="base" />
            <ChainBadge chain="base-sepolia" />
            <ChainBadge chain="base" variant="symbol" />
        </HStack>
    ),
};
