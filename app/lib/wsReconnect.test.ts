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
