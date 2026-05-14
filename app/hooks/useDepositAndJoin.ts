'use client';

import { useState, useCallback } from 'react';
import { type Chain } from 'thirdweb';
import { getContract, prepareContractCall } from 'thirdweb';
import { useActiveAccount, useSwitchActiveWalletChain } from 'thirdweb/react';
import { approve, allowance, balanceOf } from 'thirdweb/extensions/erc20';
import { client } from '../thirdwebclient';
import { useStackedTransaction } from './useStackedTransaction';

export type DepositStatus =
    | 'idle'
    | 'checking_balance'
    | 'submitting'
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

export function useDepositAndJoin(
    contractAddress: string | undefined,
    chain: Chain,
    usdcAddress: string,
): UseDepositAndJoinResult {
    const account = useActiveAccount();
    const [status, setStatus] = useState<DepositStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);

    const sendStackedTx = useStackedTransaction();
    const switchChain = useSwitchActiveWalletChain();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const fetchUsdcBalance = useCallback(async () => {
        if (!account?.address) return null;

        const usdcContract = getContract({
            client,
            chain,
            address: usdcAddress,
        });

        const balance = await balanceOf({
            contract: usdcContract,
            address: account.address,
        });

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

                const usdcContract = getContract({
                    client,
                    chain,
                    address: usdcAddress,
                });

                const pokerContract = getContract({
                    client,
                    chain,
                    address: contractAddress,
                });

                await switchChain(chain);

                // Balance check (UX gate — the smart-account validates onchain too).
                setStatus('checking_balance');
                const userBalance = await balanceOf({
                    contract: usdcContract,
                    address: account.address,
                });

                if (userBalance < usdcAmount) {
                    const requiredUsdc = (
                        chipAmount / CHIPS_PER_USDC
                    ).toFixed(2);
                    const availableUsdc = (
                        Number(userBalance) / 1_000_000
                    ).toFixed(2);
                    setError(
                        `Insufficient USDC balance. You have ${availableUsdc} USDC but need ${requiredUsdc} USDC.`
                    );
                    setStatus('error');
                    return false;
                }

                // Build approve + depositAndJoin as a batched bundle. With
                // EIP-5792 these submit atomically — no allowance polling
                // needed because the deposit can't observe a stale allowance.
                // Skip the approve call if allowance is already sufficient
                // (saves the user a paymaster fee on subsequent buy-ins).
                const currentAllowance = await allowance({
                    contract: usdcContract,
                    owner: account.address,
                    spender: contractAddress,
                });

                const calls = [] as ReturnType<typeof prepareContractCall>[];
                if (currentAllowance < usdcAmount) {
                    calls.push(
                        approve({
                            contract: usdcContract,
                            spender: contractAddress,
                            amountWei: usdcAmount,
                        })
                    );
                }
                calls.push(
                    prepareContractCall({
                        contract: pokerContract,
                        method: 'function depositAndJoin(uint256 chipAmount)',
                        params: [BigInt(chipAmount)],
                    })
                );

                setStatus('submitting');
                await sendStackedTx(calls);

                setStatus('success');
                return true;
            } catch (err) {
                console.error('Deposit and join failed:', err);
                setError(err instanceof Error ? err.message : 'Transaction failed');
                setStatus('error');
                return false;
            }
        },
        [account?.address, contractAddress, chain, usdcAddress, sendStackedTx, switchChain]
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
