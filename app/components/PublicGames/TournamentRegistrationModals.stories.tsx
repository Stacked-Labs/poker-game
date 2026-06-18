'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThirdwebProvider } from 'thirdweb/react';
import { FundGuaranteeModal, CryptoUnregisterModal } from './TournamentsList';
import TournamentRegisterModal from '../Tournament/TournamentRegisterModal';
import { makeTournament } from '../Tournament/reminderStoryMocks';

// The tournament lobby / detail registration + host modals (issue #532). They
// portal to the viewport, so render fullscreen. The on-chain hooks they call
// resolve to an idle (no-wallet) state in the Storybook iframe — exactly the
// resting UI we review: the tactile buttons, the navy blurred overlay, the
// card.white surface, the password field with show/hide, and the USDC-branded
// amounts. Toggle the toolbar light/dark switch to review both modes.
const noop = () => {};

const cryptoTournament = makeTournament({
    name: 'The Stacked Opener',
    contract_address: '0xC710000000000000000000000000000000000C71',
    chain: 'base-sepolia',
    buy_in_usdc: 100_000, // $0.10
    guarantee_usdc: 5_000_000, // $5.00 GTD
});

const meta = {
    title: 'Tournament/Lobby/RegistrationModals',
    component: TournamentRegisterModal,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    decorators: [
        // The modals call thirdweb wallet hooks at render; in Storybook (no
        // connected wallet) they resolve to the idle state we want to review.
        (Story) => (
            <ThirdwebProvider>
                <Story />
            </ThirdwebProvider>
        ),
    ],
} satisfies Meta<typeof TournamentRegisterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RegisterPublic: Story = {
    name: 'Register · public (crypto)',
    render: () => (
        <TournamentRegisterModal
            tournament={{ ...cryptoTournament, is_private: false }}
            onClose={noop}
            onSuccess={noop}
        />
    ),
};

export const RegisterPrivate: Story = {
    name: 'Register · private (password)',
    render: () => (
        <TournamentRegisterModal
            tournament={{ ...cryptoTournament, is_private: true }}
            onClose={noop}
            onSuccess={noop}
        />
    ),
};

export const Reentry: Story = {
    name: 'Re-enter (crypto)',
    render: () => (
        <TournamentRegisterModal
            tournament={{ ...cryptoTournament, is_private: false }}
            isReentry
            onClose={noop}
            onSuccess={noop}
        />
    ),
};

export const FreePlay: Story = {
    name: 'Register · Free Play',
    render: () => (
        <TournamentRegisterModal
            tournament={makeTournament({
                name: 'Free Play Practice',
                buy_in_usdc: 0,
                is_private: false,
            })}
            onClose={noop}
            onSuccess={noop}
        />
    ),
};

export const FundGuarantee: Story = {
    name: 'Fund Guarantee (host)',
    render: () => (
        <FundGuaranteeModal
            tournament={cryptoTournament}
            onClose={noop}
            onSuccess={noop}
        />
    ),
};

export const Unregister: Story = {
    name: 'Unregister',
    render: () => (
        <CryptoUnregisterModal
            tournament={cryptoTournament}
            onClose={noop}
            onSuccess={noop}
        />
    ),
};
