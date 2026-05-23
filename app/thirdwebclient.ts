import { createThirdwebClient, defineChain, type Chain } from 'thirdweb';
import {
    arbitrum,
    base,
    baseSepolia,
    bsc,
    ethereum,
    optimism,
    polygon,
} from 'thirdweb/chains';
import { createWallet, inAppWallet } from 'thirdweb/wallets';

// HyperEVM (Hyperliquid's L1) — not yet exported as a named chain by
// thirdweb/chains, so define it inline. Chain ID 999.
const hyperEvm = defineChain({
    id: 999,
    name: 'HyperEVM',
    nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
    rpc: 'https://rpc.hyperliquid.xyz/evm',
    blockExplorers: [
        { name: 'HyperEVMScan', url: 'https://hyperevmscan.io' },
    ],
});

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? '';

export const client = createThirdwebClient({
    clientId,
});

// Per-chain configuration: chain object + USDC contract address.
//
// `base` / `base-sepolia` are the chains the smart wallet actually operates on.
// The rest are display-only: their USDC is surfaced in the ConnectButton wallet
// modal so the user can see balances across chains and use thirdweb's built-in
// Pay/Bridge to swap or send cross-chain. The smart account itself stays on Base.
export const CHAIN_CONFIG: Record<string, { chain: Chain; usdc: string }> = {
    'base-sepolia': {
        chain: baseSepolia,
        usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    'base': {
        chain: base,
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    'ethereum': {
        chain: ethereum,
        usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    'arbitrum': {
        chain: arbitrum,
        usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    },
    'optimism': {
        chain: optimism,
        usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    },
    'polygon': {
        chain: polygon,
        usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    },
    'bsc': {
        // Binance-Peg USDC (BSC has no Circle-native USDC issuance).
        chain: bsc,
        usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
    'hyperevm': {
        // Circle-native USDC on Hyperliquid's EVM L1.
        chain: hyperEvm,
        usdc: '0xb88339CB7199b77E23DB6E890353E22632Ba630f',
    },
};

// Chains whose USDC is *displayed* in the wallet widget. Independent of which
// chains the app operationally switches to (`enabledChains`) — we always want
// users to see their cross-chain balances even though the smart account only
// transacts on Base.
const DISPLAY_CHAIN_NAMES = [
    'base',
    'ethereum',
    'arbitrum',
    'optimism',
    'polygon',
    'bsc',
    'hyperevm',
];

// NEXT_PUBLIC_ENABLED_CHAINS is a comma-separated list of chain names, e.g. "base-sepolia,base".
// Defaults to "base-sepolia" for backwards compatibility.
const enabledChainNames = (process.env.NEXT_PUBLIC_ENABLED_CHAINS ?? 'base-sepolia')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const defaultChainName = enabledChainNames[0] ?? 'base-sepolia';

export const defaultChain: Chain = CHAIN_CONFIG[defaultChainName]?.chain ?? baseSepolia;
export const defaultUsdcAddress: string =
    CHAIN_CONFIG[defaultChainName]?.usdc ?? '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// All chains that are currently enabled — pass to ConnectButton's `chains` prop so thirdweb
// knows about them and doesn't prompt "Switch Network" for any of them.
export const enabledChains: Chain[] = enabledChainNames
    .filter((name) => CHAIN_CONFIG[name])
    .map((name) => CHAIN_CONFIG[name].chain);

// supportedTokens maps chain IDs to their USDC token config for thirdweb's
// ConnectButton. Built from DISPLAY_CHAIN_NAMES (a superset of enabledChains)
// so users see USDC balances across multiple chains in the wallet modal and
// can swap/send between them via thirdweb's built-in Pay/Bridge UI. The smart
// account itself only operates on `defaultChain`.
export const supportedTokens = Object.fromEntries(
    DISPLAY_CHAIN_NAMES
        .filter((name) => CHAIN_CONFIG[name])
        .map((name) => {
            const cfg = CHAIN_CONFIG[name];
            return [
                cfg.chain.id,
                [
                    {
                        address: cfg.usdc,
                        name: 'USD Coin',
                        symbol: 'USDC',
                        icon: '/usdc-logo.png',
                    },
                ],
            ];
        })
);

// thirdweb Bridge only supports mainnet chains — testnets return empty token
// lists which crash BuyWidget. Always use these for the TopUp/Bridge UI.
export const MAINNET_CHAIN = base;
export const MAINNET_USDC_ADDRESS = CHAIN_CONFIG['base'].usdc;

// True when the app is configured for testnet only (no mainnet chain enabled).
export const isTestnetOnly = !enabledChainNames.includes('base');

// Bundler / paymaster endpoint for EIP-5792 sendCalls. Format:
//   https://{chainId}.bundler.thirdweb.com/{clientId}
// We pass this as `capabilities.paymasterService.url` so the user's USDC pays
// gas via the Base USDC ERC-20 paymaster. Users never need ETH.
export const BASE_PAYMASTER_URL: string =
    process.env.NEXT_PUBLIC_THIRDWEB_BUNDLER_URL ?? '';

// Wallet providers - Including social login options
export const wallets = [
    inAppWallet({
        // smartAccount turns social-login users into ERC-4337 smart accounts so
        // thirdweb can sponsor gas for them (configured in the dashboard under
        // Sponsored Transactions). Without this they're plain EOAs with no way
        // to pay gas until they've already onboarded USDC.
        //
        // factoryAddress is pinned so the smart-account address a user
        // gets is stable across sessions and matches what was used at
        // create-table / SIWE time. Without pinning, thirdweb can resolve
        // to a different default factory and the predicted address drifts
        // — which breaks owner-match (table.ownerAddress vs the new
        // useActiveAccount().address) and orphans funds sent to the old
        // counterfactual address. Must stay in sync with the backend's
        // SIWE_ALLOWED_FACTORIES.
        smartAccount: {
            chain: defaultChain,
            sponsorGas: true,
            factoryAddress: '0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00',
        },
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
    // Traditional crypto wallets. 7702 upgrade for these happens at
    // sendCalls-time via EIP-5792 (no wallet-level config needed here).
    createWallet('io.metamask'),
    createWallet('com.coinbase.wallet'),
    createWallet('walletConnect'),
];
