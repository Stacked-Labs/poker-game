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
