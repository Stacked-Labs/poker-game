'use client';

import { useCallback } from 'react';
import type { PreparedTransaction } from 'thirdweb';
import type { Abi, AbiFunction } from 'abitype';
import { useActiveWallet, useSendAndConfirmTransaction } from 'thirdweb/react';
import { sendAndConfirmCalls } from 'thirdweb/wallets/eip5792';
import { BASE_PAYMASTER_URL } from '@/app/thirdwebclient';
import { useIsMiniApp } from './useIsMiniApp';

export interface StackedTxResult {
    transactionHashes: string[];
}

export interface UseStackedTransactionOptions {
    /**
     * When true, falls back to serial `sendAndConfirmTransaction` (user pays
     * gas in the chain's native token) if the EIP-5792 paymaster path errors.
     *
     * Used by emergency withdraw hooks so a paymaster/bundler outage cannot
     * lock users out of their funds — the 24h emergency self-withdraw is a
     * trust pillar (see CLAUDE.md) and must remain available even if our
     * gas-in-USDC infra is down.
     */
    emergencyFallback?: boolean;
}

/**
 * Single entry point for every on-chain transaction in the app.
 *
 * Routing:
 * 1. **Mini App host** (Coinbase Wallet, Farcaster) — host wallet handles gas.
 *    We submit each call serially via `sendAndConfirmTransaction` and skip our
 *    paymaster so we don't conflict with the host's own onramp/sponsorship.
 * 2. **Everyone else** (inApp 7702 smart account or external EOA with EIP-5792
 *    support) — `sendAndConfirmCalls` with `paymasterService.url` so gas is
 *    paid in USDC via the Base USDC ERC-20 paymaster. Calls in the array are
 *    bundled atomically when the wallet supports it (kills the need for
 *    approve-then-poll-allowance loops).
 *
 * Callers pass an array of prepared txs so they can batch (e.g. `[approveTx,
 * depositTx]`).
 */
export function useStackedTransaction(
    options: UseStackedTransactionOptions = {}
) {
    const wallet = useActiveWallet();
    const isMiniApp = useIsMiniApp();
    const { mutateAsync: sendAndConfirm } = useSendAndConfirmTransaction();

    return useCallback(
        async (
            calls: PreparedTransaction<Abi, AbiFunction>[]
        ): Promise<StackedTxResult> => {
            if (!wallet) {
                throw new Error('Wallet not connected');
            }
            if (calls.length === 0) {
                return { transactionHashes: [] };
            }

            const serialSubmit = async () => {
                const hashes: string[] = [];
                for (const tx of calls) {
                    const receipt = await sendAndConfirm(tx);
                    hashes.push(receipt.transactionHash);
                }
                return { transactionHashes: hashes };
            };

            // Mini App: defer to the host wallet's gas handling.
            if (isMiniApp) {
                return serialSubmit();
            }

            // Default path: EIP-5792 sendCalls with USDC paymaster.
            try {
                const result = await sendAndConfirmCalls({
                    wallet,
                    // Cast: thirdweb's PreparedSendCall has a stricter abi
                    // generic than PreparedTransaction, but the runtime
                    // accepts any abi shape. See thirdweb#... type variance.
                    calls: calls as Parameters<typeof sendAndConfirmCalls>[0]['calls'],
                    capabilities: BASE_PAYMASTER_URL
                        ? {
                              paymasterService: {
                                  url: BASE_PAYMASTER_URL,
                              },
                          }
                        : undefined,
                });

                if (result.status === 'failure') {
                    throw new Error(
                        result.receipts?.find((r) => r.status === 'reverted')
                            ? 'Transaction reverted on-chain'
                            : 'Transaction bundle failed'
                    );
                }

                return {
                    transactionHashes:
                        result.receipts?.map((r) => r.transactionHash) ?? [],
                };
            } catch (err) {
                if (options.emergencyFallback) {
                    // Paymaster outage or wallet without 5792 support — serial
                    // fallback so users can always evacuate funds.
                    console.warn(
                        'useStackedTransaction: paymaster path failed, falling back to serial submit',
                        err
                    );
                    return serialSubmit();
                }
                throw err;
            }
        },
        [wallet, isMiniApp, sendAndConfirm, options.emergencyFallback]
    );
}
