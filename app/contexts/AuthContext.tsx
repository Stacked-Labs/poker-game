'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import useToastHelper from '@/app/hooks/useToastHelper';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import { Account, Wallet } from 'thirdweb/dist/types/exports/wallets.native';
import { authenticateUser } from '../hooks/server_actions';

interface AuthContextProps {
    isAuthenticated: boolean;
    authToken: string | null;
    authenticate: (account: Account, wallet: Wallet) => void;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    authToken: null,
    authenticate: (account: Account, wallet: Wallet) => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { error } = useToastHelper();
    const wallet = useActiveWallet();
    const account = useActiveAccount();
    const { disconnect } = useDisconnect();

    const authenticate = async (account: Account, wallet: Wallet) => {
        try {
            setCookie('authToken', '', true);
            const message = `I agree to the following terms and conditions:
                        1. Stacked is not responsible for any funds used on this platform.
                        2. This is a testing phase and the platform may contain bugs or errors.
                        3. I am using this platform at my own risk.

                        Signing Address: ${account.address}
                        Timestamp: ${Date.now()}`;

            const signature = await signMessage({ message, account });

            const token = await authenticateUser(
                account.address,
                signature,
                message
            );

            setCookie('authToken', token, false);
            setCookie('address', account.address, false);
            window.dispatchEvent(new Event('authenticationComplete'));
        } catch (err) {
            console.error(err);
            disconnect(wallet);
            setCookie('authToken', '', true);
            error(
                'Authentication Failed',
                'There was an error during authentication. Please try again.'
            );
        }
    };

    useEffect(() => {
        if (!account || !wallet) return;

        const cookieToken = getCookie('authToken');
        const cookieAddress = getCookie('address');

        if (!cookieToken || cookieAddress !== account.address) {
            authenticate(account, wallet);
        }
    }, [account?.address]);

    const value: AuthContextProps = {
        isAuthenticated:
            typeof window !== 'undefined' && !!getCookie('authToken'),
        authToken:
            typeof window !== 'undefined' && getCookie('authToken')
                ? getCookie('authToken') || null
                : null,
        authenticate: (account, wallet) => authenticate(account, wallet),
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
