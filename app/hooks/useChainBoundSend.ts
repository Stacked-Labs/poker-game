'use client';

import { useCallback } from 'react';
import {
    sendAndConfirmTransaction,
    type Chain,
    type PreparedTransaction,
} from 'thirdweb';
import { type Account } from 'thirdweb/wallets';
import {
    useActiveAccount,
    useActiveWallet,
    useSwitchActiveWalletChain,
} from 'thirdweb/react';
import { getInAppAccountForChain } from '../thirdwebclient';

/**
 * Sends a transaction on a specific chain, transparently handling the fact that
 * a social-login (in-app) smart account is single-chain.
 *
 * thirdweb pins an in-app smart account to its `smartAccount.chain` at connect
 * time and cannot switch a (non-ecosystem) in-app wallet off it — its
 * `useSwitchActiveWalletChain` rebuilds the account on the original chain and
 * then thirdweb's own send guard throws `Could not switch to chain <id>`. So a
 * social-login user could only ever transact on the first chain in
 * NEXT_PUBLIC_ENABLED_CHAINS.
 *
 * For in-app wallets we instead reconnect a fresh instance pinned to the target
 * chain (same auth session, same deterministic smart-account address) and send
 * with that account directly — never touching the active wallet, so the global
 * connection state and UI stay put. External EOA wallets switch networks
 * natively.
 */
export function useChainBoundSend() {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const switchChain = useSwitchActiveWalletChain();

    return useCallback(
        async (chain: Chain, transaction: PreparedTransaction) => {
            if (!wallet || !account) {
                throw new Error('Connect your wallet first');
            }

            let signer: Account = account;
            if (wallet.id === 'inApp') {
                if (wallet.getChain()?.id !== chain.id) {
                    signer = await getInAppAccountForChain(chain);
                }
            } else if (wallet.getChain()?.id !== chain.id) {
                await switchChain(chain);
                // Verify the wallet actually landed on the target chain before
                // sending a money tx — switchChain can resolve without the wallet
                // having switched (user rejected, unsupported network, etc.).
                if (wallet.getChain()?.id !== chain.id) {
                    throw new Error(
                        `Wrong network — please switch to ${chain.name ?? chain.id} and try again`
                    );
                }
            }

            return sendAndConfirmTransaction({ account: signer, transaction });
        },
        [account, wallet, switchChain]
    );
}
