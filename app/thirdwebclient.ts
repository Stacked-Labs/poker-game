import { createThirdwebClient } from 'thirdweb';
import { base, baseSepolia } from 'thirdweb/chains';
import { createWallet, inAppWallet } from 'thirdweb/wallets';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
    throw new Error('Client ID not found');
}

export const client = createThirdwebClient({
    clientId: clientId,
});

// Chain configuration - Base mainnet
export const baseChain = base;
export const baseSepoliaChain = baseSepolia;

// Supported tokens configuration
export const supportedTokens = {
    // [base.id]: [
    //     {
    //         address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    //         name: 'USD Coin',
    //         symbol: 'USDC',
    //         icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    //     },
    // ],
        [baseSepolia.id]: [
        {
            address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            name: 'USD Coin',
            symbol: 'USDC',
            icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        },
    ],
};

// Wallet providers - Including social login options
export const wallets = [
    // In-App Wallet with social login options
    inAppWallet({
        auth: {
            options: [
                'google',
                'discord',
                'telegram',
                'x',
                'apple',
                'twitch',
                'email',
                'phone',
            ],
        },
    }),
    // Traditional crypto wallets
    createWallet('io.metamask'),
    createWallet('com.coinbase.wallet'),
    createWallet('walletConnect'),
];
