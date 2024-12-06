'use client';

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useEffect,
} from 'react';
import { authenticateUser } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import { AutoConnect, useActiveAccount, useDisconnect } from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import { client } from '../client';

interface AuthContextProps {
    isAuthenticated: boolean;
    authToken: string | null;
    userAddress: string | null;
    authenticate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    authToken: null,
    userAddress: null,
    authenticate: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { disconnect } = useDisconnect();
    const account = useActiveAccount();
    const address = account?.address;
    const { success, error } = useToastHelper();

    // Initialize authToken and userAddress from localStorage
    const [authToken, setAuthToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    });

    const [userAddress, setUserAddress] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('address');
        }
        return null;
    });

    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

    const authenticate = useCallback(async () => {
        if (!address || authToken) return;
        if (isAuthenticating) return;

        setIsAuthenticating(true);
        try {
            const message = `I agree to the following terms and conditions:
                1. Stacked is not responsible for any funds used on this platform.
                2. This is a testing phase and the platform may contain bugs or errors.
                3. I am using this platform at my own risk.

                Signing Address: ${address}
                Timestamp: ${Date.now()}`;

            const signature = await signMessage({
                message,
                account,
            });
            const token = await authenticateUser(address, signature, message);
            console.log('TOKEN', token);
            setAuthToken(token);
            setUserAddress(address);
            localStorage.setItem('authToken', token);
            localStorage.setItem('address', address);
            window.dispatchEvent(new Event('authenticationComplete'));

            // Success toast
            success(
                'Authentication Successful',
                'You have been successfully authenticated.'
            );
        } catch (err) {
            disconnect;
            localStorage.removeItem('authToken');
            localStorage.removeItem('address');
            console.error('Authentication failed:', err);
            // Error toast
            error(
                'Authentication Failed',
                'There was an error during authentication. Please try again.'
            );
        } finally {
            setIsAuthenticating(false);
        }
    }, [address, signMessage, authToken, isAuthenticating, success, error]);

    // Automatically authenticate if already connected and no token
    useEffect(() => {
        if (account && !authToken) {
            authenticate();
        }
    }, [account, authToken, authenticate]);

    const value: AuthContextProps = {
        isAuthenticated: !!authToken,
        authToken,
        userAddress,
        authenticate,
    };

    return (
        <AuthContext.Provider value={value}><AutoConnect client={client}/>{children}</AuthContext.Provider>
    );
};
