'use client';

import { useState, useCallback } from 'react';
import { type Chain } from 'thirdweb';
import { getContract, prepareContractCall } from 'thirdweb';
import {
    useSendAndConfirmTransaction,
    useActiveAccount,
    useActiveWallet,
    useSwitchActiveWalletChain,
} from 'thirdweb/react';
import { approve, allowance, balanceOf } from 'thirdweb/extensions/erc20';
import { getWalletBalance } from 'thirdweb/wallets';
import { client } from '../thirdwebclient';

const ALLOWANCE_POLL_INTERVAL_MS = 1500;
const ALLOWANCE_POLL_MAX_ATTEMPTS = 10;

// Minimum native (ETH) balance we want an external EOA to have before they
// can deposit. Approve + depositAndJoin together cost ~150–250k gas on Base;
// at typical base fees that's well under $0.01. 0.00005 ETH (~5×10¹³ wei) is
// a ~50× safety margin over the floor, comfortably covers a spike, and is
// cheap to suggest a user top up.
//
// inApp wallets sponsor gas via the thirdweb dashboard, so this check is
// skipped for them.
const MIN_NATIVE_BALANCE_WEI = BigInt(50_000_000_000_000);

export type DepositStatus =
    | 'idle'
    | 'checking_allowance'
    | 'approving'
    | 'depositing'
    | 'success'
    | 'error';

const USDC_MICRO_PER_CHIP = BigInt(10_000);
const CHIPS_PER_USDC = 100;

interface UseDepositAndJoinResult {
    depositAndJoin: (chipAmount: number) => Promise<boolean>;
    status: DepositStatus;
    error: string | null;
    usdcBalance: bigint | null;
    /**
     * True when the active wallet is an external EOA (MetaMask, Coinbase
     * Wallet, etc.) and its native ETH balance on the table's chain is below
     * `MIN_NATIVE_BALANCE_WEI`. Always false for inApp wallets (sponsored
     * gas). Null when we haven't been able to read the balance yet.
     */
    isGasInsufficient: boolean | null;
    isLoading: boolean;
    reset: () => void;
    refreshBalance: () => Promise<bigint | null>;
}

export function useDepositAndJoin(
    contractAddress: string | undefined,
    chain: Chain,
    usdcAddress: string
): UseDepositAndJoinResult {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const [status, setStatus] = useState<DepositStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
    const [isGasInsufficient, setIsGasInsufficient] = useState<boolean | null>(
        null
    );

    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();
    const switchChain = useSwitchActiveWalletChain();

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    const fetchUsdcBalance = useCallback(async () => {
        if (!account?.address) return null;

        const usdcContract = getContract({
            client,
            chain,
            address: usdcAddress,
        });

        // Fetch USDC and native (ETH) balances in parallel. The native
        // balance is only relevant for external EOAs — inApp wallets have
        // sponsored gas via the thirdweb dashboard, so they always pass.
        const isInAppWallet = wallet?.id === 'inApp';
        const [usdcBal, nativeBal] = await Promise.all([
            balanceOf({
                contract: usdcContract,
                address: account.address,
            }),
            isInAppWallet
                ? Promise.resolve(null)
                : getWalletBalance({
                      address: account.address,
                      client,
                      chain,
                  }).catch(() => null),
        ]);

        setUsdcBalance(usdcBal);
        if (isInAppWallet) {
            setIsGasInsufficient(false);
        } else if (nativeBal) {
            setIsGasInsufficient(nativeBal.value < MIN_NATIVE_BALANCE_WEI);
        }
        return usdcBal;
    }, [account?.address, chain, usdcAddress, wallet?.id]);

    const depositAndJoin = useCallback(
        async (chipAmount: number): Promise<boolean> => {
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
                // USDC has 6 decimals, 100 chips = 1 USDC
                const usdcAmount = BigInt(chipAmount) * USDC_MICRO_PER_CHIP;

                const usdcContract = getContract({
                    client,
                    chain,
                    address: usdcAddress,
                });

                const pokerContract = getContract({
                    client,
                    chain,
                    address: contractAddress,
                });

                await switchChain(chain);

                // Step 1: Check USDC balance
                setStatus('checking_allowance');
                const userBalance = await balanceOf({
                    contract: usdcContract,
                    address: account.address,
                });

                if (userBalance < usdcAmount) {
                    const requiredUsdc = (
                        chipAmount / CHIPS_PER_USDC
                    ).toFixed(2);
                    const availableUsdc = (
                        Number(userBalance) / 1_000_000
                    ).toFixed(2);
                    setError(
                        `Insufficient USDC balance. You have ${availableUsdc} USDC but need ${requiredUsdc} USDC.`
                    );
                    setStatus('error');
                    return false;
                }

                // Step 2: Check allowance
                const currentAllowance = await allowance({
                    contract: usdcContract,
                    owner: account.address,
                    spender: contractAddress,
                });

                if (currentAllowance < usdcAmount) {
                    setStatus('approving');

                    const approveTx = approve({
                        contract: usdcContract,
                        spender: contractAddress,
                        amountWei: usdcAmount,
                    });

                    await sendAndConfirm(approveTx);

                    // Wait for allowance to propagate — RPC nodes can lag behind
                    let confirmed = false;
                    for (let i = 0; i < ALLOWANCE_POLL_MAX_ATTEMPTS; i++) {
                        const updatedAllowance = await allowance({
                            contract: usdcContract,
                            owner: account.address,
                            spender: contractAddress,
                        });
                        if (updatedAllowance >= usdcAmount) {
                            confirmed = true;
                            break;
                        }
                        await new Promise((r) =>
                            setTimeout(r, ALLOWANCE_POLL_INTERVAL_MS)
                        );
                    }

                    if (!confirmed) {
                        setError(
                            'USDC approval confirmed on-chain but not yet visible. Please try again.'
                        );
                        setStatus('error');
                        return false;
                    }
                }

                // Step 3: Deposit and join
                setStatus('depositing');

                const depositTx = prepareContractCall({
                    contract: pokerContract,
                    method: 'function depositAndJoin(uint256 chipAmount)',
                    params: [BigInt(chipAmount)],
                });

                await sendAndConfirm(depositTx);

                setStatus('success');
                return true;
            } catch (err) {
                console.error('Deposit and join failed:', err);
                const rawMessage =
                    err instanceof Error ? err.message : 'Transaction failed';
                // Wallets surface gas-shortage failures with a few different
                // strings ("insufficient funds for gas * price + value",
                // "insufficient funds", "exceeds balance"). Map any of them
                // to actionable copy so the user knows what to do.
                const looksLikeGasShortage =
                    /insufficient funds|exceeds balance|gas required exceeds/i.test(
                        rawMessage
                    );
                setError(
                    looksLikeGasShortage
                        ? `Not enough ETH on Base for gas. Add a small amount of ETH to your wallet (most wallets let you buy ETH directly) and try again.`
                        : rawMessage
                );
                setStatus('error');
                return false;
            }
        },
        [
            account?.address,
            contractAddress,
            chain,
            usdcAddress,
            sendAndConfirm,
            switchChain,
        ]
    );

    return {
        depositAndJoin,
        status,
        error,
        usdcBalance,
        isGasInsufficient,
        isLoading:
            status !== 'idle' && status !== 'success' && status !== 'error',
        reset,
        refreshBalance: fetchUsdcBalance,
    };
}
