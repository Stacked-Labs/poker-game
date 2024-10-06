'use client';

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useEffect,
} from 'react';
import { useSignMessage } from 'wagmi';
import { useAccount } from 'wagmi';
import { authenticateUser } from '@/app/hooks/server_actions';

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
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

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
        if (!isConnected || !address || authToken) return;
        if (isAuthenticating) return;

        setIsAuthenticating(true);
        try {
            const message = `I agree to the following terms and conditions:

1. Stacked is not responsible for any funds used on this platform.
2. This is a testing phase and the platform may contain bugs or errors.
3. I am using this platform at my own risk.

Signing Address: ${address}
Timestamp: ${Date.now()}`;

            const signature = await signMessageAsync({ message });
            const token = await authenticateUser(address, signature, message);
            setAuthToken(token);
            setUserAddress(address);
            localStorage.setItem('authToken', token);
            localStorage.setItem('address', address);
            window.dispatchEvent(new Event('authenticationComplete'));
        } catch (error) {
            console.error('Authentication failed:', error);
        } finally {
            setIsAuthenticating(false);
        }
    }, [isConnected, address, signMessageAsync, authToken, isAuthenticating]);

    // Automatically authenticate if already connected and no token
    useEffect(() => {
        if (isConnected && !authToken) {
            authenticate();
        }
    }, [isConnected, authToken, authenticate]);

    const value: AuthContextProps = {
        isAuthenticated: !!authToken,
        authToken,
        userAddress,
        authenticate,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};