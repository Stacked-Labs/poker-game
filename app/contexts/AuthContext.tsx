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
import { AutoConnect, useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import { client } from '../client';
import { useDisconnectWallet } from '../hooks/disconnectWallet';

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
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const address = account?.address;
    const handleDisconnectWallet = useDisconnectWallet();
    const { success, error } = useToastHelper();
    const authToken =
        typeof window !== 'undefined'
            ? localStorage.getItem('authToken')
            : null;
    const userAddress =
        typeof window !== 'undefined' ? localStorage.getItem('address') : null;

    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

    const authenticate = useCallback(async () => {
        if (!address || authToken) return;
        if (isAuthenticating) return;
        if (!wallet || wallet === undefined) return;

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
            localStorage.setItem('authToken', token);
            localStorage.setItem('address', address);
            window.dispatchEvent(new Event('authenticationComplete'));

            // Success toast
            success(
                'Authentication Successful',
                'You have been successfully authenticated.'
            );
        } catch (err) {
            handleDisconnectWallet();
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
    }, [account, authToken]);

    const value: AuthContextProps = {
        isAuthenticated: !!authToken,
        authToken,
        userAddress,
        authenticate,
    };

    return (
        <AuthContext.Provider value={value}>
            <AutoConnect client={client} />
            {children}
        </AuthContext.Provider>
    );
};
