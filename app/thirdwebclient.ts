import { createThirdwebClient } from 'thirdweb';
import { base, baseSepolia } from 'thirdweb/chains';
import { createWallet, inAppWallet } from 'thirdweb/wallets';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? '';

export const client = createThirdwebClient({
    clientId,
});

// ─── Multi-chain config ────────────────────────────────────────────────────
// NEXT_PUBLIC_ENABLED_CHAINS: comma-separated list of chain identifiers.
// Defaults to base-sepolia only so existing deployments are unaffected.

const _enabledChains = (
    process.env.NEXT_PUBLIC_ENABLED_CHAINS || 'base-sepolia'
).split(',').map((s) => s.trim()).filter(Boolean);

export const CHAIN_CONFIG = {
    'base-sepolia': {
        chain: baseSepolia,
        usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    'base': {
        chain: base,
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
} as const;

export type ChainId = keyof typeof CHAIN_CONFIG;

/** Enabled chain identifiers for this deployment. */
export const enabledChains: ChainId[] = _enabledChains.filter(
    (id): id is ChainId => id in CHAIN_CONFIG
);

/** Default chain — first entry in NEXT_PUBLIC_ENABLED_CHAINS (or base-sepolia). */
export const defaultChain =
    CHAIN_CONFIG[enabledChains[0] ?? 'base-sepolia'].chain;

// Keep named exports for code that already imports these directly.
export const baseChain = base;
export const baseSepoliaChain = baseSepolia;

// ─── Supported tokens for ConnectButton ───────────────────────────────────
// Shows USDC balance for every enabled chain inside the wallet modal.
export const supportedTokens = Object.fromEntries(
    enabledChains.map((id) => [
        CHAIN_CONFIG[id].chain.id,
        [
            {
                address: CHAIN_CONFIG[id].usdc,
                name: 'USD Coin',
                symbol: 'USDC',
                icon: '/usdc-logo.png',
            },
        ],
    ])
);

// ─── Wallet providers ─────────────────────────────────────────────────────
export const wallets = [
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
    createWallet('io.metamask'),
    createWallet('com.coinbase.wallet'),
    createWallet('walletConnect'),
];
