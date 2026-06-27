import { describe, it, expect } from 'vitest';
import {
    shouldReconnectForAuthUpgrade,
    type WsAuthSnapshot,
} from './wsReconnect';

const X = '0x1111111111111111111111111111111111111111';
const Y = '0x2222222222222222222222222222222222222222';
const X_UPPER = '0X' + X.slice(2).toUpperCase();

const snap = (
    isAuthenticated: boolean,
    sessionWallet: string | null | undefined
): WsAuthSnapshot => ({ isAuthenticated, sessionWallet });

describe('shouldReconnectForAuthUpgrade — legitimate upgrades', () => {
    it('spectator connect, then cookie becomes authenticated → reconnect (the post-SIWE upgrade)', () => {
        expect(
            shouldReconnectForAuthUpgrade(snap(false, null), snap(true, X))
        ).toBe(true);
    });

    it('re-authenticated as a DIFFERENT session wallet while socket open → reconnect (re-bind)', () => {
        expect(shouldReconnectForAuthUpgrade(snap(true, X), snap(true, Y))).toBe(
            true
        );
    });
});

describe('shouldReconnectForAuthUpgrade — issue #322: free seat survives sign-in', () => {
    // A player who SAT DOWN at a free table before signing in keeps their seat when they sign in.
    // The seat is preserved on the backend (BindWalletToSeatedFreePlayer at SIWE verify +
    // TryReclaimSeat on reconnect), but ONLY if the frontend actually force-reconnects the socket
    // so the server can upgrade/reclaim it. This decision is that trigger — if it stops firing on
    // the spectator→authenticated transition, the seated free player is stranded as a spectator
    // and "can't act" again.
    it('seated free player signs in (spectator socket → cookie authenticated) → reconnect', () => {
        expect(
            shouldReconnectForAuthUpgrade(snap(false, null), snap(true, X))
        ).toBe(true);
    });

    it('fires as soon as the cookie is authenticated, even before sessionWallet has resolved', () => {
        // getAuthStatus() can report isAuth=true a beat before the address is populated. We must
        // still reconnect immediately: the backend reclaims the seat via the wallet→UUID binding
        // regardless of whether the client knows its own session wallet yet, so there is no reason
        // to wait (waiting would leave the player on the stale spectator-phase socket).
        expect(
            shouldReconnectForAuthUpgrade(snap(false, null), snap(true, null))
        ).toBe(true);
        expect(
            shouldReconnectForAuthUpgrade(snap(false, null), snap(true, ''))
        ).toBe(true);
    });

    it('disconnecting the wallet afterwards does NOT fire here — losing the seat on disconnect is intended and owned by the separate downgrade effect', () => {
        expect(
            shouldReconnectForAuthUpgrade(snap(true, X), snap(false, null))
        ).toBe(false);
    });
});

describe('shouldReconnectForAuthUpgrade — must NOT reconnect (the silent-loop regression guards)', () => {
    it('steady authenticated, identical session → no reconnect', () => {
        expect(shouldReconnectForAuthUpgrade(snap(true, X), snap(true, X))).toBe(
            false
        );
    });

    it('connected-wallet jitter is structurally irrelevant: same session ⇒ no reconnect', () => {
        // This is THE bug. The old effect compared the thirdweb-connected address, so an
        // AutoConnect address flicker (X → undefined → X) forced a full WS teardown + seat
        // reclaim on a ~3s loop, blanking bet/fold/raise. The connected wallet is not a
        // parameter of this decision, so no amount of jitter can trigger a reconnect — only
        // the cookie session (unchanged here) can.
        const before = snap(true, X);
        // Whatever the connected wallet does between renders, the cookie session is still X:
        for (const current of [snap(true, X), snap(true, X), snap(true, X)]) {
            expect(shouldReconnectForAuthUpgrade(before, current)).toBe(false);
        }
    });

    it('session wallet differing only by casing is NOT a re-bind (no spurious reconnect)', () => {
        // Same DoS-class trap guarded in walletSession: checksum/casing differences are the
        // same wallet and must not churn the socket.
        expect(
            shouldReconnectForAuthUpgrade(snap(true, X), snap(true, X_UPPER))
        ).toBe(false);
    });

    it('auth LOSS (authenticated → unauthenticated) is owned by the downgrade effect, not this one', () => {
        expect(
            shouldReconnectForAuthUpgrade(snap(true, X), snap(false, null))
        ).toBe(false);
    });

    it('never authenticated → no reconnect', () => {
        expect(
            shouldReconnectForAuthUpgrade(snap(false, null), snap(false, null))
        ).toBe(false);
    });

    it('authenticated but session wallet momentarily absent → no re-bind (cannot bind to nothing)', () => {
        // Defends against a transient/degenerate getAuthStatus() where isAuth is true but the
        // address is missing — must not be read as "switched to a different wallet".
        expect(
            shouldReconnectForAuthUpgrade(snap(true, X), snap(true, null))
        ).toBe(false);
        expect(shouldReconnectForAuthUpgrade(snap(true, X), snap(true, ''))).toBe(
            false
        );
    });
});
