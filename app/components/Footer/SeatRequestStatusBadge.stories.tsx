'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from '@chakra-ui/react';
import SeatRequestStatusBadge from './SeatRequestStatusBadge';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { AppState, Game } from '@/app/interfaces';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const CLIENT_UUID = 'seat-request-uuid';

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
    config: { maxBuyIn: 10_000, bb: 20, sb: 10 },
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
    username: 'bob.eth',
    clientID: CLIENT_UUID,
    address: '0x1234567890ABCDEF1234567890ABCDEF12345678',
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
    isTableOwner: null,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
};

const mockSocket = {
    readyState: WebSocket.OPEN,
    send: () => {},
} as unknown as WebSocket;

// ─── Decorator helpers ─────────────────────────────────────────────────────────

type WrapperConfig = {
    appStateOverride?: Partial<AppState>;
    withSocket?: boolean;
    narrow?: boolean;
};

const makeDecorator = ({
    appStateOverride,
    withSocket = true,
    narrow = false,
}: WrapperConfig = {}) => {
    const appState: AppState = { ...baseAppState, ...appStateOverride };
    const Wrapper = (Story: React.FC) => (
        <AppContext.Provider value={{ appState, dispatch: () => null }}>
            <SocketContext.Provider value={withSocket ? mockSocket : null}>
                <Flex
                    bg="#0B1430"
                    borderRadius={12}
                    p="8px"
                    width={narrow ? 320 : '100%'}
                    maxWidth={700}
                    alignItems="center"
                    sx={{
                        '@media (orientation: portrait)': {
                            justifyContent: 'space-between',
                            gap: '1%',
                            padding: '1%',
                            height: '70px',
                        },
                        '@media (orientation: landscape)': {
                            justifyContent: 'flex-end',
                            gap: '0.8%',
                            height: '70px',
                        },
                    }}
                >
                    <Story />
                </Flex>
            </SocketContext.Provider>
        </AppContext.Provider>
    );
    Wrapper.displayName = 'SeatRequestStoryWrapper';
    return Wrapper;
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
    title: 'Footer/SeatRequestStatusBadge',
    component: SeatRequestStatusBadge,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [makeDecorator()],
} satisfies Meta<typeof SeatRequestStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ───────────────────────────────────────────────────────────────────

/**
 * Seat accepted, waiting to join next hand.
 * Green dashed pill with check icon, pulse glow, and shimmer on hover.
 */
export const JoiningNextHand: Story = {
    name: 'Joining Next Hand (accepted)',
    decorators: [
        makeDecorator({
            appStateOverride: {
                seatAccepted: {
                    seatId: 3,
                    buyIn: 5000,
                    queued: false,
                    message: 'Seat accepted',
                },
            },
        }),
    ],
};

/**
 * Seat accepted and queued — shows spinner alongside the status text.
 */
export const JoiningNextHandQueued: Story = {
    name: 'Joining Next Hand (queued + spinner)',
    decorators: [
        makeDecorator({
            appStateOverride: {
                seatAccepted: {
                    seatId: 5,
                    buyIn: 8000,
                    queued: true,
                    message: 'Queued for next hand',
                },
            },
        }),
    ],
};

/**
 * Seat requested but not yet accepted — cancel button in fold-colour ghost style.
 */
export const CancelRequest: Story = {
    name: 'Cancel Request (pending)',
    decorators: [
        makeDecorator({
            appStateOverride: {
                seatRequested: 4,
                isTableOwner: false,
            },
        }),
    ],
};

/**
 * Narrow/portrait wrapper for cancel request.
 */
export const CancelRequestPortrait: Story = {
    name: 'Cancel Request — portrait',
    decorators: [
        makeDecorator({
            appStateOverride: {
                seatRequested: 2,
                isTableOwner: false,
            },
            narrow: true,
        }),
    ],
};

/**
 * Narrow/portrait wrapper for joining next hand.
 */
export const JoiningNextHandPortrait: Story = {
    name: 'Joining Next Hand — portrait',
    decorators: [
        makeDecorator({
            appStateOverride: {
                seatAccepted: {
                    seatId: 1,
                    buyIn: 3000,
                    queued: true,
                    message: 'Queued',
                },
            },
            narrow: true,
        }),
    ],
};

/**
 * Nothing to show — no seat requested, no seat accepted.
 * Badge returns null; wrapper renders empty.
 */
export const Hidden: Story = {
    name: 'Hidden (no request/accepted)',
    decorators: [makeDecorator()],
};
