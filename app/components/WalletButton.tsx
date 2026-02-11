'use client';

import React from 'react';
import { useMediaQuery } from '@chakra-ui/react';
import { ConnectButton, darkTheme, lightTheme } from 'thirdweb/react';
import {
    client,
    baseSepoliaChain,
    supportedTokens,
    wallets,
} from '@/app/thirdwebclient';
import { useColorMode } from '@chakra-ui/react';
import { theme } from '@/app/theme';

interface WalletButtonProps {
    width?: string;
    height?: string;
    className?: string;
    label?: string;
    variant?: 'default' | 'link' | 'hero';
}

const WalletButton: React.FC<WalletButtonProps> = ({
    width,
    height,
    className,
    label = 'Sign In',
    variant = 'default',
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
            maxWidth: isLargerScreen ? '160px' : '140px',
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

    return (
        <ConnectButton
            client={client}
            chain={baseSepoliaChain}
            wallets={wallets}
            supportedTokens={supportedTokens}
            detailsButton={{
                style: heroDetailsStyle ?? {
                    ...defaultButtonStyle,
                    ...sizeOverrideStyle,
                    borderRadius: variant === 'link' ? '0' : theme.radii.md,
                },
                displayBalanceToken: {
                    [baseSepoliaChain.id]:
                        '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base testnet
                },
            }}
            detailsModal={{
                payOptions: {
                    prefillBuy: {
                        token: {
                            address:
                                '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base testnet
                            name: 'USD Coin',
                            symbol: 'USDC',
                            icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
                        },
                        chain: baseSepoliaChain,
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
