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
import {
    authenticateUser,
    getAddressFromCookie,
} from '../hooks/server_actions';

interface AuthContextProps {
    isAuthenticated: boolean;
    userAddress: string | null;
    authenticate: (account: Account, wallet: Wallet) => void;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    userAddress: null,
    authenticate: () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { error, success } = useToastHelper();
    const wallet = useActiveWallet();
    const account = useActiveAccount();
    const { disconnect } = useDisconnect();

    const authenticate = async (account: Account, wallet: Wallet) => {
        try {
            if (!account || !wallet) {
                error('Failed to authenticate: no wallet connection.');
                return;
            }

            const message = `
I agree to the following terms and conditions:

1. Stacked is not responsible for any funds used on this platform.
2. This is a testing phase and the platform may contain bugs or errors.
3. I am using this platform at my own risk.

Signing Address: ${account.address}
Timestamp: ${Date.now()}`;

            const signature = await signMessage({ message, account });

            const response = await authenticateUser(
                account.address,
                signature,
                message
            );

            if (response?.success) {
                setCookie('address', account.address, false);
                localStorage.setItem('isAuthenticated', 'true');
                success(
                    'Authentication Successful',
                    'You have been successfully authenticated.'
                );
            } else {
                throw new Error('No success response');
            }
        } catch (err) {
            console.error(err);
            disconnect(wallet);
            error(
                'Authentication Failed',
                'There was an error during authentication. Please try again.'
            );
        }
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            if (!account || !wallet) return;

            const isAuthenticated = localStorage.getItem('isAuthenticated');

            try {
                const { address } = await getAddressFromCookie();
                console.log('BBBBBB', address);
                if (!isAuthenticated || address !== account.address) {
                    await authenticate(account, wallet);
                }
            } catch (error) {
                console.error('Error during authentication check:', error);
            }
        };

        checkAuthentication();
    }, [account?.address, account, wallet]);

    const value: AuthContextProps = {
        isAuthenticated:
            typeof window !== 'undefined' && !!getCookie('address'),
        userAddress:
            typeof window !== 'undefined' && getCookie('address')
                ? getCookie('address') || null
                : null,
        authenticate,
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
    localStorage.removeItem('isAuthenticated');
}
