'use client';

import { useEffect, useRef } from 'react';
import { useConnect } from 'thirdweb/react';
import { EIP1193 } from 'thirdweb/wallets';
import { getContract } from 'thirdweb';
import { isContractDeployed } from 'thirdweb/utils';
import { createBaseAccountSDK } from '@base-org/account';
import { client, defaultChain } from '@/app/thirdwebclient';
import { track } from '@/app/lib/analytics';

/**
 * One-tap "log in with your Base wallet" inside the Base App.
 *
 * Inside the Base App the user's Base Account (Coinbase Smart Wallet) is exposed
 * as a standard injected EIP-1193 provider. We wrap it with thirdweb's
 * `EIP1193.fromProvider` and set it active — so the EXISTING `useWalletAuth`
 * SIWE flow fires unchanged off `useActiveAccount()`, with no social-login
 * detour. thirdweb stays the wallet layer (no wagmi).
 *
 * Mounted ONLY when `useIsBaseApp()` is true (see `app/providers.tsx`); the
 * normal-web thirdweb `<AutoConnect>` is suppressed in that context so it can't
 * race the host wallet.
 *
 * See `.claude/skills/base-miniapp-developer/references/base-app-integration.md`.
 */
export default function BaseAppConnect() {
    const { connect } = useConnect();
    const didConnect = useRef(false);

    useEffect(() => {
        if (didConnect.current) return;
        didConnect.current = true;
        track('connect_attempt', { method: 'base_account' });

        connect(async () => {
            // PRIMARY path: @base-org/account bare EIP-1193 provider (no wagmi).
            const provider = createBaseAccountSDK({
                appName: 'Stacked Poker',
            }).getProvider();
            // ⚠️ client goes to connect(), NOT to fromProvider({ provider, walletId }).
            const wallet = EIP1193.fromProvider({
                provider: provider as Parameters<
                    typeof EIP1193.fromProvider
                >[0]['provider'],
                // The Base Account is a Coinbase Smart Wallet; this is a valid
                // thirdweb WalletId (label only — fromProvider still wraps OUR
                // provider, it does not invoke the Coinbase Wallet connector).
                walletId: 'com.coinbase.wallet',
            });
            const account = await wallet.connect({ client });
            track('connect_success', { method: 'base_account' });

            // Deploy-before-login measurement (non-blocking). A brand-new Base
            // Account that hasn't transacted is counterfactual (no code yet);
            // SIWE then hits the thirdweb-pinned EIP-6492 path, which cannot
            // recover a Coinbase Smart Wallet → login would fail. Most Base App
            // users are already deployed. We MEASURE the rate here; forcing a
            // sponsored deploy at sign-in is a follow-up if on-device data shows
            // it's a real problem. See base-app-integration.md.
            void isContractDeployed(
                getContract({
                    client,
                    chain: defaultChain,
                    address: account.address,
                })
            )
                .then((deployed) =>
                    track('base_account_deploy_status', { deployed })
                )
                .catch(() => {});

            return wallet;
        }).catch((err: unknown) => {
            didConnect.current = false; // allow a retry
            track('connect_error', {
                method: 'base_account',
                message: String((err as Error)?.message ?? err).slice(0, 160),
            });
        });
    }, [connect]);

    return null;
}
