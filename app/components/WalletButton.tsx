'use client';

import React, { useEffect, useState } from 'react';
import { ConnectButton } from 'thirdweb/react';
import {
    useActiveAccount,
    useActiveWallet,
    useDisconnect,
} from 'thirdweb/react';
import {
    client,
    baseChain,
    supportedTokens,
    wallets,
} from '@/app/thirdwebclient';
import {
    getAuthPayload,
    verifySignedPayload,
    isAuth,
} from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import { Flex, Spinner, Text } from '@chakra-ui/react';

interface WalletButtonProps {
    width?: string;
    height?: string;
    className?: string;
    label?: string;
}

const WalletButton: React.FC<WalletButtonProps> = ({
    width,
    height,
    className,
    label = 'Sign In',
}) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const { disconnect } = useDisconnect();
    const { success, error: showError, warning } = useToastHelper();
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Auto-authenticate when wallet connects
    useEffect(() => {
        const authenticate = async () => {
            if (!account?.address || !wallet) return;
            if (isAuthenticating) return; // Prevent duplicate auth attempts

            try {
                setIsAuthenticating(true);

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
                const { payload, message } = await getAuthPayload(
                    account.address
                );
                console.log('📝 Message to sign:', message);
                console.log('Payload:', payload);

                // Step 2: Sign the MESSAGE string (not the payload!)
                const signature = await account.signMessage({
                    message: message, // Sign the formatted SIWE message string
                });
                console.log('✍️ Signature:', signature);

                // Step 3: Send payload + signature to backend for verification
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
                    disconnect(wallet);
                    showError(
                        'Authentication Failed',
                        'Signature verification failed. Please try again.'
                    );
                }
            } catch (err: unknown) {
                console.error('Authentication error:', err);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account?.address]);

    // Show loading state during authentication
    if (isAuthenticating && account?.address) {
        return (
            <Flex
                alignItems="center"
                justifyContent="center"
                gap={2}
                px={4}
                py={2}
                borderRadius="md"
                bg="gray.700"
                minH={height || '40px'}
                minW={width || '120px'}
            >
                <Spinner size="sm" color="white" />
                <Text color="white" fontSize="sm" fontWeight="medium">
                    Authenticating...
                </Text>
            </Flex>
        );
    }

    return (
        <ConnectButton
            client={client}
            chain={baseChain}
            wallets={wallets}
            supportedTokens={supportedTokens}
            detailsButton={{
                displayBalanceToken: {
                    [baseChain.id]:
                        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
                },
            }}
            detailsModal={{
                payOptions: {
                    prefillBuy: {
                        token: {
                            address:
                                '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                            name: 'USD Coin',
                            symbol: 'USDC',
                            icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
                        },
                        chain: baseChain,
                        allowEdits: {
                            amount: true,
                            token: false,
                            chain: false,
                        },
                    },
                },
            }}
            connectButton={{
                label: label,
                className: className,
                style: {
                    width: width,
                    height: height,
                },
            }}
            connectModal={{
                showThirdwebBranding: false,
                size: 'compact',
                title: 'Connect to Stacked Poker',
            }}
            theme="dark"
        />
    );
};

export default WalletButton;
