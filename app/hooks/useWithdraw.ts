'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveAccount } from 'thirdweb/react';
import { client, baseSepoliaChain } from '../thirdwebclient';

export type WithdrawStatus =
    | 'idle'
    | 'checking'
    | 'withdrawing'
    | 'success'
    | 'error';

interface UseWithdrawResult {
    withdraw: () => Promise<boolean>;
    checkCanWithdraw: () => Promise<boolean>;
    canWithdraw: boolean | null;
    chipBalance: bigint | null;
    status: WithdrawStatus;
    error: string | null;
    isLoading: boolean;
    reset: () => void;
}

export function useWithdraw(contractAddress: string | undefined): UseWithdrawResult {
    const account = useActiveAccount();
    const [status, setStatus] = useState<WithdrawStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [canWithdrawState, setCanWithdrawState] = useState<boolean | null>(null);
    const [chipBalance, setChipBalance] = useState<bigint | null>(null);

    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const checkCanWithdraw = useCallback(async (): Promise<boolean> => {
        if (!account?.address) {
            setCanWithdrawState(false);
            return false;
        }

        if (!contractAddress) {
            setCanWithdrawState(false);
            return false;
        }

        try {
            setStatus('checking');

            const pokerContract = getContract({
                client,
                chain: baseSepoliaChain,
                address: contractAddress,
            });

            // Check if player can withdraw
            const canWithdrawResult = await readContract({
                contract: pokerContract,
                method: 'function canWithdraw(address player) view returns (bool)',
                params: [account.address],
            }) as boolean;

            // Get chip balance
            const balance = await readContract({
                contract: pokerContract,
                method: 'function chipBalance(address) view returns (uint256)',
                params: [account.address],
            }) as bigint;

            setCanWithdrawState(canWithdrawResult);
            setChipBalance(balance);
            setStatus('idle');
            return canWithdrawResult;
        } catch (err) {
            console.error('[useWithdraw] Failed to check withdraw status:', err);
            setCanWithdrawState(false);
            setStatus('idle');
            return false;
        }
    }, [account?.address, contractAddress]);

    const withdraw = useCallback(async (): Promise<boolean> => {
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
            setStatus('withdrawing');

            const pokerContract = getContract({
                client,
                chain: baseSepoliaChain,
                address: contractAddress,
            });

            const withdrawTx = prepareContractCall({
                contract: pokerContract,
                method: 'function withdrawChips()',
                params: [],
            });

            await sendAndConfirm(withdrawTx);

            setStatus('success');
            setCanWithdrawState(false);
            setChipBalance(BigInt(0));
            return true;
        } catch (err) {
            console.error('Withdraw failed:', err);
            setError(err instanceof Error ? err.message : 'Withdraw failed');
            setStatus('error');
            return false;
        }
    }, [account?.address, contractAddress, sendAndConfirm]);

    return {
        withdraw,
        checkCanWithdraw,
        canWithdraw: canWithdrawState,
        chipBalance,
        status,
        error,
        isLoading: status === 'checking' || status === 'withdrawing',
        reset,
    };
}
