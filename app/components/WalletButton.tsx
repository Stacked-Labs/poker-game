'use client';

import React from 'react';
import { useMediaQuery } from '@chakra-ui/react';
import { ConnectButton, darkTheme, lightTheme } from 'thirdweb/react';
import {
    client,
    baseChain,
    supportedTokens,
    wallets,
} from '@/app/thirdwebclient';
import { useColorMode } from "@chakra-ui/react";
import { theme } from "@/app/theme";

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
    // Use compact on mobile/small screens, wide on larger screens
    const [isLargerScreen] = useMediaQuery('(min-width: 768px)');
    const modalSize = isLargerScreen ? 'wide' : 'compact';
    const { colorMode } = useColorMode();

    // Only apply size if provided, otherwise use ThirdWeb defaults
    const sizeStyle =
        width || height
            ? {
                ...(width && { width }),
                ...(height && { height, minHeight: height }),
            }
            : undefined;

    const customLightTheme = lightTheme({
        colors: {
            primaryButtonBg: theme.colors.legacy.grayDark,
        }
    })


    const customDarkTheme = darkTheme({
        colors: {
            primaryButtonBg: theme.colors.legacy.grayDarkest,
            primaryButtonText: 'white'
        }
    })

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
                    ...sizeStyle,
                    borderRadius: theme.radii.bigButton,
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
