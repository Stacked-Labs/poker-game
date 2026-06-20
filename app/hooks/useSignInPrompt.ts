'use client';

import { useCallback } from 'react';
import { useMediaQuery, useColorMode } from '@chakra-ui/react';
import { useConnectModal } from 'thirdweb/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { client, enabledChains, wallets } from '@/app/thirdwebclient';

/**
 * Drives the "Sign in" CTA that gates wallet-bound actions (registering for a
 * tournament, hosting, etc.). One tap takes the user all the way: connect the
 * wallet if needed (which auto-runs SIWE via AuthContext), or re-prompt the
 * signature when a wallet is connected but the session isn't authenticated —
 * instead of a dead-end "connect your wallet first" toast that sends them
 * hunting for the nav.
 */
export function useSignInPrompt() {
    const { userAddress, isAuthenticated, isAuthenticating, requestAuthentication } =
        useAuth();
    const { connect, isConnecting } = useConnectModal();
    const { colorMode } = useColorMode();
    const [isLargerScreen] = useMediaQuery('(min-width: 768px)');

    const promptSignIn = useCallback(() => {
        // Wallet connected but session not authenticated → just (re)sign SIWE.
        if (userAddress) {
            requestAuthentication();
            return;
        }
        // No wallet → open the connect modal; AuthContext picks up the new
        // account and runs SIWE automatically once it connects.
        connect({
            client,
            wallets,
            chains: enabledChains,
            size: isLargerScreen ? 'wide' : 'compact',
            showThirdwebBranding: false,
            title: 'Log In',
            theme: colorMode === 'light' ? 'light' : 'dark',
        }).catch(() => {
            // User dismissed the modal — nothing to do.
        });
    }, [
        userAddress,
        requestAuthentication,
        connect,
        isLargerScreen,
        colorMode,
    ]);

    return {
        isSignedIn: isAuthenticated,
        isSigningIn: isAuthenticating || isConnecting,
        promptSignIn,
    };
}
