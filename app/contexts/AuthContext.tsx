'use client';

import React, {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
    useRef,
    useCallback,
} from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { isAuth } from '../hooks/server_actions';
import { useWalletAuth } from '../hooks/useWalletAuth';

interface AuthContextProps {
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    userAddress: string | null;
    lastAuthenticatedAddress: string | null;
    requestAuthentication: () => void;
    refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    isAuthenticating: false,
    userAddress: null,
    lastAuthenticatedAddress: null,
    requestAuthentication: () => {},
    refreshAuthStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const account = useActiveAccount();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Track the address that was last successfully authenticated (JWT address)
    const [lastAuthenticatedAddress, setLastAuthenticatedAddress] = useState<string | null>(null);
    const previousAddressRef = useRef<string | null>(null);

    // Define checkAuthentication first (needed by refreshAuthStatus)
    const checkAuthentication = useCallback(async () => {
        if (!account?.address) {
            setIsAuthenticated(false);
            return;
        }

        try {
            const authenticated = await isAuth();
            setIsAuthenticated(authenticated);
            // If authenticated, store this address as the last authenticated address
            if (authenticated) {
                setLastAuthenticatedAddress(account.address);
            }
            console.log('Auth status:', authenticated, 'Address:', account.address);
        } catch (error) {
            console.error('Error checking authentication:', error);
            setIsAuthenticated(false);
        }
    }, [account?.address]);

    // Expose a method to refresh auth status immediately (called after SIWE completes)
    // Case 2: This is called by useWalletAuth after successful SIWE to trigger immediate
    // auth state update, which causes WebSocketProvider to reconnect
    const refreshAuthStatus = useCallback(async () => {
        console.log('[AuthContext] refreshAuthStatus called - checking auth immediately');
        await checkAuthentication();
    }, [checkAuthentication]);

    // Handle wallet authentication - runs once at provider level
    // Pass refreshAuthStatus so it's called immediately after SIWE success (Case 2)
    const { isAuthenticating, requestAuthentication } = useWalletAuth(refreshAuthStatus);

    useEffect(() => {
        checkAuthentication();

        // Check auth status periodically while wallet is connected
        const interval = setInterval(checkAuthentication, 5000);

        return () => clearInterval(interval);
    }, [checkAuthentication]);

    // Case 1: Detect wallet swap - if wallet changes after auth, logout old session
    useEffect(() => {
        const currentAddress = account?.address || null;
        const prevAddress = previousAddressRef.current;

        // Wallet changed
        if (prevAddress && currentAddress && prevAddress !== currentAddress) {
            console.log('[AuthContext] Wallet changed from', prevAddress, 'to', currentAddress);

            // If we were authenticated with the old wallet, we need to logout
            // because the JWT is still bound to the old wallet address
            if (lastAuthenticatedAddress && lastAuthenticatedAddress !== currentAddress) {
                console.log('[AuthContext] Wallet swap detected - logging out old session');
                logoutUser().then(() => {
                    setIsAuthenticated(false);
                    setLastAuthenticatedAddress(null);
                    // Request authentication with the new wallet
                    requestAuthentication();
                }).catch((err) => {
                    console.error('[AuthContext] Error logging out after wallet swap:', err);
                });
            }
        }

        previousAddressRef.current = currentAddress;
    }, [account?.address, lastAuthenticatedAddress, requestAuthentication]);

    const value: AuthContextProps = {
        isAuthenticated,
        isAuthenticating,
        userAddress: account?.address || null,
        lastAuthenticatedAddress,
        requestAuthentication,
        refreshAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const getCookie = (key: string): string | undefined => {
    return document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${key}=`))
        ?.split('=')[1];
};

// Set nonsensitive Cookies such as address
// NOT SECURE AND SHOULD NOT BE USED FOR SENSITIVE DATA
// POTENTIALLY DEPRICATE IN THE FUTURE
export const setCookie = (key: string, value: string, toDelete: boolean) => {
    const date = new Date();
    if (toDelete) {
        date.setTime(date.getTime() - 1); // Set to a time in the past to delete the cookie
    } else {
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = key + '=' + value + ';' + expires + ';path=/';
};

export async function logoutUser() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    await fetch(`${backendUrl}/logout`, {
        method: 'POST',
        credentials: 'include', // ensure cookies are sent
    });
    // Optionally clear local non-sensitive cookies like "address"
    setCookie('address', '', true);
}
