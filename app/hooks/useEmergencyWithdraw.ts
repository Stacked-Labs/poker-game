'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall, type Chain } from 'thirdweb';
import { client } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';
import { friendlyError } from '../utils/toastErrors';

export type EmergencyWithdrawStatus = 'idle' | 'pending' | 'success' | 'error';

interface UseEmergencyWithdrawResult {
    trigger: () => Promise<boolean>;
    status: EmergencyWithdrawStatus;
    error: string | null;
    reset: () => void;
}

export function useEmergencyWithdraw(
    contractAddress: string | undefined,
    chain: Chain
): UseEmergencyWithdrawResult {
    const [status, setStatus] = useState<EmergencyWithdrawStatus>('idle');
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
                method: 'function emergencyWithdraw()',
                params: [],
            });

            await sendOnChain(chain, tx);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdraw] failed:', err);
            const { description } = friendlyError(err, {
                title: '',
                description:
                    'Something went wrong submitting the withdrawal. Please try again.',
            });
            setError(description ?? 'Please try again.');
            setStatus('error');
            return false;
        }
    }, [contractAddress, chain, sendOnChain]);

    return { trigger, status, error, reset };
}
