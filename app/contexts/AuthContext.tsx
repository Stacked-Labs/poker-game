'use client';

import React, {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
    useCallback,
} from 'react';
import {
    useActiveAccount,
    useActiveWalletConnectionStatus,
} from 'thirdweb/react';
import { getAuthStatus } from '../hooks/server_actions';
import { useWalletAuth } from '../hooks/useWalletAuth';
import {
    reconcileWalletSession,
    type WalletSessionDecision,
} from '../lib/walletSession';

const DEBUG = process.env.NEXT_PUBLIC_DEBUG_WS === 'true';

interface XAccountStatus {
    linked: boolean;
    x_username?: string;
    profile_image_url?: string;
}

interface AuthContextProps {
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    userAddress: string | null;
    /** Wallet the SIWE cookie is bound to (server truth), independent of the connected wallet. */
    sessionWallet: string | null;
    lastAuthenticatedAddress: string | null;
    /** True when the connected wallet differs from the session wallet (switch in progress). */
    walletMismatch: boolean;
    /** Reconciled relationship between the session cookie and the connected wallet. */
    walletSessionStatus: WalletSessionDecision['status'];
    xUsername: string | null;
    xProfileImageUrl: string | null;
    xStatusChecked: boolean;
    requestAuthentication: () => void;
    /** Explicit, user-initiated logout (e.g. "Disconnect Wallet"): clears the SIWE session. */
    logout: () => Promise<void>;
    refreshAuthStatus: () => Promise<void>;
    refreshXStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    isAuthenticating: false,
    userAddress: null,
    sessionWallet: null,
    lastAuthenticatedAddress: null,
    walletMismatch: false,
    walletSessionStatus: 'unauthenticated',
    xUsername: null,
    xProfileImageUrl: null,
    xStatusChecked: false,
    requestAuthentication: () => {},
    logout: async () => {},
    refreshAuthStatus: async () => {},
    refreshXStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const account = useActiveAccount();
    const connectionStatus = useActiveWalletConnectionStatus();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // The wallet the SIWE JWT cookie is bound to — server truth, NOT derived from the connected
    // wallet. This is the anchor every mismatch/logout decision compares against.
    const [sessionWallet, setSessionWallet] = useState<string | null>(null);

    // X account state
    const [xUsername, setXUsername] = useState<string | null>(null);
    const [xProfileImageUrl, setXProfileImageUrl] = useState<string | null>(null);
    const [xStatusChecked, setXStatusChecked] = useState(false);

    // Define checkAuthentication first (needed by refreshAuthStatus).
    // Crucially this does NOT gate on account?.address: the auth cookie can be valid while
    // thirdweb has not (re)hydrated the wallet (table-balancing reload, fresh tab from "My
    // table", a transient wallet blip). Gating on the connected wallet is exactly what made the
    // UI report "logged out" while the WebSocket was still authenticated by the cookie.
    const checkAuthentication = useCallback(async () => {
        try {
            const status = await getAuthStatus();
            setIsAuthenticated(status.isAuth);
            setSessionWallet(status.isAuth ? status.address : null);
            if (DEBUG)
                console.log(
                    '[AuthContext] session:',
                    status.isAuth,
                    'sessionWallet:',
                    status.address,
                    'connected:',
                    account?.address ?? null
                );
        } catch (error) {
            console.error('Error checking authentication:', error);
            // A failed probe is NOT proof of logout — don't tear down a possibly-valid session
            // on a network blip. Leave the last known state in place.
        }
    }, [account?.address]);

    // Fetch X account link status
    const refreshXStatus = useCallback(async () => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const response = await fetch(`${backendUrl}/auth/x/status`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                setXUsername(null);
                setXProfileImageUrl(null);
                return;
            }
            const data: XAccountStatus = await response.json();
            if (data.linked) {
                setXUsername(data.x_username || null);
                setXProfileImageUrl(data.profile_image_url || null);
            } else {
                setXUsername(null);
                setXProfileImageUrl(null);
            }
        } catch {
            setXUsername(null);
            setXProfileImageUrl(null);
        } finally {
            setXStatusChecked(true);
        }
    }, []);

    // Expose a method to refresh auth status immediately (called after SIWE completes)
    // Case 2: This is called by useWalletAuth after successful SIWE to trigger immediate
    // auth state update, which causes WebSocketProvider to reconnect
    const refreshAuthStatus = useCallback(async () => {
        if (DEBUG) console.log('[AuthContext] refreshAuthStatus called - checking auth immediately');
        await checkAuthentication();
    }, [checkAuthentication]);

    // Explicit, user-initiated logout. Distinct from a wallet *disconnect* (which we keep the
    // session through, so a table-balancing reload / blip doesn't strand the player): this is
    // only called on a deliberate "Disconnect Wallet" action. Clears local state immediately so
    // the WebSocket downgrades to spectator, then clears the cookie server-side.
    const logout = useCallback(async () => {
        setIsAuthenticated(false);
        setSessionWallet(null);
        try {
            await logoutUser();
        } catch (err) {
            console.error('[AuthContext] logout failed:', err);
        }
    }, []);

    // Handle wallet authentication - runs once at provider level
    // Pass refreshAuthStatus so it's called immediately after SIWE success (Case 2)
    const { isAuthenticating, requestAuthentication } = useWalletAuth(refreshAuthStatus);

    useEffect(() => {
        checkAuthentication();

        // Check auth status periodically while wallet is connected
        const interval = setInterval(checkAuthentication, 5000);

        return () => clearInterval(interval);
    }, [checkAuthentication]);

    // Fetch X status when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            refreshXStatus();
        } else {
            setXUsername(null);
            setXProfileImageUrl(null);
        }
    }, [isAuthenticated, refreshXStatus]);

    // Handle X OAuth callback redirect (x_auth=success in URL)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const xAuth = params.get('x_auth');
        if (xAuth === 'success') {
            refreshXStatus();
            // Clean up URL params
            const url = new URL(window.location.href);
            url.searchParams.delete('x_auth');
            window.history.replaceState({}, '', url.toString());
        }
    }, [refreshXStatus]);

    // Single, timing-independent reconciliation between the session cookie (server truth) and
    // the connected wallet. Replaces the old transition-watching swap/disconnect effect, which
    // (a) missed in-wallet account switches when `lastAuthenticatedAddress` wasn't set yet, and
    // (b) cleared a valid JWT on transient wallet blips. We re-derive the decision on every
    // input change rather than trying to catch the X→Y transition.
    const decision = reconcileWalletSession({
        sessionWallet,
        connectedWallet: account?.address ?? null,
        connectionStatus,
    });
    const walletMismatch = decision.status === 'mismatch';
    // Stable primitive so the effect fires once per distinct mismatch, not every render.
    const mismatchKey = walletMismatch
        ? `${decision.sessionWallet}->${decision.connectedWallet}`
        : null;

    useEffect(() => {
        if (!mismatchKey) return;
        // SECURITY: the cookie is bound to the session wallet but a DIFFERENT wallet is now
        // active (e.g. the user switched accounts inside Rabby/MetaMask). Two steps:
        // 1. Optimistically drop the local session NOW so the WebSocket downgrades to spectator
        //    immediately and nothing can be done as the old wallet during the /logout round-trip.
        //    (If /logout fails, the 5s checkAuthentication re-reads the cookie and we retry.)
        // 2. Clear the cookie server-side, then re-run SIWE for the newly-connected wallet.
        if (DEBUG)
            console.log('[AuthContext] wallet mismatch', mismatchKey, '→ logging out old session');
        setIsAuthenticated(false);
        setSessionWallet(null);
        logoutUser()
            .catch((err) =>
                console.error('[AuthContext] Error logging out on mismatch:', err)
            )
            .finally(() => {
                requestAuthentication();
            });
    }, [mismatchKey, requestAuthentication]);

    const value: AuthContextProps = {
        isAuthenticated,
        isAuthenticating,
        userAddress: account?.address || null,
        sessionWallet,
        // The wallet our session is actually authenticated as (server truth). Consumers that
        // gate actions on "is the active wallet the one I'm signed in as" compare against this.
        lastAuthenticatedAddress: sessionWallet,
        walletMismatch,
        walletSessionStatus: decision.status,
        xUsername,
        xProfileImageUrl,
        xStatusChecked,
        requestAuthentication,
        logout,
        refreshAuthStatus,
        refreshXStatus,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export async function logoutUser() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    await fetch(`${backendUrl}/logout`, {
        method: 'POST',
        credentials: 'include', // ensure cookies are sent
    });
    // Clear the non-sensitive client-set `address` cookie. The auth JWT itself
    // is HttpOnly and was cleared by the backend's /logout above.
    document.cookie = 'address=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
}
