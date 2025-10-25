'use client';

import React from 'react';
import { ConnectButton } from 'thirdweb/react';
import {
    client,
    baseChain,
    supportedTokens,
    wallets,
} from '@/app/thirdwebclient';

interface WalletButtonProps {
    width?: string;
    height?: string;
    className?: string;
    label?: string;
    variant?: 'navbar' | 'home';
}

const WalletButton: React.FC<WalletButtonProps> = ({
    width,
    height,
    className,
    label = 'Sign In',
    variant = 'navbar',
}) => {
    // Navbar variant: pink button like HomeNavBar
    const navbarStyle = {
        width: width || 'auto',
        height: height || '48px',
        minHeight: '48px',
        padding: '12px 20px',
        borderRadius: '12px',
        backgroundColor: '#EB0B5C', // brand.pink
        color: 'white',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '14px',
        lineHeight: '1',
        boxSizing: 'border-box' as const,
        boxShadow: '0 4px 12px rgba(235, 11, 92, 0.3)',
        transition: 'all 0.2s ease',
    };

    // Home variant: larger, matches home page styling
    const homeStyle = {
        width: width || '100%',
        height: height || '76px',
        minHeight: '76px',
        padding: '24px 16px',
        borderRadius: '16px',
        backgroundColor: 'white',
        color: '#EB0B5C', // brand.pink
        border: '2px solid #EB0B5C',
        fontWeight: 'bold',
        fontSize: '16px',
        lineHeight: '1',
        boxSizing: 'border-box' as const,
        transition: 'all 0.2s ease',
    };

    const buttonStyle = variant === 'home' ? homeStyle : navbarStyle;

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
                style: buttonStyle,
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
                style: buttonStyle,
            }}
            connectModal={{
                showThirdwebBranding: false,
                size: 'compact',
                title: 'Connect to Stacked Poker',
            }}
            theme="light"
        />
    );
};

export default WalletButton;
