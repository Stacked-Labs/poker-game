'use client';

import React, {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
} from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { isAuth } from '../hooks/server_actions';

interface AuthContextProps {
    isAuthenticated: boolean;
    userAddress: string | null;
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    userAddress: null,
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const account = useActiveAccount();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            if (!account?.address) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const authenticated = await isAuth();
                setIsAuthenticated(authenticated);
                console.log('Auth status:', authenticated);
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuthentication();

        // Check auth status periodically while wallet is connected
        const interval = setInterval(checkAuthentication, 5000);

        return () => clearInterval(interval);
    }, [account?.address]);

    const value: AuthContextProps = {
        isAuthenticated,
        userAddress: account?.address || null,
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
