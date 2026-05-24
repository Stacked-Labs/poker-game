'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Flex } from '@chakra-ui/react';
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
    ready: false,
    in: false,
    called: false,
    left: false,
    totalBuyIn: 5_000,
    stack: 4_200,
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
    cardBackDesign: 'classic-blue',
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
    narrow?: boolean;
};

const makeDecorator = ({
    playerOverride,
    withSocket = true,
    narrow = false,
}: WrapperConfig = {}) => {
    const player: Player = { ...awayPlayer, ...playerOverride };
    const appState: AppState = {
        ...baseAppState,
        game: { ...baseGame, players: [player] },
    };
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
    Wrapper.displayName = 'AwayRejoinStoryWrapper';
    return Wrapper;
};

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
    title: 'Footer/AwayRejoinFooter',
    component: AwayRejoinFooter,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [makeDecorator()],
} satisfies Meta<typeof AwayRejoinFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ───────────────────────────────────────────────────────────────────

/**
 * Default away state — player has chips but is marked not-ready.
 * Button is right-aligned on landscape (flex-end), full-width on portrait.
 */
export const ImBack: Story = {
    name: "I'm Back (right-aligned)",
    decorators: [makeDecorator()],
};

/**
 * Player already queued to rejoin next hand (readyNextHand=true).
 * Status pill + ghost cancel button, both right-aligned on landscape.
 */
export const RejoiningNextHand: Story = {
    name: 'Rejoining Next Hand (queued)',
    decorators: [makeDecorator({ playerOverride: { readyNextHand: true } })],
};

/**
 * Narrow viewport simulating portrait/mobile — buttons stretch full-width.
 */
export const PortraitImBack: Story = {
    name: "I'm Back — portrait (full-width)",
    decorators: [makeDecorator({ narrow: true })],
};

/**
 * Narrow viewport with rejoining state.
 */
export const PortraitRejoining: Story = {
    name: 'Rejoining — portrait',
    decorators: [makeDecorator({ playerOverride: { readyNextHand: true }, narrow: true })],
};

/**
 * No socket connection — verify the UI renders without crashing.
 */
export const NoSocket: Story = {
    name: "I'm Back — no socket",
    decorators: [makeDecorator({ withSocket: false })],
};
