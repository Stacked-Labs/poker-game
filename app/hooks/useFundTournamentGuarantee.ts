'use client';

import { useState, useCallback } from 'react';
import { type Chain, getContract, prepareContractCall } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { approve, allowance } from 'thirdweb/extensions/erc20';
import { client } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';
import { openTournamentRegistration } from './server_actions';

export type FundGuaranteeStatus =
    | 'idle'
    | 'approving'
    | 'depositing'
    | 'opening'
    | 'success'
    | 'error';

interface UseFundTournamentGuaranteeResult {
    fundAndOpen: () => Promise<boolean>;
    status: FundGuaranteeStatus;
    error: string | null;
    isLoading: boolean;
    reset: () => void;
}

export function useFundTournamentGuarantee(
    tournamentId: number | undefined,
    contractAddress: string | undefined,
    chain: Chain | undefined,
    usdcAddress: string | undefined,
    guaranteeAmountUsdc: number, // USDC base units (6 decimals)
): UseFundTournamentGuaranteeResult {
    const account = useActiveAccount();
    const [status, setStatus] = useState<FundGuaranteeStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const sendOnChain = useChainBoundSend();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const fundAndOpen = useCallback(async (): Promise<boolean> => {
        if (!account?.address || !contractAddress || !chain || !usdcAddress || !tournamentId) {
            setError('Missing required parameters');
            setStatus('error');
            return false;
        }

        try {
            const amount = BigInt(guaranteeAmountUsdc);

            const usdcContract = getContract({ client, chain, address: usdcAddress });
            const tournamentContract = getContract({ client, chain, address: contractAddress });

            // Step 1: Approve USDC if needed
            const currentAllowance = await allowance({
                contract: usdcContract,
                owner: account.address,
                spender: contractAddress,
            });

            if (currentAllowance < amount) {
                setStatus('approving');
                await sendOnChain(chain, approve({
                    contract: usdcContract,
                    spender: contractAddress,
                    amountWei: amount,
                }));
            }

            // Step 2: Deposit guarantee into the tournament contract
            setStatus('depositing');
            await sendOnChain(chain, prepareContractCall({
                contract: tournamentContract,
                method: 'function depositHostFunding(uint256 amount)',
                params: [amount],
            }));

            // Step 3: Tell the backend to call openRegistration on-chain + update DB
            setStatus('opening');
            await openTournamentRegistration(tournamentId);

            setStatus('success');
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Transaction failed';
            setError(msg);
            setStatus('error');
            return false;
        }
    }, [
        account?.address,
        tournamentId,
        contractAddress,
        chain,
        usdcAddress,
        guaranteeAmountUsdc,
        sendOnChain,
    ]);

    return {
        fundAndOpen,
        status,
        error,
        isLoading: status !== 'idle' && status !== 'success' && status !== 'error',
        reset,
    };
}
