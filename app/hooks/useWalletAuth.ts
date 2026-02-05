'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import { getAuthPayload, verifySignedPayload, isAuth } from './server_actions';
import useToastHelper from './useToastHelper';

// Callback type for notifying auth completion
type OnAuthCompleteCallback = () => Promise<void>;

/**
 * Hook to handle wallet authentication via SIWE (Sign-In with Ethereum)
 * This runs once at the provider level to prevent duplicate auth requests
 * when multiple WalletButton components are mounted
 */
export const useWalletAuth = (onAuthComplete?: OnAuthCompleteCallback) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { success, error: showError, warning } = useToastHelper();
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Use ref to prevent duplicate authentication attempts
    const authAttemptRef = useRef<string | null>(null);
    const onAuthCompleteRef = useRef(onAuthComplete);

    // Keep ref updated
    useEffect(() => {
        onAuthCompleteRef.current = onAuthComplete;
    }, [onAuthComplete]);

    const authenticate = useCallback(
        async (force = false) => {
            if (!account?.address || !wallet) {
                authAttemptRef.current = null;
                return;
            }

            // Prevent duplicate auth attempts for the same address
            if (!force && authAttemptRef.current === account.address) {
                return;
            }

            if (isAuthenticating) {
                return;
            }

            try {
                setIsAuthenticating(true);
                authAttemptRef.current = account.address;

                // Check if already authenticated
                const authenticated = await isAuth();
                if (authenticated) {
                    // Already authenticated - still call onAuthComplete to ensure state is synced
                    if (onAuthCompleteRef.current) {
                        await onAuthCompleteRef.current();
                    }
                    return;
                }

                // Step 1: Get SIWE payload and formatted message from backend
                const { payload, message } = await getAuthPayload(account.address);

                // Step 2: Sign the MESSAGE string (not the payload!)
                const signature = await account.signMessage({
                    message: message,
                });

                // Step 3: Send payload + signature to backend for verification
                const result = await verifySignedPayload({
                    payload,
                    signature,
                });

                if (result.success) {
                    success(
                        'Authentication Successful',
                        'You have been successfully authenticated.'
                    );
                    // Case 2: Immediately refresh auth status after successful SIWE
                    // This triggers WS reconnect so ownership is recognized without page refresh
                    console.log('[useWalletAuth] SIWE successful, refreshing auth status');
                    if (onAuthCompleteRef.current) {
                        await onAuthCompleteRef.current();
                    }
                } else {
                    authAttemptRef.current = null;
                    disconnect(wallet);
                    showError(
                        'Authentication Failed',
                        'Signature verification failed. Please try again.'
                    );
                }
            } catch (err: unknown) {
                console.error('Authentication error:', err);
                authAttemptRef.current = null;

                const error = err as {
                    message?: string;
                    code?: number | string;
                };
                if (
                    error?.message?.includes('rejected') ||
                    error?.message?.includes('denied') ||
                    error?.message?.includes('cancelled') ||
                    error?.code === 4001 ||
                    error?.code === 'ACTION_REJECTED'
                ) {
                    disconnect(wallet);
                    warning(
                        'Authentication Required',
                        'You must sign the message to use the app.'
                    );
                } else {
                    disconnect(wallet);
                    showError(
                        'Authentication Failed',
                        'There was an error during authentication. Please try again.'
                    );
                }
            } finally {
                setIsAuthenticating(false);
            }
        },
        [
            account,
            disconnect,
            isAuthenticating,
            showError,
            success,
            wallet,
            warning,
        ]
    );

    useEffect(() => {
        authenticate(false);
    }, [authenticate]);

    const requestAuthentication = useCallback(() => {
        authAttemptRef.current = null;
        authenticate(true);
    }, [authenticate]);

    return { isAuthenticating, requestAuthentication };
};
