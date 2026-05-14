'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import TransactionHistoryList from './TransactionHistoryList';
import type { OnchainEventRow } from '@/app/hooks/useOnchainTableEvents';

const sampleEvents: OnchainEventRow[] = [
    {
        eventName: 'PlayerDeposited',
        txHash: '0xabc1230000000000000000000000000000000000000000000000000000000001',
        blockNumber: BigInt(12_345_678),
        logIndex: 1,
        args: {
            player: '0xFA04000000000000000000000000000000000445',
            usdcAmount: BigInt(50_000_000), // $50
            chipAmount: BigInt(50_000),
        },
    },
    {
        eventName: 'ChipsSettled',
        txHash: '0xabc1230000000000000000000000000000000000000000000000000000000002',
        blockNumber: BigInt(12_345_650),
        logIndex: 0,
        args: {
            handId: BigInt(42),
            players: ['0xFA04…', '0xBB22…'],
            newChips: [BigInt(60_000), BigInt(40_000)],
            rakeCollected: BigInt(150_000),
        },
    },
    {
        eventName: 'PlayerWithdrew',
        txHash: '0xabc1230000000000000000000000000000000000000000000000000000000003',
        blockNumber: BigInt(12_345_600),
        logIndex: 0,
        args: {
            player: '0xBB22000000000000000000000000000000000022',
            chipAmount: BigInt(40_000),
            usdcAmount: BigInt(40_000_000),
        },
    },
];

const meta = {
    title: 'Components / OnchainTab / TransactionHistoryList',
    component: TransactionHistoryList,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="bg.default" minH="100vh" p={6} maxW="640px" mx="auto">
                <Story />
            </Box>
        ),
    ],
    args: {
        events: sampleEvents,
        loading: false,
        initialLoading: false,
        error: null,
        hasMore: false,
        scanLimitReached: true,
        contractExplorerUrl:
            'https://sepolia.basescan.org/address/0xa6020000000000000000000000000000000000ad',
        onLoadMore: () => {},
        explorerForTx: (hash: string) =>
            `https://sepolia.basescan.org/tx/${hash}`,
    },
} satisfies Meta<typeof TransactionHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — scan floor hit, explorer footer visible. */
export const ScanLimitReached: Story = {};

/** Floor not yet hit — "Load older" button renders instead of footer. */
export const LoadOlderAvailable: Story = {
    args: { hasMore: true, scanLimitReached: false },
};

/** Spinner state before any events come back. */
export const InitialLoading: Story = {
    args: { events: [], initialLoading: true, hasMore: true, scanLimitReached: false },
};

/** Empty table — no activity yet. */
export const Empty: Story = {
    args: { events: [], hasMore: false, scanLimitReached: false },
};

/** RPC error surfaced into the panel (e.g. 429 after retry). */
export const ErrorState: Story = {
    args: {
        events: [],
        error: 'RPC request failed with status 429',
        hasMore: false,
        scanLimitReached: false,
    },
};
