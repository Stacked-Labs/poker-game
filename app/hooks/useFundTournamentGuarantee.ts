'use client';

import { useState, useCallback, useRef } from 'react';
import {
    type Chain,
    getContract,
    prepareContractCall,
    readContract,
} from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { approve, allowance } from 'thirdweb/extensions/erc20';
import { client } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';

export type FundGuaranteeStatus =
    | 'idle'
    | 'checking'
    | 'approving'
    | 'depositing'
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

    // In-flight guard: a concurrent second call returns early.
    const inFlightRef = useRef(false);

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    // Deposits the host's guarantee on-chain. Registration is NOT opened here —
    // the indexer emits HostFundingDeposited, and poker-server opens registration
    // off the back of that event (with the scheduler as a fallback). So the host's
    // browser only has to land the deposit; closing the tab afterwards no longer
    // strands the tournament in "funding".
    //
    // The amount actually deposited is the SHORTFALL between the guarantee and what
    // the contract already holds (read on-chain). That makes the action idempotent:
    // a retry after a dropped tab — or a host returning to an already-funded
    // tournament — deposits nothing instead of double-funding.
    const fundAndOpen = useCallback(async (): Promise<boolean> => {
        if (!account?.address || !contractAddress || !chain || !usdcAddress || !tournamentId) {
            setError('Missing required parameters');
            setStatus('error');
            return false;
        }

        if (inFlightRef.current) return false;
        inFlightRef.current = true;

        try {
            const guarantee = BigInt(guaranteeAmountUsdc);

            const usdcContract = getContract({ client, chain, address: usdcAddress });
            const tournamentContract = getContract({ client, chain, address: contractAddress });

            // Read what the contract already holds so we only top up the shortfall.
            setStatus('checking');
            const deposited = await readContract({
                contract: tournamentContract,
                method: 'function hostFundingDeposited() view returns (uint256)',
                params: [],
            });

            const shortfall = deposited >= guarantee ? BigInt(0) : guarantee - deposited;

            if (shortfall > BigInt(0)) {
                // Approve only the shortfall if the current allowance can't cover it.
                const currentAllowance = await allowance({
                    contract: usdcContract,
                    owner: account.address,
                    spender: contractAddress,
                });

                if (currentAllowance < shortfall) {
                    setStatus('approving');
                    await sendOnChain(chain, approve({
                        contract: usdcContract,
                        spender: contractAddress,
                        amountWei: shortfall,
                    }));
                }

                setStatus('depositing');
                await sendOnChain(chain, prepareContractCall({
                    contract: tournamentContract,
                    method: 'function depositHostFunding(uint256 amount)',
                    params: [shortfall],
                }));
            }

            // Funded (or already was). The backend opens registration from the
            // indexer's funding event — nothing more to do client-side.
            setStatus('success');
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Transaction failed';
            setError(msg);
            setStatus('error');
            return false;
        } finally {
            inFlightRef.current = false;
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
