'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { ThirdwebProvider } from 'thirdweb/react';
import { AuthContext } from '@/app/contexts/AuthContext';
import { AccountMenu, MobileAccountCard, IdentityHeader } from './AccountMenu';

const ADDR = '0x1A2b3C4d5E6f7890aBCdef1234567890DeAdBeEf';

const base = {
    isAuthenticated: true,
    isAuthenticating: false,
    userAddress: ADDR,
    sessionWallet: ADDR,
    lastAuthenticatedAddress: ADDR,
    walletMismatch: false,
    walletSessionStatus: 'authenticated',
    xStatusChecked: true,
    requestAuthentication: () => {},
    logout: async () => {},
    refreshAuthStatus: async () => {},
    refreshXStatus: async () => {},
};

// No X linked — address is the identity line (with a copy button).
const noX = { ...base, xUsername: null, xDisplayName: null, xProfileImageUrl: null };

// X linked — @handle links out to X, profile photo, address kept as subtext.
const linkedX = {
    ...base,
    xUsername: 'degenmike',
    xDisplayName: 'Degen Mike',
    xProfileImageUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23EB0B5C"/><text x="48" y="64" font-size="48" text-anchor="middle" fill="white" font-family="sans-serif">M</text></svg>',
};

const withAuth = (mock: unknown) => {
    const Decorator = (Story: React.FC) => (
        <ThirdwebProvider>
            <AuthContext.Provider value={mock as never}>
                <Box bg="bg.default" p={6} minH="460px">
                    <Story />
                </Box>
            </AuthContext.Provider>
        </ThirdwebProvider>
    );
    Decorator.displayName = 'WithAuth';
    return Decorator;
};

const meta = {
    title: 'NavRedesign/AccountMenu',
    parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const openRender = () => (
    <Box display="flex" justifyContent="flex-end">
        <AccountMenu defaultIsOpen />
    </Box>
);

export const OpenNoX: Story = {
    name: 'Dropdown — no X linked',
    decorators: [withAuth(noX)],
    render: openRender,
};

export const OpenLinkedX: Story = {
    name: 'Dropdown — X linked',
    decorators: [withAuth(linkedX)],
    render: openRender,
};

export const MobileLinkedX: Story = {
    name: 'Mobile card — X linked',
    decorators: [withAuth(linkedX)],
    render: () => (
        <Box maxW="340px">
            <MobileAccountCard />
        </Box>
    ),
};

export const MobileNoX: Story = {
    name: 'Mobile card — no X',
    decorators: [withAuth(noX)],
    render: () => (
        <Box maxW="340px">
            <MobileAccountCard />
        </Box>
    ),
};

// Storybook has no live wallet, so the real balance is null. These render the
// header with a fixed balance so the USDC coin mark + figure are visible.
const balancedC = (x: boolean) => ({
    address: ADDR,
    handle: x ? '@degenmike' : '0x1A2b…BeEf',
    secondary: x ? '0x1A2b…BeEf' : null,
    shortAddress: '0x1A2b…BeEf',
    xUsername: x ? 'degenmike' : null,
    profileHref: '#',
    avatarUrl: x ? linkedX.xProfileImageUrl : null,
    balanceLabel: '$6.43',
    chainName: 'Base',
    chainIsBase: true,
    openWallet: () => {},
    signOut: async () => {},
});

const headerCard = (x: boolean) => (
    <Box
        w="288px"
        bg="card.white"
        border="1px solid"
        borderColor="border.felt"
        borderRadius="16px"
        overflow="hidden"
    >
        <IdentityHeader c={balancedC(x) as never} bg="bg.pillNeutral" />
    </Box>
);

export const HeadersWithBalance: Story = {
    name: 'Header — USDC balance + copy + X link',
    decorators: [withAuth(noX)],
    render: () => (
        <Box display="flex" gap={6} flexWrap="wrap">
            {headerCard(false)}
            {headerCard(true)}
        </Box>
    ),
};
