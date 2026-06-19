import { describe, it, expect } from 'vitest';
import {
    reconcileWalletSession,
    decisionRequiresLogout,
    normalizeAddr,
    type ConnectionStatus,
    type WalletSessionDecision,
} from './walletSession';

// Two distinct, well-formed addresses used throughout.
const X = '0x1111111111111111111111111111111111111111';
const Y = '0x2222222222222222222222222222222222222222';
// X with EIP-55-style mixed casing — same address, different string.
const X_CHECKSUM = '0x1111111111111111111111111111111111111111'.replace(
    /1/g,
    '1'
);
const X_UPPER = '0X' + X.slice(2).toUpperCase();

function decide(
    sessionWallet: string | null | undefined,
    connectedWallet: string | null | undefined,
    connectionStatus: ConnectionStatus = 'connected'
): WalletSessionDecision {
    return reconcileWalletSession({
        sessionWallet,
        connectedWallet,
        connectionStatus,
    });
}

describe('normalizeAddr', () => {
    it('lowercases and trims a valid address', () => {
        expect(normalizeAddr('  ' + X_UPPER + '  ')).toBe(X);
    });

    it('treats malformed / non-address strings as empty', () => {
        // Defends against a malformed value ever comparing equal or being treated as a wallet.
        expect(normalizeAddr('0x123')).toBe(''); // too short
        expect(normalizeAddr('garbage')).toBe('');
        expect(normalizeAddr('0xZZZZ111111111111111111111111111111111111')).toBe(
            ''
        ); // non-hex
        expect(normalizeAddr('')).toBe('');
        expect(normalizeAddr('   ')).toBe('');
        expect(normalizeAddr(null)).toBe('');
        expect(normalizeAddr(undefined)).toBe('');
    });
});

describe('reconcileWalletSession — happy paths', () => {
    it('cookie wallet === connected wallet → authenticated', () => {
        expect(decide(X, X)).toEqual({ status: 'authenticated', wallet: X });
    });

    it('case/whitespace differences are NOT a mismatch (no spurious logout / DoS)', () => {
        // A checksummed cookie value vs a lowercase connected value is the SAME wallet.
        expect(decide(X_CHECKSUM, X_UPPER)).toEqual({
            status: 'authenticated',
            wallet: X,
        });
        expect(decide('  ' + X + '\n', X_UPPER)).toEqual({
            status: 'authenticated',
            wallet: X,
        });
    });
});

describe('reconcileWalletSession — wallet switch (the "did not log out on switch" bug)', () => {
    it('cookie X, connected Y → mismatch (must logout before Y can act)', () => {
        // In-wallet (Rabby/MetaMask) account switch: only signal is the address changing.
        expect(decide(X, Y)).toEqual({
            status: 'mismatch',
            sessionWallet: X,
            connectedWallet: Y,
        });
    });

    it('mismatch is detected regardless of connection status (event-order independent)', () => {
        const statuses: ConnectionStatus[] = [
            'connected',
            'connecting',
            'disconnected',
            'unknown',
        ];
        for (const s of statuses) {
            expect(decide(X, Y, s).status).toBe('mismatch');
        }
    });

    it('addresses differing only in the last nibble are a mismatch (no loose compare)', () => {
        const a = '0xabcabcabcabcabcabcabcabcabcabcabcabcab00';
        const b = '0xabcabcabcabcabcabcabcabcabcabcabcabcab01';
        expect(decide(a, b).status).toBe('mismatch');
    });

    it('cross-user takeover: stale cookie X, new user connects Y → mismatch', () => {
        // Shared browser. Previous user X still has a cookie; new user connects Y but has not
        // re-signed. Y must NOT inherit X's authenticated session.
        const d = decide(X, Y);
        expect(d.status).toBe('mismatch');
        expect(decisionRequiresLogout(d)).toBe(true);
    });
});

describe('reconcileWalletSession — session alive, wallet absent (table-move / "My table" / blip)', () => {
    it('session X, no wallet, AutoConnect in flight → wallet-reconnecting (do NOT logout)', () => {
        const d = decide(X, null, 'connecting');
        expect(d).toEqual({ status: 'wallet-reconnecting', sessionWallet: X });
        expect(decisionRequiresLogout(d)).toBe(false);
    });

    it('session X, no wallet, status unknown (early hydration) → wallet-reconnecting', () => {
        // 'unknown' is the pre-AutoConnect state; must not be treated as a settled disconnect.
        expect(decide(X, null, 'unknown')).toEqual({
            status: 'wallet-reconnecting',
            sessionWallet: X,
        });
    });

    it('session X, no wallet, AutoConnect settled disconnected → wallet-disconnected, session kept', () => {
        const d = decide(X, null, 'disconnected');
        expect(d).toEqual({ status: 'wallet-disconnected', sessionWallet: X });
        // Critical regression guard: a transient/settled wallet disappearance must NOT nuke the
        // JWT. That escalation is what turns a table-move reload into a real logout.
        expect(decisionRequiresLogout(d)).toBe(false);
    });

    it('a malformed connected address never reads as authenticated', () => {
        // If thirdweb ever surfaces a junk value, treat it as "no wallet", not a match.
        const d = decide(X, '0xnotanaddress', 'connected');
        expect(d.status).not.toBe('authenticated');
        expect(d.status).not.toBe('mismatch');
        expect(d).toEqual({ status: 'wallet-disconnected', sessionWallet: X });
    });
});

describe('reconcileWalletSession — no session', () => {
    it('no session, wallet connected → needs-auth (must SIWE, never silently authenticated)', () => {
        expect(decide(null, Y)).toEqual({
            status: 'needs-auth',
            connectedWallet: Y,
        });
    });

    it('logout in another tab: session cleared while wallet still connected → needs-auth', () => {
        expect(decide(undefined, Y, 'connected').status).toBe('needs-auth');
    });

    it('no session, no wallet, hydrating → connecting', () => {
        expect(decide(null, null, 'connecting')).toEqual({
            status: 'connecting',
        });
    });

    it('no session, no wallet, settled → unauthenticated', () => {
        expect(decide(null, null, 'disconnected')).toEqual({
            status: 'unauthenticated',
        });
    });
});

describe('reconcileWalletSession — empty/degenerate inputs (the ""==="" trap)', () => {
    it('two empty-string addresses are NOT authenticated', () => {
        // A naive `session === connected` would call '' === '' a match and grant access.
        const d = decide('', '', 'connected');
        expect(d.status).not.toBe('authenticated');
        expect(d).toEqual({ status: 'unauthenticated' });
    });

    it('empty session + real wallet → needs-auth', () => {
        expect(decide('', Y).status).toBe('needs-auth');
    });

    it('real session + empty wallet, settled → wallet-disconnected', () => {
        expect(decide(X, '', 'disconnected').status).toBe('wallet-disconnected');
    });

    it('whitespace-only values are treated as absent', () => {
        expect(decide('   ', '   ', 'disconnected')).toEqual({
            status: 'unauthenticated',
        });
    });
});

describe('decisionRequiresLogout — only a true mismatch forces a logout', () => {
    it('mismatch requires logout', () => {
        expect(decisionRequiresLogout(decide(X, Y))).toBe(true);
    });

    it('all non-mismatch decisions do NOT require logout', () => {
        const safe: WalletSessionDecision[] = [
            decide(X, X), // authenticated
            decide(X, null, 'connecting'), // wallet-reconnecting
            decide(X, null, 'disconnected'), // wallet-disconnected
            decide(null, Y), // needs-auth
            decide(null, null, 'connecting'), // connecting
            decide(null, null, 'disconnected'), // unauthenticated
        ];
        for (const d of safe) {
            expect(decisionRequiresLogout(d)).toBe(false);
        }
    });
});
