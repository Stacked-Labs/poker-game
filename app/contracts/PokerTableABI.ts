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

// USDC on Base testnet
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

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
