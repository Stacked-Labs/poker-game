'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PlayerCard from './PlayerCard';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import type { AppState, Game } from '@/app/interfaces';

const baseConfig = { maxBuyIn: 10_000, bb: 20, sb: 10 };

const baseGame: Game = {
    running: true,
    dealer: 0,
    action: 0,
    utg: 0,
    sb: 0,
    bb: 1,
    communityCards: [0, 0, 0, 0, 0],
    stage: 0,
    betting: false,
    config: baseConfig,
    players: [],
    pots: [],
    minRaise: 40,
    readyCount: 0,
    paused: false,
    actionDeadline: 0,
};

const baseAppState: AppState = {
    messages: [],
    logs: [],
    username: 'owner',
    clientID: 'owner-uuid',
    address: '0x000000000000000000000000000000000000000A',
    table: 'storybook-table',
    game: baseGame,
    volume: 0,
    chatSoundEnabled: false,
    chatOverlayEnabled: false,
    fourColorDeckEnabled: false,
    cardBackDesign: 'classic',
    unreadMessageCount: 0,
    isChatOpen: false,
    seatRequested: null,
    seatAccepted: null,
    pendingPlayers: [],
    showSeatRequestPopups: false,
    isSettingsOpen: false,
    blindObligation: null,
    isTableOwner: true,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
};

const cryptoAppState: AppState = {
    ...baseAppState,
    game: { ...baseGame, config: { ...baseConfig, crypto: true } } as Game,
    displayMode: 'usdc',
};

type DecoratorConfig = { crypto?: boolean };

const makeDecorator = ({ crypto }: DecoratorConfig = {}) => {
    const appState = crypto ? cryptoAppState : baseAppState;
    const Wrapper = (Story: React.FC) => (
        <AppContext.Provider value={{ appState, dispatch: () => null }}>
            <div style={{ maxWidth: 480, padding: 16 }}>
                <Story />
            </div>
        </AppContext.Provider>
    );
    Wrapper.displayName = 'PlayerCardStoryWrapper';
    return Wrapper;
};

const meta = {
    title: 'Settings/PlayerCard',
    component: PlayerCard,
    tags: ['autodocs'],
    decorators: [makeDecorator()],
    argTypes: {
        type: {
            control: { type: 'radio' },
            options: ['pending', 'accepted'],
        },
        isOwner: { control: 'boolean' },
        isCurrentUser: { control: 'boolean' },
        isKicking: { control: 'boolean' },
    },
    args: {
        index: 0,
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000001',
            username: 'Big Tony',
            seatId: 3,
            buyIn: 5000,
        },
        isOwner: true,
        isCurrentUser: false,
        type: 'pending',
        isKicking: false,
        handleAcceptPlayer: () => {},
        handleDenyPlayer: () => {},
        confirmKick: () => {},
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Player card for the Settings panel player list. Shows avatar (X profile image or initials fallback), username (clickable to X profile when linked), buy-in, address (linked to BaseScan in crypto mode), and action buttons. Current user gets a "You" badge and subtle green tint.',
            },
        },
    },
} satisfies Meta<typeof PlayerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Pending states ───────────────────────────────────────────────────────────

/** Pending player requesting a seat — shows accept/deny buttons for the owner. */
export const Pending: Story = {};

/** Pending player without owner privileges — no action buttons. */
export const PendingNotOwner: Story = {
    name: 'Pending — Not owner',
    args: { isOwner: false },
};

// ── Accepted states ──────────────────────────────────────────────────────────

/** Accepted player — shows kick button for the owner. */
export const Accepted: Story = {
    args: { type: 'accepted' },
};

/** Accepted current user — "You" badge, subtle green bg, no kick button. */
export const AcceptedSelf: Story = {
    name: 'Accepted — You (current user)',
    args: { type: 'accepted', isCurrentUser: true },
};

/** Kick in progress — shows loading spinner on the kick button. */
export const Kicking: Story = {
    name: 'Accepted — Kicking',
    args: { type: 'accepted', isKicking: true },
};

// ── X (Twitter) integration ──────────────────────────────────────────────────

/** X-verified pending player — avatar image, @username links to X profile. */
export const XVerifiedPending: Story = {
    name: 'X verified — Pending',
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000002',
            username: '@pokerShark',
            seatId: 5,
            buyIn: 5000,
            profileImageUrl:
                'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        },
    },
};

/** X-verified pending player without avatar image — initials fallback. */
export const XVerifiedPendingNoAvatar: Story = {
    name: 'X verified — Pending (no avatar)',
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000006',
            username: '@stackedPoker',
            seatId: 4,
            buyIn: 2500,
        },
    },
};

/** X-verified accepted player — avatar + kick button. */
export const XVerifiedAccepted: Story = {
    name: 'X verified — Accepted',
    args: {
        type: 'accepted',
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000003',
            username: '@highRoller',
            seatId: 1,
            buyIn: 10000,
            profileImageUrl:
                'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg',
        },
    },
};

// ── Crypto mode ──────────────────────────────────────────────────────────────

/** Crypto game — truncated address links to BaseScan, no seat label. */
export const CryptoMode: Story = {
    name: 'Crypto — Address linked',
    decorators: [makeDecorator({ crypto: true })],
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000004',
            username: 'whale.eth',
            seatId: 2,
            buyIn: 250,
            address: '0x1234567890abcdef1234567890abcdef12345678',
        },
    },
};

/** Crypto + X-verified — avatar, @username links to X, address links to BaseScan. */
export const CryptoXVerified: Story = {
    name: 'Crypto + X verified',
    decorators: [makeDecorator({ crypto: true })],
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000005',
            username: '@cryptoKing',
            seatId: 7,
            buyIn: 1000,
            profileImageUrl:
                'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
            address: '0xDeaDbeefdEAdbeeF00000000000000000000dEAD',
        },
    },
};

/** Crypto current user — green tint + "You" badge + address link. */
export const CryptoSelf: Story = {
    name: 'Crypto — You (current user)',
    decorators: [makeDecorator({ crypto: true })],
    args: {
        type: 'accepted',
        isCurrentUser: true,
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000007',
            username: '@myHandle',
            seatId: 1,
            buyIn: 500,
            profileImageUrl:
                'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
            address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        },
    },
};
