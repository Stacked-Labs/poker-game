import React from 'react';
import {
    AppContext,
    type ACTIONTYPE,
} from '@/app/contexts/AppStoreProvider';
import type {
    AppState,
    LeaderboardPlayer,
    TournamentLive,
    TournamentMeta,
} from '@/app/interfaces';

// Shared Storybook helpers for the context-driven in-table tournament UI
// (watermark, banner, result overlays, settings tab). NOT shipped — story-only.

export const MOCK_ME = '0x1111111111111111111111111111111111111111';

const addr = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;

export function makeTournamentMeta(
    over: Partial<TournamentMeta> = {}
): TournamentMeta {
    return {
        name: 'Nightly $50 GTD',
        status: 'running',
        registeredCount: 120,
        maxEntries: 0,
        minEntries: 10,
        prizePoolUsdc: 5_840_000_000,
        guaranteeUsdc: 5_000_000_000,
        buyInUsdc: 50_000_000,
        feeBps: 600,
        startingStack: 10_000,
        blindStructure: 'turbo',
        lateRegLevels: 3,
        lateRegCloseAt: new Date(Date.now() + 6 * 60_000).toISOString(),
        reentryAllowed: true,
        reentryMax: 2,
        chain: 'base',
        contractAddress: addr(0xabc),
        isFreePlay: false,
        hostWallet: addr(0xfee),
        settlementTxHash: undefined,
        ...over,
    };
}

// A realistic full field: 47 players still alive + 73 busted = 120 unique
// entrants (so leaderboard.length matches the advertised field in stories).
export function makeLeaderboard(): LeaderboardPlayer[] {
    const alive: LeaderboardPlayer[] = [
        { uuid: 'a', wallet: addr(0xa9), stack: 188_400, finish_pos: 0, table_index: 2, bullet_number: 1, xUsername: 'phil_h' },
        { uuid: 'b', wallet: addr(0xb3), stack: 121_050, finish_pos: 0, table_index: 0, bullet_number: 1 },
        { uuid: 'c', wallet: addr(0xc7), stack: 96_300, finish_pos: 0, table_index: 5, bullet_number: 2 },
        { uuid: 'me', wallet: MOCK_ME, stack: 42_500, finish_pos: 0, table_index: 5, bullet_number: 1 },
    ];
    for (let i = alive.length; i < 47; i++) {
        alive.push({
            uuid: 'al' + i,
            wallet: addr(0x100 + i),
            stack: Math.max(2_000, 40_000 - i * 800),
            finish_pos: 0,
            table_index: i % 6,
            bullet_number: 1,
        });
    }
    const busted: LeaderboardPlayer[] = [];
    for (let pos = 48; pos <= 120; pos++) {
        busted.push({
            uuid: 'out' + pos,
            wallet: addr(0x200 + pos),
            stack: 0,
            finish_pos: pos,
            table_index: -1,
            bullet_number: 1,
        });
    }
    return [...alive, ...busted];
}

export function makeTournamentLive(
    over: Partial<TournamentLive> = {}
): TournamentLive {
    return {
        tournamentId: 7,
        meta: makeTournamentMeta(),
        clock: {
            level: 7,
            levelNumber: 7,
            sb: 300,
            bb: 600,
            ante: 600,
            remainingMs: 8 * 60_000 + 42_000,
            totalMs: 10 * 60_000,
            receivedAt: 0, // stable for SSR/snapshot; stories don't tick from this
        },
        playersActive: 47,
        feed: [
            { playerUuid: 'out48', position: 48, remaining: 47 },
            { playerUuid: 'out49', position: 49, remaining: 48 },
        ],
        leaderboard: makeLeaderboard(),
        completed: null,
        myResult: null,
        status: 'live',
        ...over,
    };
}

export function mockAppState(over: Partial<AppState> = {}): AppState {
    return {
        messages: [],
        logs: [],
        username: null,
        address: MOCK_ME,
        clientID: 'me',
        table: 'tournament-7-table-6',
        game: null,
        volume: 1,
        chatSoundEnabled: true,
        chatOverlayEnabled: true,
        fourColorDeckEnabled: false,
        cardBackDesign: 'classic-blue',
        unreadMessageCount: 0,
        isChatOpen: false,
        seatRequested: null,
        seatAccepted: null,
        pendingPlayers: [],
        showSeatRequestPopups: true,
        isSettingsOpen: false,
        blindObligation: null,
        isTableOwner: null,
        settlementStatus: null,
        displayMode: 'chips',
        displayModeExplicit: false,
        tableClosed: null,
        tournamentLive: makeTournamentLive(),
        ...over,
    };
}

const noopDispatch = (() => undefined) as unknown as React.Dispatch<ACTIONTYPE>;

export function MockAppStateProvider({
    state,
    children,
}: {
    state: AppState;
    children: React.ReactNode;
}) {
    return (
        <AppContext.Provider value={{ appState: state, dispatch: noopDispatch }}>
            {children}
        </AppContext.Provider>
    );
}
