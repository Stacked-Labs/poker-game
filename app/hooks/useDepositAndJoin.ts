'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { approve, allowance, balanceOf } from 'thirdweb/extensions/erc20';
import { client, CHAIN_CONFIG, defaultChain } from '../thirdwebclient';
import { getUsdcAddress } from '../contracts/PokerTableABI';

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
const ALLOWANCE_POLL_INTERVAL_MS = 1500;
const ALLOWANCE_POLL_MAX_ATTEMPTS = 10;

export type DepositStatus =
    | 'idle'
    | 'checking_allowance'
    | 'approving'
    | 'depositing'
    | 'success'
    | 'error';

const USDC_MICRO_PER_CHIP = BigInt(10_000);
const CHIPS_PER_USDC = 100;

interface UseDepositAndJoinResult {
    depositAndJoin: (chipAmount: number) => Promise<boolean>;
    status: DepositStatus;
    error: string | null;
    usdcBalance: bigint | null;
    isLoading: boolean;
    reset: () => void;
    refreshBalance: () => Promise<bigint | null>;
}

/**
 * @param contractAddress  The deployed PokerTable contract address.
 * @param chainId          The chain ID of the table's network (e.g. 84532 for Sepolia, 8453 for mainnet).
 *                         Defaults to the deployment's defaultChain.
 */
export function useDepositAndJoin(
    contractAddress: string | undefined,
    chainId?: number
): UseDepositAndJoinResult {
    const account = useActiveAccount();
    const [status, setStatus] = useState<DepositStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);

    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();

    // Resolve the thirdweb chain object and USDC address from the provided chainId.
    const chain = (() => {
        if (!chainId) return defaultChain;
        const entry = Object.values(CHAIN_CONFIG).find((c) => c.chain.id === chainId);
        return entry?.chain ?? defaultChain;
    })();

    const usdcAddress = (() => {
        try { return getUsdcAddress(chain.id); }
        catch { return getUsdcAddress(defaultChain.id); }
    })();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const fetchUsdcBalance = useCallback(async () => {
        if (!account?.address) return null;

        const usdcContract = getContract({ client, chain, address: usdcAddress });
        const balance = await balanceOf({ contract: usdcContract, address: account.address });
        setUsdcBalance(balance);
        return balance;
    }, [account?.address, chain, usdcAddress]);

    const depositAndJoin = useCallback(
        async (chipAmount: number): Promise<boolean> => {
            if (!account?.address) {
                setError('Wallet not connected');
                setStatus('error');
                return false;
            }

            if (!contractAddress) {
                setError('Contract address not available');
                setStatus('error');
                return false;
            }

            try {
                // USDC has 6 decimals, 100 chips = 1 USDC
                const usdcAmount = BigInt(chipAmount) * USDC_MICRO_PER_CHIP;

                const usdcContract = getContract({ client, chain, address: usdcAddress });
                const pokerContract = getContract({ client, chain, address: contractAddress });

                // Step 1: Check USDC balance
                setStatus('checking_allowance');
                const userBalance = await balanceOf({ contract: usdcContract, address: account.address });

                if (userBalance < usdcAmount) {
                    const requiredUsdc = (chipAmount / CHIPS_PER_USDC).toFixed(2);
                    const availableUsdc = (Number(userBalance) / 1_000_000).toFixed(2);
                    setError(
                        `Insufficient USDC balance. You have ${availableUsdc} USDC but need ${requiredUsdc} USDC.`
                    );
                    setStatus('error');
                    return false;
                }

                // Step 2: Check allowance
                const currentAllowance = await allowance({
                    contract: usdcContract,
                    owner: account.address,
                    spender: contractAddress,
                });

                // Step 3: Approve max if needed (one-time approval)
                if (currentAllowance < usdcAmount) {
                    setStatus('approving');

                    const approveTx = approve({
                        contract: usdcContract,
                        spender: contractAddress,
                        amountWei: MAX_UINT256,
                    });

                    await sendAndConfirm(approveTx);

                    // Wait for allowance to propagate — RPC nodes can lag behind
                    let confirmed = false;
                    for (let i = 0; i < ALLOWANCE_POLL_MAX_ATTEMPTS; i++) {
                        const updatedAllowance = await allowance({
                            contract: usdcContract,
                            owner: account.address,
                            spender: contractAddress,
                        });
                        if (updatedAllowance >= usdcAmount) {
                            confirmed = true;
                            break;
                        }
                        await new Promise((r) => setTimeout(r, ALLOWANCE_POLL_INTERVAL_MS));
                    }

                    if (!confirmed) {
                        setError('USDC approval confirmed on-chain but not yet visible. Please try again.');
                        setStatus('error');
                        return false;
                    }
                }

                // Step 4: Deposit and join
                setStatus('depositing');

                const depositTx = prepareContractCall({
                    contract: pokerContract,
                    method: 'function depositAndJoin(uint256 chipAmount)',
                    params: [BigInt(chipAmount)],
                });

                await sendAndConfirm(depositTx);

                setStatus('success');
                return true;
            } catch (err) {
                console.error('Deposit and join failed:', err);
                setError(err instanceof Error ? err.message : 'Transaction failed');
                setStatus('error');
                return false;
            }
        },
        [account?.address, contractAddress, chain, usdcAddress, sendAndConfirm]
    );

    return {
        depositAndJoin,
        status,
        error,
        usdcBalance,
        isLoading: status !== 'idle' && status !== 'success' && status !== 'error',
        reset,
        refreshBalance: fetchUsdcBalance,
    };
}
