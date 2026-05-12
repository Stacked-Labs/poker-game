'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex } from '@chakra-ui/react';
import GameStatusBanner from './GameStatusBanner';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { AppState, Game } from '@/app/interfaces';

const mockSocket = {
    readyState: 1,
    send: () => {},
} as unknown as WebSocket;

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
    username: 'player.eth',
    clientID: 'player-uuid-1234',
    address: '0x1234567890ABCDEF1234567890ABCDEF12345678',
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
    isTableOwner: false,
    settlementStatus: null,
    displayMode: 'chips',
    tableClosed: null,
};

// ─── Decorator ──────────────────────────────────────────────────────────────

type WrapperConfig = {
    appStateOverride?: Partial<AppState>;
    gameOverride?: Partial<Game>;
};

const makeDecorator = ({
    appStateOverride,
    gameOverride,
}: WrapperConfig = {}) => {
    const game = gameOverride ? { ...baseGame, ...gameOverride } : baseGame;
    const appState: AppState = {
        ...baseAppState,
        game,
        ...appStateOverride,
    };
    const Wrapper = (Story: React.FC) => (
        <AppContext.Provider value={{ appState, dispatch: () => null }}>
            <SocketContext.Provider value={mockSocket}>
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
    Wrapper.displayName = 'GameStatusBannerStoryWrapper';
    return Wrapper;
};

// ─── Meta ───────────────────────────────────────────────────────────────────

const meta = {
    title: 'Popups/GameStatusBanner',
    component: GameStatusBanner,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
} satisfies Meta<typeof GameStatusBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Settlement: pending (fast path) ──────────────────────────────────────

export const Settling: Story = {
    name: 'Settling — live (rotating copy)',
    decorators: [
        makeDecorator({ appStateOverride: { settlementStatus: 'pending' } }),
    ],
};

// ─── Settlement: recovery (slow path) ─────────────────────────────────────
//
// Tx timed out but is still in flight — table is paused, background watcher
// polling. Banner shows amber spinner + elapsed counter that ticks every second.
// Reload the story to reset the counter.

export const SettlementRecovery: Story = {
    name: 'Settlement Recovery — auto-paused (watch elapsed counter tick)',
    decorators: [
        makeDecorator({
            gameOverride: { paused: true },
            appStateOverride: { settlementStatus: 'pending', isTableOwner: false },
        }),
    ],
};

// ─── Settlement: terminal states ───────────────────────────────────────────

export const Settled: Story = {
    name: 'Settled (success)',
    decorators: [makeDecorator({ appStateOverride: { settlementStatus: 'success' } })],
};

export const SettlementFailed: Story = {
    name: 'Settlement Failed',
    decorators: [makeDecorator({ appStateOverride: { settlementStatus: 'failed' } })],
};

// ─── Pause states — non-owner ──────────────────────────────────────────────

export const PausedNonOwner: Story = {
    name: 'Paused (non-owner)',
    decorators: [
        makeDecorator({
            gameOverride: { paused: true },
            appStateOverride: { isTableOwner: false },
        }),
    ],
};

export const PendingPauseNonOwner: Story = {
    name: 'Pending pause (non-owner)',
    decorators: [
        makeDecorator({
            gameOverride: { paused: false, pendingPause: true },
            appStateOverride: { isTableOwner: false },
        }),
    ],
};

// ─── Pause states — owner (inline Resume / Cancel chip) ───────────────────

export const PausedOwner: Story = {
    name: 'Paused — owner (Resume chip)',
    decorators: [
        makeDecorator({
            gameOverride: { paused: true },
            appStateOverride: { isTableOwner: true },
        }),
    ],
};

export const PendingPauseOwner: Story = {
    name: 'Pending pause — owner (Cancel chip)',
    decorators: [
        makeDecorator({
            gameOverride: { paused: false, pendingPause: true },
            appStateOverride: { isTableOwner: true },
        }),
    ],
};

// ─── Pending blinds ────────────────────────────────────────────────────────

export const PendingBlinds: Story = {
    name: 'Pending blinds',
    decorators: [
        makeDecorator({
            gameOverride: { pendingBlinds: { sb: 50, bb: 100 } },
        }),
    ],
};

// ─── Hidden ────────────────────────────────────────────────────────────────

export const Hidden: Story = {
    name: 'Hidden (no active state)',
    decorators: [makeDecorator()],
};
