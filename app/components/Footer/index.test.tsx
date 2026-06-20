// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, cleanup } from '@testing-library/react';

// We test ONLY the visibility gate in Footer/index.tsx, so the concrete footers are replaced with
// sentinels. This keeps the test off their heavy dependency trees (sound, zustand, thirdweb) and
// makes the assertion unambiguous: which footer did the gate choose?
vi.mock('./FooterWithActionButtons', async () => {
    const React = await import('react');
    return {
        default: () =>
            React.createElement('div', { 'data-testid': 'action-footer' }),
    };
});
vi.mock('./EmptyFooter', async () => {
    const React = await import('react');
    return {
        default: () =>
            React.createElement('div', { 'data-testid': 'empty-footer' }),
    };
});
vi.mock('./ShowCardsFooter', async () => {
    const React = await import('react');
    return {
        default: () =>
            React.createElement('div', { 'data-testid': 'showcards-footer' }),
    };
});
vi.mock('./AwayRejoinFooter', async () => {
    const React = await import('react');
    return {
        default: () =>
            React.createElement('div', { 'data-testid': 'away-footer' }),
    };
});
vi.mock('./BlindObligationControls', () => ({ default: () => null }));
vi.mock('@/app/hooks/server_actions', () => ({ revealCards: vi.fn() }));

// Provide real (but isolated) React contexts so Footer and the test share the same objects without
// importing the heavy real providers.
vi.mock('@/app/contexts/AppStoreProvider', async () => {
    const { createContext } = await import('react');
    return { AppContext: createContext<unknown>(null) };
});
vi.mock('@/app/contexts/WebSocketProvider', async () => {
    const { createContext } = await import('react');
    return { SocketContext: createContext<unknown>(null) };
});

import Footer from './index';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';

// A seated player who is dealt into the current hand, during an active betting round — the exact
// state in which bet/fold/raise must be visible.
const activeHandState = () => ({
    clientID: 'me',
    blindObligation: null,
    game: {
        running: true,
        betting: true,
        stage: 2,
        action: 0,
        owesBB: [false],
        waitingForBB: [false],
        players: [
            {
                uuid: 'me',
                seatID: 6,
                position: 0,
                in: true,
                stack: 100,
                ready: true,
            },
        ],
    },
});

function renderFooter(opts: {
    socket: unknown;
    appState: ReturnType<typeof activeHandState>;
}) {
    return render(
        <SocketContext.Provider value={opts.socket as never}>
            <AppContext.Provider
                value={{ appState: opts.appState, dispatch: vi.fn() } as never}
            >
                <Footer />
            </AppContext.Provider>
        </SocketContext.Provider>
    );
}

afterEach(() => cleanup());

describe('Footer action-button visibility gate', () => {
    it('shows the action footer for a seated player in an active betting round', () => {
        renderFooter({ socket: {}, appState: activeHandState() });
        expect(screen.getByTestId('action-footer')).toBeInTheDocument();
        expect(screen.queryByTestId('empty-footer')).not.toBeInTheDocument();
    });

    it('REGRESSION: a dropped socket hides bet/fold/raise even when nothing else changed', () => {
        // This is the exact reported symptom. During each cycle of the silent reconnect loop the
        // socket is briefly null; the game state in the store is unchanged, so the rest of the
        // table still renders, but the socket-gated action footer disappears.
        renderFooter({ socket: null, appState: activeHandState() });
        expect(screen.queryByTestId('action-footer')).not.toBeInTheDocument();
        expect(screen.getByTestId('empty-footer')).toBeInTheDocument();
    });

    it('does not show action buttons outside an active betting round', () => {
        const s = activeHandState();
        s.game.betting = false; // hand running but not in a betting round
        renderFooter({ socket: {}, appState: s });
        expect(screen.queryByTestId('action-footer')).not.toBeInTheDocument();
    });

    it('does not show action buttons to a player not dealt into the hand', () => {
        const s = activeHandState();
        s.game.players[0].in = false;
        renderFooter({ socket: {}, appState: s });
        expect(screen.queryByTestId('action-footer')).not.toBeInTheDocument();
    });
});

describe('Footer invariant: visibility must never depend on auth identity', () => {
    it('Footer/index.tsx references no auth/session identity', () => {
        // The action footer is gated on the live socket + WS game state only. If a future change
        // gates it on auth (the failure mode behind this whole investigation — auth jitter then
        // silently removes the controls), this guard fails.
        const src = readFileSync(
            resolve(process.cwd(), 'app/components/Footer/index.tsx'),
            'utf8'
        );
        for (const forbidden of [
            'useAuth',
            'AuthContext',
            'isAuthenticated',
            'sessionWallet',
            'lastAuthenticatedAddress',
            'walletMismatch',
        ]) {
            expect(src).not.toContain(forbidden);
        }
    });
});
