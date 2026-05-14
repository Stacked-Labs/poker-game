'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall, type Chain } from 'thirdweb';
import { useSwitchActiveWalletChain } from 'thirdweb/react';
import { client } from '../thirdwebclient';
import { useStackedTransaction } from './useStackedTransaction';

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
                method: 'function emergencyWithdrawAll()',
                params: [],
            });

            await sendStackedTx([tx]);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdrawAll] failed:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setStatus('error');
            return false;
        }
    }, [contractAddress, chain, sendStackedTx, switchChain]);

    return { trigger, status, error, reset };
}
