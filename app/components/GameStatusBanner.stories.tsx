'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex } from '@chakra-ui/react';
import GameStatusBanner from './GameStatusBanner';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import type { AppState, Game } from '@/app/interfaces';
import { makeTournamentLive } from './Tournament/tournamentMocks';

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
    displayModeExplicit: false,
    tableClosed: null,
    tournamentLive: null,
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

// ─── Tournament clock (ambient countdown) ──────────────────────────────────
//
// Lowest-priority state: the next-level countdown ticks down locally between WS
// pushes. Reload to restart the tick. Yields to any settlement/pause state.

const tournamentClockState = (remainingMs: number): Partial<AppState> => ({
    settlementStatus: null,
    tournamentLive: makeTournamentLive({
        clock: {
            level: 7,
            levelNumber: 7,
            sb: 300,
            bb: 600,
            ante: 600,
            remainingMs,
            totalMs: 600_000,
            receivedAt: Date.now(),
        },
    }),
});

export const TournamentClockAmbient: Story = {
    name: 'Tournament clock — ambient',
    decorators: [
        makeDecorator({
            appStateOverride: tournamentClockState(8 * 60_000 + 42_000),
        }),
    ],
};

export const TournamentClockLastMinute: Story = {
    name: 'Tournament clock — last 60s (blinds up soon)',
    decorators: [
        makeDecorator({ appStateOverride: tournamentClockState(45_000) }),
    ],
};

// ─── Rest breaks ────────────────────────────────────────────────────────────
//
// "Break coming" hint: the final minute of the level immediately before a break
// (next break follows the current level, secondsToNextBreak inside the window) —
// the clock banner reads "Break in m:ss" instead of "Blinds up in m:ss".

const breakComingState = (remainingMs: number): Partial<AppState> => ({
    settlementStatus: null,
    tournamentLive: makeTournamentLive({
        clock: {
            level: 6,
            levelNumber: 6,
            sb: 200,
            bb: 400,
            ante: 400,
            remainingMs,
            totalMs: 600_000,
            receivedAt: Date.now(),
            onBreak: false,
            secondsToNextBreak: Math.round(remainingMs / 1000),
            nextBreakAfterLevel: 6,
        },
    }),
});

export const TournamentBreakComing: Story = {
    name: 'Rest break — coming (final minute, "Break in m:ss")',
    decorators: [makeDecorator({ appStateOverride: breakComingState(42_000) })],
};

// On break: the level is frozen at N and the banner counts down the break
// remainder, "On break — m:ss · Level N+1 next".
const onBreakState = (breakRemainingMs: number): Partial<AppState> => ({
    settlementStatus: null,
    tournamentLive: makeTournamentLive({
        clock: {
            level: 6,
            levelNumber: 6,
            sb: 200,
            bb: 400,
            ante: 400,
            remainingMs: 0,
            totalMs: 600_000,
            receivedAt: Date.now(),
            onBreak: true,
            breakRemainingMs,
            // Real server shape: WHILE on a break the clock's nextBreakAfterLevel
            // points at the NEXT FUTURE break (here, after L9 for Regular cadence),
            // NOT the break in progress. The banner must still resume into L7 by
            // reading the frozen levelNumber — pinning this to 6 previously masked
            // that bug.
            nextBreakAfterLevel: 9,
        },
    }),
});

export const TournamentOnBreak: Story = {
    name: 'Rest break — on break ("On break — m:ss · Level 7 next")',
    decorators: [
        makeDecorator({ appStateOverride: onBreakState(4 * 60_000 + 32_000) }),
    ],
};

// ─── Hidden ────────────────────────────────────────────────────────────────

export const Hidden: Story = {
    name: 'Hidden (no active state)',
    decorators: [makeDecorator()],
};
