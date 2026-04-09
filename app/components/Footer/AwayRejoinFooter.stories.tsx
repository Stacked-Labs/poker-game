'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AwayRejoinFooter from './AwayRejoinFooter';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { AppState, Game, Player } from '@/app/interfaces';

// ─── Mock data ─────────────────────────────────────────────────────────────────

const CLIENT_UUID = 'self-uuid-away';

const awayPlayer: Player = {
    username: 'alice.eth',
    uuid: CLIENT_UUID,
    address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    position: 1,
    seatID: 4,
    ready: false,          // ← player is away
    in: false,
    called: false,
    left: false,
    totalBuyIn: 5_000,
    stack: 4_200,          // ← has chips (not busted out)
    bet: 0,
    totalBet: 0,
    cards: [0, 0],
    isOnline: true,
};

const baseGame: Game = {
    running: true,
    dealer: 2,
    action: 1,
    utg: 1,
    sb: 0,
    bb: 1,
    communityCards: [0, 0, 0, 0, 0],
    stage: 0,
    betting: false,
    config: { maxBuyIn: 10_000, bb: 20, sb: 10 },
    players: [awayPlayer],
    pots: [],
    minRaise: 40,
    readyCount: 2,
    paused: false,
    actionDeadline: 0,
};

const baseAppState: AppState = {
    messages: [],
    logs: [],
    username: 'alice.eth',
    clientID: CLIENT_UUID,
    address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
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
    playerOverride?: Partial<Player>;
    withSocket?: boolean;
};

const makeDecorator = ({ playerOverride, withSocket = true }: WrapperConfig = {}) => {
    const player: Player = { ...awayPlayer, ...playerOverride };
    const appState: AppState = {
        ...baseAppState,
        game: { ...baseGame, players: [player] },
    };
    const Wrapper = (Story: React.FC) => (
        <AppContext.Provider value={{ appState, dispatch: () => null }}>
            <SocketContext.Provider value={withSocket ? mockSocket : null}>
                <div
                    style={{
                        background: '#0B1430',
                        borderRadius: 12,
                        padding: '8px',
                        width: 380,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Story />
                </div>
            </SocketContext.Provider>
        </AppContext.Provider>
    );
    Wrapper.displayName = 'AwayRejoinStoryWrapper';
    return Wrapper;
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
    title: 'Footer/AwayRejoinFooter',
    component: AwayRejoinFooter,
    tags: ['autodocs'],
    decorators: [makeDecorator()],
} satisfies Meta<typeof AwayRejoinFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ───────────────────────────────────────────────────────────────────

/**
 * Default away state — player has chips but is marked not-ready.
 * Shows the green pulsing "I'm Back" CTA with shimmer hover effect.
 */
export const ImBack: Story = {
    name: "I'm Back (default away)",
    decorators: [makeDecorator()],
};

/**
 * Player already queued to rejoin next hand (readyNextHand=true).
 * Shows the spinner + "Rejoining next hand..." pill and a ghost "Cancel" button.
 */
export const RejoiningNextHand: Story = {
    name: 'Rejoining Next Hand (queued)',
    decorators: [makeDecorator({ playerOverride: { readyNextHand: true } })],
};

/**
 * No socket connection — buttons are rendered but click handlers receive null
 * for socket. Verify the UI still renders without crashing.
 */
export const NoSocket: Story = {
    name: "I'm Back — no socket",
    decorators: [makeDecorator({ withSocket: false })],
};

/**
 * Dark mode forced — ensures the green brand color and frosted glass
 * backgrounds read correctly on a dark table surface.
 */
export const DarkMode: Story = {
    name: "I'm Back — dark mode",
    decorators: [
        makeDecorator(),
        (Story) => (
            <div className="chakra-ui-dark">
                <Story />
            </div>
        ),
    ],
};
