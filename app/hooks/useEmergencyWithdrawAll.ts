'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall, type Chain } from 'thirdweb';
import { client } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';

export type EmergencyWithdrawAllStatus = 'idle' | 'pending' | 'success' | 'error';

interface UseEmergencyWithdrawAllResult {
    trigger: () => Promise<boolean>;
    status: EmergencyWithdrawAllStatus;
    error: string | null;
    reset: () => void;
}

export function useEmergencyWithdrawAll(
    contractAddress: string | undefined,
    chain: Chain
): UseEmergencyWithdrawAllResult {
    const [status, setStatus] = useState<EmergencyWithdrawAllStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const sendOnChain = useChainBoundSend();

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

        try {
            setStatus('pending');

            const pokerContract = getContract({
                client,
                chain,
                address: contractAddress,
            });

            const tx = prepareContractCall({
                contract: pokerContract,
                method: 'function emergencyWithdrawAll()',
                params: [],
            });

            await sendOnChain(chain, tx);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdrawAll] failed:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setStatus('error');
            return false;
        }
    }, [contractAddress, chain, sendOnChain]);

    return { trigger, status, error, reset };
}
