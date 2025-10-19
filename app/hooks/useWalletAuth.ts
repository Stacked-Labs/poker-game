'use client';

import { useEffect, useState, useRef } from 'react';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import { getAuthPayload, verifySignedPayload, isAuth } from './server_actions';
import useToastHelper from './useToastHelper';

/**
 * Hook to handle wallet authentication via SIWE (Sign-In with Ethereum)
 * This runs once at the provider level to prevent duplicate auth requests
 * when multiple WalletButton components are mounted
 */
export const useWalletAuth = () => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { success, error: showError, warning } = useToastHelper();
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Use ref to prevent duplicate authentication attempts
    const authAttemptRef = useRef<string | null>(null);

    useEffect(() => {
        const authenticate = async () => {
            if (!account?.address || !wallet) {
                authAttemptRef.current = null;
                return;
            }

            // Prevent duplicate auth attempts for the same address
            if (authAttemptRef.current === account.address) {
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
                    console.log('Already authenticated');
                    setIsAuthenticating(false);
                    return;
                }

                console.log(
                    'Starting SIWE authentication for:',
                    account.address
                );

                // Step 1: Get SIWE payload and formatted message from backend
                console.log(
                    'Getting auth payload for address:',
                    account.address
                );
                const { payload, message } = await getAuthPayload(
                    account.address
                );
                console.log('Received auth payload:', payload);
                console.log('📝 Message to sign:', message);
                console.log('Payload:', payload);

                // Step 2: Sign the MESSAGE string (not the payload!)
                const signature = await account.signMessage({
                    message: message, // Sign the formatted SIWE message string
                });
                console.log('✍️ Signature:', signature);

                // Step 3: Send payload + signature to backend for verification
                console.log('Verifying signed payload:', payload);
                const result = await verifySignedPayload({
                    payload,
                    signature,
                });
                console.log('Verification result:', result);

                if (result.success) {
                    console.log('✅ User authenticated:', result.address);
                    success(
                        'Authentication Successful',
                        'You have been successfully authenticated.'
                    );
                } else {
                    // Authentication failed - disconnect wallet
                    console.error('❌ Authentication verification failed');
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

                // Check if user rejected the signature
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
                    // User cancelled - disconnect wallet
                    console.log(
                        'User cancelled signature - disconnecting wallet'
                    );
                    disconnect(wallet);
                    warning(
                        'Authentication Required',
                        'You must sign the message to use the app.'
                    );
                } else {
                    // Other error - disconnect for security
                    disconnect(wallet);
                    showError(
                        'Authentication Failed',
                        'There was an error during authentication. Please try again.'
                    );
                }
            } finally {
                setIsAuthenticating(false);
            }
        };

        authenticate();
    }, [account?.address, wallet]);

    return { isAuthenticating };
};
