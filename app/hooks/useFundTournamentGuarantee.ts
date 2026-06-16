'use client';

import { useState, useCallback, useRef } from 'react';
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

    // Tracks that the on-chain deposit already confirmed for the current
    // (tournament, amount) funding, so a retry after a backend failure skips the
    // deposit and only re-runs openTournamentRegistration — never double-funding.
    const depositedRef = useRef<string | null>(null);
    // In-flight guard: a concurrent second call returns early.
    const inFlightRef = useRef(false);

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

        if (inFlightRef.current) return false;
        inFlightRef.current = true;

        // A genuinely new funding (different tournament/contract/amount) invalidates
        // any prior confirmed deposit.
        const fundingKey = `${tournamentId}:${contractAddress}:${guaranteeAmountUsdc}`;
        if (depositedRef.current !== fundingKey) {
            depositedRef.current = null;
        }

        try {
            const amount = BigInt(guaranteeAmountUsdc);

            const usdcContract = getContract({ client, chain, address: usdcAddress });
            const tournamentContract = getContract({ client, chain, address: contractAddress });

            // Skip the deposit entirely on a retry where it already confirmed —
            // re-depositing would double-fund the host.
            if (depositedRef.current !== fundingKey) {
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
                depositedRef.current = fundingKey;
            }

            // Step 3: Tell the backend to call openRegistration on-chain + update DB
            setStatus('opening');
            await openTournamentRegistration(tournamentId);

            // Fully succeeded — clear the deposited flag so a future genuinely new
            // funding starts clean.
            depositedRef.current = null;
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
