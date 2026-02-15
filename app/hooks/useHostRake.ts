'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { client, baseSepoliaChain } from '../thirdwebclient';

/** USDC uses 6 decimals on Base */
const USDC_DECIMALS = 6;

export type HostRakeStatus =
    | 'idle'
    | 'loading'
    | 'withdrawing'
    | 'success'
    | 'error';

export interface UseHostRakeResult {
    /** Raw balance in USDC micro-units (6 decimals) */
    rakeBalance: bigint | null;
    /** Formatted USDC string e.g. "12.34" */
    rakeUsdcFormatted: string;
    status: HostRakeStatus;
    error: string | null;
    isLoading: boolean;
    refresh: () => Promise<void>;
    withdraw: () => Promise<boolean>;
}

export function useHostRake(contractAddress: string | undefined): UseHostRakeResult {
    const account = useActiveAccount();
    const [rakeBalance, setRakeBalance] = useState<bigint | null>(null);
    const [status, setStatus] = useState<HostRakeStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();

    const refresh = useCallback(async () => {
        if (!account?.address || !contractAddress) {
            setRakeBalance(null);
            return;
        }

        try {
            setStatus('loading');
            const pokerContract = getContract({
                client,
                chain: baseSepoliaChain,
                address: contractAddress,
            });

            const balance = (await readContract({
                contract: pokerContract,
                method: 'function hostWithdrawableBalance(address) view returns (uint256)',
                params: [account.address],
            })) as bigint;

            setRakeBalance(balance);
            setStatus('idle');
            setError(null);
        } catch (err) {
            console.error('[useHostRake] refresh failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to read rake balance');
            setStatus('error');
        }
    }, [account?.address, contractAddress]);

    const withdraw = useCallback(async (): Promise<boolean> => {
        if (!account?.address || !contractAddress) {
            setError('Wallet not connected');
            setStatus('error');
            return false;
        }

        try {
            setStatus('withdrawing');
            const pokerContract = getContract({
                client,
                chain: baseSepoliaChain,
                address: contractAddress,
            });

            const tx = prepareContractCall({
                contract: pokerContract,
                method: 'function withdrawHostRake()',
                params: [],
            });

            await sendAndConfirm(tx);
            setRakeBalance(BigInt(0));
            setStatus('success');
            setError(null);
            return true;
        } catch (err) {
            console.error('[useHostRake] withdraw failed:', err);
            setError(err instanceof Error ? err.message : 'Withdraw failed');
            setStatus('error');
            return false;
        }
    }, [account?.address, contractAddress, sendAndConfirm]);

    // Poll every 30 seconds to pick up new rake from settlements
    useEffect(() => {
        if (!account?.address || !contractAddress) return;

        refresh();

        pollRef.current = setInterval(refresh, 30_000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [account?.address, contractAddress, refresh]);

    // Format to USDC display
    const rakeUsdcFormatted =
        rakeBalance !== null
            ? (Number(rakeBalance) / 10 ** USDC_DECIMALS).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '0.00';

    return {
        rakeBalance,
        rakeUsdcFormatted,
        status,
        error,
        isLoading: status === 'loading' || status === 'withdrawing',
        refresh,
        withdraw,
    };
}
