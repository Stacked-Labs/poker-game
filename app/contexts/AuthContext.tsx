'use client';

import React, {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
    useCallback,
} from 'react';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
    useIsAutoConnecting,
} from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import { Account, Wallet } from 'thirdweb/dist/types/exports/wallets.native';
import { authenticateUser } from '../hooks/server_actions';

interface AuthContextProps {
    isAuthenticated: boolean;
    authToken: string | null;
    authenticate: (wallet: Wallet, account: Account) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    authToken: null,
    authenticate: async () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { error, warning } = useToastHelper();
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const isAutoConnecting = useIsAutoConnecting();

    const authenticate = useCallback(
        async (wallet: Wallet, account: Account) => {
            const authToken = localStorage.getItem('authToken');
            if (!wallet || isAuthenticating || authToken) {
                console.log('Skipping authentication');
                return;
            }

            console.log('Starting authentication process');
            warning('Check wallet for authentication.');
            setIsAuthenticating(true);

            try {
                const message = `I agree to the following terms and conditions:
                1. Stacked is not responsible for any funds used on this platform.
                2. This is a testing phase and the platform may contain bugs or errors.
                3. I am using this platform at my own risk.
    
                Signing Address: ${account.address}
                Timestamp: ${Date.now()}`;

                const signature = await signMessage({
                    message,
                    account,
                });

                const token = await authenticateUser(
                    account.address,
                    signature,
                    message
                );

                localStorage.setItem('authToken', token);
                window.dispatchEvent(new Event('authenticationComplete'));
            } catch (err) {
                disconnect(wallet);
                localStorage.removeItem('authToken');
                warning('Wallet disconnected.');
                console.error('Authentication failed:', err);
                error(
                    'Authentication Failed',
                    'There was an error during authentication. Please try again.'
                );
            } finally {
                setIsAuthenticating(false);
            }
        },
        [error, warning, disconnect, isAuthenticating]
    );

    useEffect(() => {
        if (!localStorage.getItem('authToken') && wallet) {
            disconnect(wallet);
        }

        if (localStorage.getItem('authToken') && wallet) {
            localStorage.removeItem('authToken');
        }
    }, [isAutoConnecting]);

    useEffect(() => {
        if (wallet) {
            const unsubscribe = wallet.subscribe(
                'accountChanged',
                (newAccount) => {
                    localStorage.removeItem('authToken');
                    authenticate(wallet, newAccount);
                }
            );

            return () => unsubscribe();
        }
    }, [wallet]);

    const value: AuthContextProps = {
        isAuthenticated:
            typeof window !== 'undefined' &&
            !!localStorage.getItem('authToken'),
        authToken:
            typeof window !== 'undefined'
                ? localStorage.getItem('authToken')
                : null,
        authenticate,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
