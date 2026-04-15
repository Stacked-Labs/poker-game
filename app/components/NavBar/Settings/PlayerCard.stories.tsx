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
            <div style={{ maxWidth: 520, padding: 16 }}>
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
                    'Player card used in the Settings panel player list. Shows a small avatar (X profile image when linked, initials fallback otherwise), username, buy-in, seat, and action buttons (accept/deny for pending, kick for accepted). X-verified players get a small 𝕏 badge overlaid on the avatar.',
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
    name: 'Pending — Not Owner',
    args: { isOwner: false },
};

// ── Accepted states ──────────────────────────────────────────────────────────

/** Accepted player — shows kick button for the owner. */
export const Accepted: Story = {
    args: { type: 'accepted' },
};

/** Accepted current user — no kick button (can't kick yourself). */
export const AcceptedSelf: Story = {
    name: 'Accepted — Self (no kick)',
    args: { type: 'accepted', isCurrentUser: true },
};

/** Kick in progress — shows loading spinner on the kick button. */
export const Kicking: Story = {
    name: 'Accepted — Kicking',
    args: { type: 'accepted', isKicking: true },
};

// ── X (Twitter) integration ──────────────────────────────────────────────────

/** X-verified pending player — avatar with 𝕏 badge overlay. */
export const XVerifiedPending: Story = {
    name: 'X Verified — Pending',
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

/** X-verified pending player without an avatar image — falls back to initials + 𝕏 badge. */
export const XVerifiedPendingNoAvatar: Story = {
    name: 'X Verified — Pending (no avatar)',
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000006',
            username: '@stackedPoker',
            seatId: 4,
            buyIn: 2500,
        },
    },
};

/** X-verified accepted player — avatar + 𝕏 badge + kick button. */
export const XVerifiedAccepted: Story = {
    name: 'X Verified — Accepted',
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

/** Crypto game — hides the "Seat #N" label, shows USDC formatted buy-in. */
export const CryptoMode: Story = {
    name: 'Crypto Mode — No Seat',
    decorators: [makeDecorator({ crypto: true })],
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000004',
            username: 'whale.eth',
            seatId: 2,
            buyIn: 250,
        },
    },
};

/** Crypto + X-verified — avatar with 𝕏 badge, no seat number, USDC format. */
export const CryptoXVerified: Story = {
    name: 'Crypto + X Verified',
    decorators: [makeDecorator({ crypto: true })],
    args: {
        player: {
            uuid: 'abc12345-6789-0000-0000-000000000005',
            username: '@cryptoKing',
            seatId: 7,
            buyIn: 1000,
            profileImageUrl:
                'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
        },
    },
};
