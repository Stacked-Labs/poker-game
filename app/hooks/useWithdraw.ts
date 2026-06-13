'use client';

import { useState, useCallback } from 'react';
import { type Chain } from 'thirdweb';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import {
    useActiveAccount,
    useActiveWallet,
} from 'thirdweb/react';
import { getWalletBalance } from 'thirdweb/wallets';
import { client } from '../thirdwebclient';
import { useChainBoundSend } from './useChainBoundSend';

export type WithdrawStatus =
    | 'idle'
    | 'checking'
    | 'withdrawing'
    | 'success'
    | 'error';

// Minimum native (ETH) balance required for an external EOA to execute a
// withdrawChips() tx on Base. Mirrors useDepositAndJoin: ~0.00005 ETH gives a
// ~50× safety margin over typical Base gas. inApp wallets sponsor gas via
// the thirdweb dashboard so this check is skipped for them.
const MIN_NATIVE_BALANCE_WEI = BigInt(50_000_000_000_000);

interface UseWithdrawResult {
    withdraw: () => Promise<boolean>;
    checkCanWithdraw: () => Promise<boolean>;
    canWithdraw: boolean | null;
    chipBalance: bigint | null;
    /**
     * True when the active wallet is an external EOA and its native ETH
     * balance on the table's chain is below MIN_NATIVE_BALANCE_WEI. Always
     * false for inApp wallets (sponsored gas). Null until checkCanWithdraw
     * has read the balance.
     */
    isGasInsufficient: boolean | null;
    status: WithdrawStatus;
    error: string | null;
    isLoading: boolean;
    reset: () => void;
}

export function useWithdraw(
    contractAddress: string | undefined,
    chain: Chain
): UseWithdrawResult {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const [status, setStatus] = useState<WithdrawStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [canWithdrawState, setCanWithdrawState] = useState<boolean | null>(
        null
    );
    const [chipBalance, setChipBalance] = useState<bigint | null>(null);
    const [isGasInsufficient, setIsGasInsufficient] = useState<boolean | null>(
        null
    );

    const sendOnChain = useChainBoundSend();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const checkCanWithdraw = useCallback(async (): Promise<boolean> => {
        if (!account?.address) {
            setCanWithdrawState(false);
            return false;
        }

        if (!contractAddress) {
            setCanWithdrawState(false);
            return false;
        }

        try {
            setStatus('checking');

            const pokerContract = getContract({
                client,
                chain: chain,
                address: contractAddress,
            });

            // Fetch withdraw eligibility, chip balance, and native ETH balance
            // in parallel. Native balance only matters for external EOAs —
            // inApp wallets have sponsored gas, so skip the read entirely
            // there to keep the request small.
            const isInAppWallet = wallet?.id === 'inApp';
            const [canWithdrawResult, balance, nativeBal] = await Promise.all([
                readContract({
                    contract: pokerContract,
                    method: 'function canWithdraw(address player) view returns (bool)',
                    params: [account.address],
                }) as Promise<boolean>,
                readContract({
                    contract: pokerContract,
                    method: 'function chipBalance(address) view returns (uint256)',
                    params: [account.address],
                }) as Promise<bigint>,
                isInAppWallet
                    ? Promise.resolve(null)
                    : getWalletBalance({
                          address: account.address,
                          client,
                          chain,
                      }).catch(() => null),
            ]);

            setCanWithdrawState(canWithdrawResult);
            setChipBalance(balance);
            if (isInAppWallet) {
                setIsGasInsufficient(false);
            } else if (nativeBal) {
                setIsGasInsufficient(nativeBal.value < MIN_NATIVE_BALANCE_WEI);
            }
            setStatus('idle');
            return canWithdrawResult;
        } catch (err) {
            console.error('[useWithdraw] Failed to check withdraw status:', err);
            setCanWithdrawState(false);
            setStatus('idle');
            return false;
        }
    }, [account?.address, contractAddress, chain, wallet?.id]);

    const withdraw = useCallback(async (): Promise<boolean> => {
        if (!account?.address) {
            setError('Wallet not connected');
            setStatus('error');
            return false;
        }

        if (!contractAddress) {
            setError('Contract address not available');
            setStatus('error');
            return false;
        }

        try {
            setStatus('withdrawing');

            const pokerContract = getContract({
                client,
                chain: chain,
                address: contractAddress,
            });

            const withdrawTx = prepareContractCall({
                contract: pokerContract,
                method: 'function withdrawChips()',
                params: [],
            });

            await sendOnChain(chain, withdrawTx);

            setStatus('success');
            setCanWithdrawState(false);
            setChipBalance(BigInt(0));
            return true;
        } catch (err) {
            console.error('Withdraw failed:', err);
            const rawMessage =
                err instanceof Error ? err.message : 'Withdraw failed';
            // Mirror useDepositAndJoin: map wallet-provider gas-shortage
            // strings into actionable copy so the user knows the fix.
            const looksLikeGasShortage =
                /insufficient funds|exceeds balance|gas required exceeds/i.test(
                    rawMessage
                );
            setError(
                looksLikeGasShortage
                    ? 'Not enough ETH on Base for gas. Swap a tiny bit of USDC for ETH and try again.'
                    : rawMessage
            );
            setStatus('error');
            return false;
        }
    }, [account?.address, contractAddress, chain, sendOnChain]);

    return {
        withdraw,
        checkCanWithdraw,
        canWithdraw: canWithdrawState,
        chipBalance,
        isGasInsufficient,
        status,
        error,
        isLoading: status === 'checking' || status === 'withdrawing',
        reset,
    };
}
