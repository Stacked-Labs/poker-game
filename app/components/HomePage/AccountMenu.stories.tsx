'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { ThirdwebProvider } from 'thirdweb/react';
import { AuthContext } from '@/app/contexts/AuthContext';
import { AccountMenu, MobileAccountCard } from './AccountMenu';

// Mock a signed-in session so the real thirdweb hooks (balance/details modal)
// run under ThirdwebProvider while identity comes from a stubbed AuthContext.
const mockAuth = {
    isAuthenticated: true,
    isAuthenticating: false,
    userAddress: '0x1A2b3C4d5E6f7890aBCdef1234567890DeAdBeEf',
    sessionWallet: '0x1A2b3C4d5E6f7890aBCdef1234567890DeAdBeEf',
    lastAuthenticatedAddress: '0x1A2b3C4d5E6f7890aBCdef1234567890DeAdBeEf',
    walletMismatch: false,
    walletSessionStatus: 'authenticated',
    xUsername: 'mikedawson',
    xDisplayName: 'Mike Dawson',
    xProfileImageUrl: null,
    xStatusChecked: true,
    requestAuthentication: () => {},
    logout: async () => {},
    refreshAuthStatus: async () => {},
    refreshXStatus: async () => {},
};

const meta = {
    title: 'NavRedesign/AccountMenu',
    decorators: [
        (Story) => (
            <ThirdwebProvider>
                <AuthContext.Provider value={mockAuth as never}>
                    <Box bg="bg.default" p={6} minH="440px">
                        <Story />
                    </Box>
                </AuthContext.Provider>
            </ThirdwebProvider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// The bar chip, closed (top-right aligned like the real nav).
export const Chip: Story = {
    name: 'Bar chip (closed)',
    render: () => (
        <Box display="flex" justifyContent="flex-end">
            <AccountMenu />
        </Box>
    ),
};

// The dropdown, forced open, so the Chakra Menu styling can be reviewed.
export const Open: Story = {
    name: 'Dropdown (open)',
    render: () => (
        <Box display="flex" justifyContent="flex-end">
            <AccountMenu defaultIsOpen />
        </Box>
    ),
};

export const Mobile: Story = {
    name: 'Mobile identity card',
    render: () => (
        <Box maxW="340px">
            <MobileAccountCard />
        </Box>
    ),
};
