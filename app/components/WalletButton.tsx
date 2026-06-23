'use client';

import React from 'react';
import { useMediaQuery } from '@chakra-ui/react';
import { ConnectButton, darkTheme, lightTheme, useActiveWallet } from 'thirdweb/react';
import { type Chain } from 'thirdweb';
import {
    client,
    defaultChain,
    defaultUsdcAddress,
    enabledChains,
    supportedTokens,
    wallets,
} from '@/app/thirdwebclient';
import { useColorMode } from '@chakra-ui/react';
import { theme } from '@/app/theme';
import { useAuth } from '@/app/contexts/AuthContext';

interface WalletButtonProps {
    width?: string;
    height?: string;
    className?: string;
    label?: string;
    variant?: 'default' | 'link' | 'hero' | 'cta';
    /** When set, ConnectButton will prompt "Switch Network" if the wallet is on a different chain. */
    chain?: Chain;
}

const WalletButton: React.FC<WalletButtonProps> = ({
    width,
    height,
    className,
    label = 'Sign In',
    variant = 'default',
    chain: requiredChain,
}) => {
    // Use compact on mobile/small screens, wide on larger screens
    const [isLargerScreen] = useMediaQuery('(min-width: 768px)');
    const modalSize = isLargerScreen ? 'wide' : 'compact';
    const { colorMode } = useColorMode();

    const defaultButtonHeight = isLargerScreen ? '48px' : '40px';
    const hasExplicitSize = Boolean(width || height);

    const defaultButtonStyle: React.CSSProperties = (() => {
        if (variant === 'link') {
            return {
                background: 'transparent',
                border: 'none',
                color: colorMode === 'light' ? '#334479' : '#ECEEF5', // brand.navy / brand.lightGray
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'underline',
                padding: 0,
                height: 'auto',
                minHeight: 'auto',
            };
        }

        if (variant === 'hero') {
            return {
                background: 'transparent',
                border: `2px solid ${colorMode === 'light' ? 'rgba(51, 68, 121, 0.15)' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '16px',
                padding: '12px 20px',
                fontSize: '15px',
                fontWeight: 700,
                height: '52px',
                width: '100%',
                color: colorMode === 'light' ? '#334479' : '#ECEEF5',
            };
        }

        if (hasExplicitSize) {
            // Used by places like TakeSeatModal/HomeNavBar where the button should follow the local layout.
            return {
                height: height ?? defaultButtonHeight,
                minHeight: height ?? defaultButtonHeight,
                paddingInline: '16px',
                paddingBlock: 0,
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: 1,
                width: width ?? 'auto',
                minWidth: 'unset',
            };
        }

        // Default compact styling for tight navbar rows.
        return {
            height: defaultButtonHeight,
            minHeight: defaultButtonHeight,
            paddingInline: isLargerScreen ? '14px' : '12px',
            paddingBlock: 0,
            fontSize: isLargerScreen ? '14px' : '13px',
            fontWeight: 600,
            lineHeight: 1,
            width: 'auto',
            minWidth: 'unset',
            maxWidth: isLargerScreen ? '200px' : '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        };
    })();

    const sizeOverrideStyle: React.CSSProperties | undefined =
        width || height
            ? {
                  ...(width && { width }),
                  ...(height && { height, minHeight: height }),
              }
            : undefined;

    // Eye-catching "Sign In" CTA: mirrors the site's primary `tactilePrimary`
    // button (solid brand green, white label, the same raised tactile shadow) so
    // signing in is the loudest action in the navbar. Only the logged-out connect
    // button gets this treatment; once connected, the details/balance chip falls
    // back to the neutral default below so it doesn't shout an already-done action.
    const ctaConnectStyle: React.CSSProperties = {
        background: theme.colors.brand.green,
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '15px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        height: height ?? '48px',
        minHeight: height ?? '48px',
        paddingInline: '20px',
        width: width ?? 'auto',
        minWidth: 'unset',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 #22674E',
    };

    const heroDetailsStyle: React.CSSProperties | null =
        variant === 'hero'
            ? {
                  background:
                      colorMode === 'light'
                          ? 'linear-gradient(135deg, rgba(54, 163, 123, 0.04), rgba(54, 163, 123, 0.08))'
                          : 'linear-gradient(135deg, rgba(54, 163, 123, 0.08), rgba(54, 163, 123, 0.14))',
                  border: `1.5px solid ${colorMode === 'light' ? 'rgba(54, 163, 123, 0.18)' : 'rgba(54, 163, 123, 0.28)'}`,
                  borderRadius: '16px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: 'auto',
                  minHeight: '52px',
                  width: '100%',
              }
            : null;

    const customLightTheme = lightTheme({
        colors: {
            primaryButtonBg: theme.colors.legacy.grayDark,
        },
    });

    const customDarkTheme = darkTheme({
        colors: {
            primaryButtonBg: theme.colors.legacy.grayDarkest,
            primaryButtonText: 'white',
        },
    });

    // Use the required chain for balance display if specified, otherwise fall back to default.
    const displayChain = requiredChain ?? defaultChain;

    // In-app (social-login) smart accounts are single-chain and CANNOT switch
    // networks (see thirdwebclient.ts / useChainBoundSend). Passing `chain` to
    // ConnectButton makes thirdweb render a non-functional "Switch Network"
    // button whenever the table chain differs from the wallet's home chain —
    // cross-chain sends are already handled transparently by useChainBoundSend.
    // Only enforce `chain` for external EOAs, which can actually switch.
    const activeWallet = useActiveWallet();
    const enforcedChain =
        activeWallet?.id === 'inApp' ? undefined : requiredChain;

    // A deliberate "Disconnect Wallet" click ends the SIWE session too — otherwise the JWT
    // cookie would outlive the wallet the user just disconnected (a stale session on a shared
    // browser). thirdweb fires this ONLY for the in-modal disconnect, not for AutoConnect
    // failures or transient drops, so it never strands a table-balanced / reconnecting player.
    const { logout } = useAuth();

    return (
        <ConnectButton
            client={client}
            chain={enforcedChain}
            chains={enabledChains}
            wallets={wallets}
            supportedTokens={supportedTokens}
            onDisconnect={() => {
                void logout();
            }}
            detailsButton={{
                style: heroDetailsStyle ?? {
                    ...defaultButtonStyle,
                    ...sizeOverrideStyle,
                    borderRadius: variant === 'link' ? '0' : theme.radii.md,
                },
                displayBalanceToken: {
                    [displayChain.id]: defaultUsdcAddress,
                },
            }}
            detailsModal={{
                payOptions: {
                    prefillBuy: {
                        token: {
                            address: defaultUsdcAddress,
                            name: 'USD Coin',
                            symbol: 'USDC',
                            icon: '/usdc-logo.png',
                        },
                        chain: displayChain,
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
                style:
                    variant === 'cta'
                        ? ctaConnectStyle
                        : {
                              ...defaultButtonStyle,
                              ...sizeOverrideStyle,
                              borderRadius:
                                  variant === 'link'
                                      ? '0'
                                      : variant === 'hero'
                                        ? '16px'
                                        : theme.radii.md,
                          },
            }}
            connectModal={{
                showThirdwebBranding: false,
                size: modalSize,
                title: 'Log In',
            }}
            theme={colorMode == 'light' ? customLightTheme : customDarkTheme}
        />
    );
};

export default WalletButton;
