'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall } from 'thirdweb';
import { useSendAndConfirmTransaction, useActiveWalletChain } from 'thirdweb/react';
import { client } from '../thirdwebclient';

export type EmergencyWithdrawAllStatus = 'idle' | 'pending' | 'success' | 'error';

interface UseEmergencyWithdrawAllResult {
    trigger: () => Promise<boolean>;
    status: EmergencyWithdrawAllStatus;
    error: string | null;
    reset: () => void;
}

export function useEmergencyWithdrawAll(
    contractAddress: string | undefined
): UseEmergencyWithdrawAllResult {
    const [status, setStatus] = useState<EmergencyWithdrawAllStatus>('idle');
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
                method: 'function emergencyWithdrawAll()',
                params: [],
            });

            await sendAndConfirm(tx);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdrawAll] failed:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setStatus('error');
            return false;
        }
    }, [contractAddress, activeChain, sendAndConfirm]);

    return { trigger, status, error, reset };
}
