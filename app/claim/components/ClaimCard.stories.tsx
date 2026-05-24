'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { ThirdwebProvider } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';
import type { SBTInfo } from '@/app/hooks/server_actions';
import ClaimCard from './ClaimCard';

const mockAccount = { address: '0xFA04e1d9C8b3F1b0b8E01A25C9d4568b0C2c445b' } as unknown as Account;

const mockSBTInfo: SBTInfo = {
    contractAddress: '0x0000000000000000000000000000000000000000',
    chainName: 'Base',
    explorerURL: 'https://basescan.org/address/0x0000000000000000000000000000000000000000',
    tokenURI: '',
    name: 'Stacked Poker Badge',
    image: '/previews/home_preview.png',
    description: 'Soulbound community badge.',
};

const meta = {
    title: 'Claim / ClaimCard',
    component: ClaimCard,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Two-up dedication-letter layout for `/claim`. Hero + narrative stay stable; only the action panel swaps between Connect / Eligible / Claiming / Claimed / Just-claimed / Not-eligible. Mobile collapses to single column. Toggle the Storybook color-mode addon to verify both light and dark.',
            },
        },
    },
    decorators: [
        (Story) => (
            <ThirdwebProvider>
                <Box bg="bg.default" minH="100vh" p={{ base: 4, md: 10 }}>
                    <Box maxW="1100px" mx="auto">
                        <Story />
                    </Box>
                </Box>
            </ThirdwebProvider>
        ),
    ],
    args: {
        sbtInfo: mockSBTInfo,
        claiming: false,
        justClaimed: false,
        onClaim: () => {},
    },
} satisfies Meta<typeof ClaimCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No wallet connected — right column shows connect prompt + WalletButton. */
export const NoWallet: Story = {
    args: {
        account: undefined,
        eligibility: null,
    },
};

/** Wallet connected, eligibility still resolving — small spinner in the action slot. */
export const Loading: Story = {
    args: {
        account: mockAccount,
        eligibility: null,
    },
};

/** Wallet is on the whitelist and hasn't claimed — primary Claim button. */
export const Eligible: Story = {
    args: {
        account: mockAccount,
        eligibility: { eligible: true, claimed: false },
    },
};

/** Mid-transaction — button shows the loading state. */
export const Claiming: Story = {
    args: {
        account: mockAccount,
        eligibility: { eligible: true, claimed: false },
        claiming: true,
    },
};

/** Wallet already holds the badge (return visit) — confirmation + view-on-chain. */
export const Claimed: Story = {
    args: {
        account: mockAccount,
        eligibility: { eligible: true, claimed: true },
    },
};

/** Just claimed this session — adds the "Verify quest & earn points" CTA. */
export const JustClaimed: Story = {
    args: {
        account: mockAccount,
        eligibility: { eligible: true, claimed: true },
        justClaimed: true,
    },
};

/** Wallet not on the list — quiet inline note + leaderboard link. */
export const NotEligible: Story = {
    args: {
        account: mockAccount,
        eligibility: { eligible: false, claimed: false },
    },
};
