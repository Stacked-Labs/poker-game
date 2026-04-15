export const POKER_TABLE_ABI = [
    {
        type: 'function',
        name: 'depositAndJoin',
        inputs: [{ name: 'chipAmount', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'USDC_PER_CHIP',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'chipBalance',
        inputs: [{ name: '', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getPlayerInfo',
        inputs: [{ name: 'player', type: 'address', internalType: 'address' }],
        outputs: [
            { name: 'chips', type: 'uint256', internalType: 'uint256' },
            { name: 'usdcDeposited', type: 'uint256', internalType: 'uint256' },
            { name: 'seated', type: 'bool', internalType: 'bool' },
            { name: 'withdrawable', type: 'bool', internalType: 'bool' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isSeated',
        inputs: [{ name: '', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'usdcToken',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'contract IERC20' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'canWithdraw',
        inputs: [{ name: 'player', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'withdrawChips',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'hostWithdrawableBalance',
        inputs: [{ name: '', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'withdrawHostRake',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        name: 'HostRakeWithdrawn',
        inputs: [
            { name: 'host', type: 'address', indexed: true, internalType: 'address' },
            { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'PlayerDeposited',
        inputs: [
            { name: 'player', type: 'address', indexed: true, internalType: 'address' },
            { name: 'usdcAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'chipAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'PlayerSeated',
        inputs: [
            { name: 'player', type: 'address', indexed: true, internalType: 'address' },
        ],
        anonymous: false,
    },
] as const;

// USDC contract addresses per chain.
// Use getUsdcAddress(chainId) instead of the constants directly when the chain
// is not known at compile time.
export const USDC_ADDRESS_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
export const USDC_ADDRESS_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

/** @deprecated Use getUsdcAddress(chainId) or CHAIN_CONFIG from thirdwebclient */
export const USDC_ADDRESS = USDC_ADDRESS_SEPOLIA;

const USDC_BY_CHAIN_ID: Record<number, string> = {
    84532: USDC_ADDRESS_SEPOLIA, // Base Sepolia
    8453:  USDC_ADDRESS_MAINNET, // Base mainnet
};

/** Returns the USDC contract address for the given chain ID. */
export function getUsdcAddress(chainId: number): string {
    const addr = USDC_BY_CHAIN_ID[chainId];
    if (!addr) throw new Error(`No USDC address configured for chain ID ${chainId}`);
    return addr;
}

export const ERC20_ABI = [
    {
        type: 'function',
        name: 'approve',
        inputs: [
            { name: 'spender', type: 'address', internalType: 'address' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'allowance',
        inputs: [
            { name: 'owner', type: 'address', internalType: 'address' },
            { name: 'spender', type: 'address', internalType: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'balanceOf',
        inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ name: '', type: 'uint8', internalType: 'uint8' }],
        stateMutability: 'view',
    },
] as const;
