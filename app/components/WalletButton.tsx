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
}

const WalletButton: React.FC<WalletButtonProps> = ({
    width,
    height,
    className,
    label = 'Sign In',
}) => {
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
