'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { approve, allowance, balanceOf } from 'thirdweb/extensions/erc20';
import { client, baseSepoliaChain } from '../thirdwebclient';
import { USDC_ADDRESS } from '../contracts/PokerTableABI';

export type DepositStatus =
    | 'idle'
    | 'checking_allowance'
    | 'approving'
    | 'depositing'
    | 'success'
    | 'error';

interface UseDepositAndJoinResult {
    depositAndJoin: (chipAmount: number) => Promise<boolean>;
    status: DepositStatus;
    error: string | null;
    usdcBalance: bigint | null;
    isLoading: boolean;
    reset: () => void;
}

export function useDepositAndJoin(contractAddress: string | undefined): UseDepositAndJoinResult {
    const account = useActiveAccount();
    const [status, setStatus] = useState<DepositStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);

    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const fetchUsdcBalance = useCallback(async () => {
        if (!account?.address) return null;

        const usdcContract = getContract({
            client,
            chain: baseSepoliaChain,
            address: USDC_ADDRESS,
        });

        const balance = await balanceOf({
            contract: usdcContract,
            address: account.address,
        });

        setUsdcBalance(balance);
        return balance;
    }, [account?.address]);

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
                // USDC has 6 decimals, 1 chip = 1 USDC
                const usdcAmount = BigInt(chipAmount) * BigInt(1_000_000);

                const usdcContract = getContract({
                    client,
                    chain: baseSepoliaChain,
                    address: USDC_ADDRESS,
                });

                const pokerContract = getContract({
                    client,
                    chain: baseSepoliaChain,
                    address: contractAddress,
                });

                // Step 1: Check USDC balance
                setStatus('checking_allowance');
                const userBalance = await balanceOf({
                    contract: usdcContract,
                    address: account.address,
                });

                if (userBalance < usdcAmount) {
                    setError(
                        `Insufficient USDC balance. You have ${Number(userBalance) / 1_000_000} USDC but need ${chipAmount} USDC.`
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

                // Step 3: Approve if needed
                if (currentAllowance < usdcAmount) {
                    setStatus('approving');

                    const approveTx = approve({
                        contract: usdcContract,
                        spender: contractAddress,
                        amount: chipAmount, // amount in token units (not wei)
                    });

                    await sendAndConfirm(approveTx);
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
        [account?.address, contractAddress, sendAndConfirm]
    );

    return {
        depositAndJoin,
        status,
        error,
        usdcBalance,
        isLoading: status !== 'idle' && status !== 'success' && status !== 'error',
        reset,
    };
}
