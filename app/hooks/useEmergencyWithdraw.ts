'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall, type Chain } from 'thirdweb';
import { useSwitchActiveWalletChain } from 'thirdweb/react';
import { client } from '../thirdwebclient';
import { useStackedTransaction } from './useStackedTransaction';

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

    // emergencyFallback=true: if the paymaster/bundler is down, fall back to
    // serial submit so users can always evacuate their stake.
    const sendStackedTx = useStackedTransaction({ emergencyFallback: true });
    const switchChain = useSwitchActiveWalletChain();

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
            await switchChain(chain);

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

            await sendStackedTx([tx]);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdraw] failed:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setStatus('error');
            return false;
        }
    }, [contractAddress, chain, sendStackedTx, switchChain]);

    return { trigger, status, error, reset };
}
