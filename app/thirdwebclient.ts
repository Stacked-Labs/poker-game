import { createThirdwebClient, type Chain } from 'thirdweb';
import { base, baseSepolia } from 'thirdweb/chains';
import { createWallet, inAppWallet } from 'thirdweb/wallets';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? '';

export const client = createThirdwebClient({
    clientId,
});

// Per-chain configuration: chain object + USDC contract address.
export const CHAIN_CONFIG: Record<string, { chain: Chain; usdc: string }> = {
    'base-sepolia': {
        chain: baseSepolia,
        usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    },
    'base': {
        chain: base,
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
};

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

// supportedTokens maps chain IDs to their USDC token config for thirdweb's ConnectButton.
export const supportedTokens = Object.fromEntries(
    enabledChainNames
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

// Bundler / paymaster endpoint for EIP-5792 sendCalls. Format:
//   https://{chainId}.bundler.thirdweb.com/{clientId}
// We pass this as `capabilities.paymasterService.url` so the user's USDC pays
// gas via the Base USDC ERC-20 paymaster. Users never need ETH.
export const BASE_PAYMASTER_URL: string =
    process.env.NEXT_PUBLIC_THIRDWEB_BUNDLER_URL ?? '';

// Wallet providers - Including social login options
export const wallets = [
    // In-App Wallet with social login options.
    // executionMode EIP7702 upgrades the user's EOA to a smart account at the
    // same address. sponsorGas:false means we don't blanket-sponsor — gas is
    // paid in USDC via the paymaster attached to each sendCalls (see
    // useStackedTransaction).
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
        executionMode: {
            mode: 'EIP7702',
            sponsorGas: false,
        },
    }),
    // Traditional crypto wallets. 7702 upgrade for these happens at
    // sendCalls-time via EIP-5792 (no wallet-level config needed here).
    createWallet('io.metamask'),
    createWallet('com.coinbase.wallet'),
    createWallet('walletConnect'),
];
