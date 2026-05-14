'use client';

import { useState, useCallback } from 'react';
import { getContract, prepareContractCall, type Chain } from 'thirdweb';
import { useSendAndConfirmTransaction, useSwitchActiveWalletChain } from 'thirdweb/react';
import { client } from '../thirdwebclient';

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

    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();
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

            await sendAndConfirm(tx);
            setStatus('success');
            return true;
        } catch (err) {
            console.error('[useEmergencyWithdraw] failed:', err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setStatus('error');
            return false;
        }
    }, [contractAddress, chain, sendAndConfirm, switchChain]);

    return { trigger, status, error, reset };
}
