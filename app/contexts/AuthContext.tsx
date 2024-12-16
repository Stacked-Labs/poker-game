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
import { Account } from 'thirdweb/dist/types/exports/wallets.native';

interface AuthContextProps {
    isAuthenticated: boolean;
    authToken: string | null;
    authenticate: () => Promise<void>;
    currentAccount: Account | null;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    authToken: null,
    authenticate: async () => {},
    currentAccount: null,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const handleDisconnectWallet = useDisconnectWallet();
    const { success, info, error } = useToastHelper();
    const [authToken, setAuthToken] = useState<string | null>(
        typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    );

    const [currentAccount, setCurrentAccount] = useState(account);
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

    const authenticate = useCallback(async () => {
        if (!currentAccount?.address || isAuthenticating || authToken) return;
        setIsAuthenticating(true);
        try {
            info('Check wallet window for authentication.');

            const message = `I agree to the following terms and conditions:
                1. Stacked is not responsible for any funds used on this platform.
                2. This is a testing phase and the platform may contain bugs or errors.
                3. I am using this platform at my own risk.
    
                Signing Address: ${currentAccount.address}
                Timestamp: ${Date.now()}`;

            const signature = await signMessage({
                message,
                account: currentAccount,
            });
            const token = await authenticateUser(
                currentAccount.address,
                signature,
                message
            );
            localStorage.setItem('authToken', token);
            setAuthToken(token);
            window.dispatchEvent(new Event('authenticationComplete'));

            success(
                'Authentication Successful',
                'You have been successfully authenticated.'
            );
        } catch (err) {
            handleDisconnectWallet();
            console.error('Authentication failed:', err);
            error(
                'Authentication Failed',
                'There was an error during authentication. Please try again.'
            );
        } finally {
            setIsAuthenticating(false);
        }
    }, [
        currentAccount,
        isAuthenticating,
        authToken,
        success,
        error,
        handleDisconnectWallet,
    ]);

    useEffect(() => {
        if (account && account !== currentAccount) {
            setCurrentAccount(account);
        }
    }, [account]);

    useEffect(() => {
        if (currentAccount && !authToken) {
            authenticate();
        }
    }, [currentAccount, authToken, authenticate]);

    useEffect(() => {
        if (wallet) {
            const unsubscribe = wallet.subscribe(
                'accountChanged',
                (newAccount) => {
                    console.log('ACCOUNT CHANGED:', newAccount);
                    setCurrentAccount(newAccount);
                    setAuthToken(null);
                    localStorage.removeItem('authToken');
                }
            );

            return () => unsubscribe();
        }
    }, [wallet]);

    const value: AuthContextProps = {
        isAuthenticated: !!authToken,
        authToken,
        authenticate,
        currentAccount: currentAccount ?? null,
    };

    return (
        <AuthContext.Provider value={value}>
            <AutoConnect client={client} />
            {children}
        </AuthContext.Provider>
    );
};
