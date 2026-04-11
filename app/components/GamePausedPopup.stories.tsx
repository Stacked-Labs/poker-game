'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex } from '@chakra-ui/react';
import GamePausedPopup from './GamePausedPopup';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { AppState, Game } from '@/app/interfaces';

// ─── Mock data ──────────────────────────────────────────────────────────────

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
    username: 'owner.eth',
    clientID: 'owner-uuid-1234',
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
    isTableOwner: true,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
};

const mockSocket = {
    readyState: WebSocket.OPEN,
    send: () => {},
} as unknown as WebSocket;

// ─── Decorator helpers ──────────────────────────────────────────────────────

type WrapperConfig = {
    appStateOverride?: Partial<AppState>;
    gameOverride?: Partial<Game>;
    withSocket?: boolean;
};

/**
 * Simulates the table area where the banner renders.
 * Dark background with a green felt oval — the popup positions
 * itself absolute to the oval, just like GameStatusBanner.
 */
const makeDecorator = ({
    appStateOverride,
    gameOverride,
    withSocket = true,
}: WrapperConfig = {}) => {
    const game = gameOverride ? { ...baseGame, ...gameOverride } : baseGame;
    const appState: AppState = {
        ...baseAppState,
        game,
        ...appStateOverride,
    };
    const Wrapper = (Story: React.FC) => (
        <AppContext.Provider value={{ appState, dispatch: () => null }}>
            <SocketContext.Provider value={withSocket ? mockSocket : null}>
                <Box
                    bg="#0B1430"
                    borderRadius={16}
                    h="260px"
                    w="100%"
                    maxW="640px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                >
                    <Flex
                        position="relative"
                        w="280px"
                        h="140px"
                        bg="green.800"
                        borderRadius="50%"
                        alignItems="center"
                        justifyContent="center"
                        border="3px solid"
                        borderColor="green.900"
                        boxShadow="inset 0 2px 12px rgba(0,0,0,0.3)"
                    >
                        <Story />
                    </Flex>
                </Box>
            </SocketContext.Provider>
        </AppContext.Provider>
    );
    Wrapper.displayName = 'GamePausedStoryWrapper';
    return Wrapper;
};

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta = {
    title: 'Popups/GamePausedPopup',
    component: GamePausedPopup,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    decorators: [makeDecorator({ gameOverride: { paused: true } })],
} satisfies Meta<typeof GamePausedPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ────────────────────────────────────────────────────────────────

/**
 * Game is paused — owner sees the inline pill with a green "Resume" button.
 * Matches GameStatusBanner styling: glass pill, whiteAlpha.700 text, 300ms fade.
 */
export const Paused: Story = {
    name: 'Paused — Resume',
    decorators: [makeDecorator({ gameOverride: { paused: true } })],
};

/**
 * Pending pause (crypto tables) — game will pause after the current hand.
 * Orange "Cancel" button replaces the green "Resume".
 */
export const PendingPause: Story = {
    name: 'Pending Pause — Cancel',
    decorators: [
        makeDecorator({
            gameOverride: { paused: false, pendingPause: true },
        }),
    ],
};

/**
 * Not the table owner — banner renders nothing.
 */
export const NotOwner: Story = {
    name: 'Hidden (not owner)',
    decorators: [
        makeDecorator({
            gameOverride: { paused: true },
            appStateOverride: { isTableOwner: null },
        }),
    ],
};

/**
 * Game is running normally — banner renders nothing.
 */
export const NotPaused: Story = {
    name: 'Hidden (not paused)',
    decorators: [
        makeDecorator({ gameOverride: { paused: false } }),
    ],
};
