'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveWalletChain } from 'thirdweb/react';
import { client } from '../thirdwebclient';

export type EmergencyWithdrawStatus = 'idle' | 'pending' | 'success' | 'error';

interface UseEmergencyWithdrawResult {
    trigger: () => Promise<boolean>;
    status: EmergencyWithdrawStatus;
    error: string | null;
    reset: () => void;
}

export function useEmergencyWithdraw(
    contractAddress: string | undefined
): UseEmergencyWithdrawResult {
    const [status, setStatus] = useState<EmergencyWithdrawStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const activeChain = useActiveWalletChain();
    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const trigger = useCallback(async (): Promise<boolean> => {
        if (!contractAddress) {
            setError('No contract address');
            setStatus('error');
            return false;
        }

        if (!activeChain) {
            setError('Wallet not connected');
            setStatus('error');
            return false;
        }

        try {
            setStatus('pending');

            const pokerContract = getContract({
                client,
                chain: activeChain,
                address: contractAddress,
            });

            const tx = prepareContractCall({
                contract: pokerContract,
                method: 'function emergencyWithdraw()',
                params: [],
            });

            await sendAndConfirm(tx);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdraw] failed:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setStatus('error');
            return false;
        }
    }, [contractAddress, activeChain, sendAndConfirm]);

    return { trigger, status, error, reset };
}
