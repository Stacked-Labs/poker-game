import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import TournamentResultCard from './TournamentResultCard';

const soon = (mins: number) =>
    new Date(Date.now() + mins * 60_000).toISOString();

const meta = {
    title: 'Tournament/InTable/TournamentResultCard',
    component: TournamentResultCard,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <Box bg="card.lightGray" p={8} minH="100vh">
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof TournamentResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BustWithReentry: Story = {
    args: {
        kind: 'bust',
        position: 47,
        fieldSize: 120,
        prizeUsdc: 0,
        placesPaid: 18,
        isFreePlay: false,
        tournamentName: 'Nightly $50 GTD',
        tournamentId: 42,
        reentry: { buyInUsdc: 50_000_000, closesAtIso: soon(6), bulletsLeft: 1 },
    },
};

export const BustNoReentry: Story = {
    args: {
        kind: 'bust',
        position: 31,
        fieldSize: 120,
        prizeUsdc: 0,
        placesPaid: 18,
        isFreePlay: false,
        tournamentName: 'Nightly $50 GTD',
        tournamentId: 42,
    },
};

export const BustCashed: Story = {
    args: {
        kind: 'bust',
        position: 12,
        fieldSize: 120,
        prizeUsdc: 58_400_000,
        placesPaid: 18,
        isFreePlay: false,
        tournamentName: 'Nightly $50 GTD',
        tournamentId: 42,
    },
};

export const Win: Story = {
    args: {
        kind: 'win',
        position: 1,
        fieldSize: 120,
        prizeUsdc: 1_752_000_000,
        placesPaid: 18,
        isFreePlay: false,
        tournamentName: 'Nightly $50 GTD',
        tournamentId: 42,
        settlementTxUrl: 'https://basescan.org/tx/0xabc',
    },
};

export const WinBigPrize: Story = {
    args: {
        kind: 'win',
        position: 1,
        fieldSize: 2400,
        prizeUsdc: 128_450_000_000,
        placesPaid: 360,
        isFreePlay: false,
        tournamentName: 'Sunday Major',
        tournamentId: 42,
        settlementTxUrl: 'https://basescan.org/tx/0xabc',
    },
};

export const WinSettling: Story = {
    args: {
        kind: 'win',
        position: 1,
        fieldSize: 120,
        prizeUsdc: 1_752_000_000,
        placesPaid: 18,
        isFreePlay: false,
        tournamentName: 'Nightly $50 GTD',
        tournamentId: 42,
        settlementTxUrl: null,
    },
};

export const FreePlayBust: Story = {
    args: {
        kind: 'bust',
        position: 22,
        fieldSize: 80,
        prizeUsdc: 0,
        placesPaid: 18,
        isFreePlay: true,
        tournamentName: 'Free Play Warmup',
        tournamentId: 42,
        reentry: { buyInUsdc: 0, closesAtIso: soon(4), bulletsLeft: 2 },
    },
};

export const FreePlayWin: Story = {
    args: {
        kind: 'win',
        position: 1,
        fieldSize: 80,
        prizeUsdc: 0,
        placesPaid: 18,
        isFreePlay: true,
        tournamentName: 'Free Play Warmup',
        tournamentId: 42,
    },
};
