'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button } from '@chakra-ui/react';
import { ThirdwebProvider } from 'thirdweb/react';
import { PlayerCardView } from './PlayerCard';

// PlayerCard normally pulls auth, wallet, and X-link state from
// hooks. PlayerCardView is the presentational shell — these stories
// pass mock props directly so we can review every state without
// signing in or linking an X account.

const MOCK_ADDRESS = '0xFA04e1d9C8b3F1b0b8E01A25C9d4568b0C2c445b';
const MOCK_X_USERNAME = 'pokerShark';
const MOCK_X_PROFILE_IMAGE =
    'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg';

const STUB_SIGN_IN_BUTTON = (
    <Button variant="tactilePrimary" height="48px" width="200px">
        Sign In
    </Button>
);

function StagedSurface({ children }: { children: React.ReactNode }) {
    return (
        <Box bg="bg.default" minH="100vh" p={{ base: 4, md: 8 }}>
            <Box maxW="400px">{children}</Box>
        </Box>
    );
}

const meta = {
    title: 'Leaderboard/PlayerCard',
    component: PlayerCardView,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    "Every authentication phase of the leaderboard PlayerCard, rendered with mock props through the presentational `PlayerCardView`. Covers disconnected, wallet-connected-not-signed, signed-in (no X), and signed-in (with X).",
            },
        },
    },
    decorators: [
        (Story) => (
            <ThirdwebProvider>
                <StagedSurface>
                    <Story />
                </StagedSurface>
            </ThirdwebProvider>
        ),
    ],
    argTypes: {
        rank: { control: { type: 'number', min: 1, max: 500 } },
        points: { control: { type: 'number', min: 0, step: 10 } },
        pointsToNext: { control: { type: 'number', min: 0, step: 10 } },
        nextRank: { control: { type: 'number', min: 1 } },
        total: { control: { type: 'number', min: 1 } },
    },
} satisfies Meta<typeof PlayerCardView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Unauthed states ────────────────────────────────────────────────

export const Disconnected: Story = {
    name: 'Unauthed — disconnected',
    args: {
        authState: 'disconnected',
        signInButton: STUB_SIGN_IN_BUTTON,
    },
};

export const ConnectedNotAuthed: Story = {
    name: 'Unauthed — wallet connected, awaiting signature',
    args: {
        authState: 'connected-not-authed',
        address: MOCK_ADDRESS,
        isAuthenticating: false,
    },
};

export const ConnectedNotAuthed_Loading: Story = {
    name: 'Unauthed — signature in flight',
    args: {
        authState: 'connected-not-authed',
        address: MOCK_ADDRESS,
        isAuthenticating: true,
    },
};

// ── Authed (no X linked) ───────────────────────────────────────────

const baseAuthedNoX = {
    authState: 'authed' as const,
    address: MOCK_ADDRESS,
    xUsername: null,
    xProfileImageUrl: null,
    rank: 6,
    points: 340,
    total: 200,
    pointsToNext: 50,
    nextRank: 5,
    nextPoints: 390,
    stats: { gamesCreated: 19, gamesPlayed: 11, handsPlayed: 67 },
    referralInfo: {
        count: 3,
        multiplier: 1.0,
        nextTier: { required: 5, multiplier: 1.1 },
    },
};

export const AuthedNoX: Story = {
    name: 'Authed — no X linked',
    args: baseAuthedNoX,
};

export const AuthedNoX_Linking: Story = {
    name: 'Authed — no X, link request pending',
    args: { ...baseAuthedNoX, isConnectingX: true },
};


// ── Authed (X linked) ──────────────────────────────────────────────

const baseAuthedWithX = {
    authState: 'authed' as const,
    address: MOCK_ADDRESS,
    xUsername: MOCK_X_USERNAME,
    xProfileImageUrl: MOCK_X_PROFILE_IMAGE,
    rank: 3,
    points: 5400,
    total: 200,
    pointsToNext: 300,
    nextRank: 2,
    nextPoints: 5700,
    stats: { gamesCreated: 30, gamesPlayed: 89, handsPlayed: 620 },
    referralInfo: {
        count: 5,
        multiplier: 1.25,
        nextTier: { required: 10, multiplier: 1.5 },
    },
};

export const AuthedWithX: Story = {
    name: 'Authed — X linked',
    args: baseAuthedWithX,
};

export const AuthedWithX_Rank1: Story = {
    name: 'Authed — rank #1 (king of the hill)',
    args: {
        ...baseAuthedWithX,
        rank: 1,
        points: 9200,
        pointsToNext: 0,
        nextRank: undefined,
        nextPoints: undefined,
        stats: { gamesCreated: 42, gamesPlayed: 156, handsPlayed: 1840 },
        referralInfo: {
            count: 25,
            multiplier: 1.5,
            nextTier: null,
        },
    },
};

export const AuthedWithX_NearMiss: Story = {
    name: 'Authed — near miss (within 10% of next rank)',
    args: {
        ...baseAuthedWithX,
        rank: 15,
        points: 1800,
        pointsToNext: 15,
        nextRank: 14,
        nextPoints: 1815,
    },
};

export const AuthedWithX_RankImproved: Story = {
    name: 'Authed — rank just improved',
    args: {
        ...baseAuthedWithX,
        improved: true,
        previousRank: 7,
    },
};


export const AuthedNewPlayer: Story = {
    name: 'Authed — brand new player',
    args: {
        authState: 'authed',
        address: MOCK_ADDRESS,
        rank: 185,
        points: 10,
        total: 200,
        pointsToNext: 40,
        nextRank: 184,
        nextPoints: 50,
        stats: { gamesCreated: 0, gamesPlayed: 1, handsPlayed: 3 },
        referralInfo: {
            count: 0,
            multiplier: 1.0,
            nextTier: { required: 5, multiplier: 1.1 },
        },
    },
};
