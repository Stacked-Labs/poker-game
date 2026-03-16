'use client';

import { useEffect, useRef } from 'react';
import { useConnect, useActiveAccount } from 'thirdweb/react';
import { privateKeyToAccount, createWalletAdapter } from 'thirdweb/wallets';
import { client, baseSepoliaChain } from '@/app/thirdwebclient';

/**
 * Test-only component that auto-connects a wallet from a private key
 * passed via the `e2e_pk` query parameter.
 *
 * Renders a hidden marker element once the wallet is connected so
 * Playwright fixtures can detect connection via
 * `waitForSelector('[data-testid="wallet-connected"]', { state: 'attached' })`.
 */
const E2EAutoConnect = () => {
    const { connect } = useConnect();
    const activeAccount = useActiveAccount();
    const didConnect = useRef(false);

    useEffect(() => {
        if (didConnect.current) return;

        const params = new URLSearchParams(window.location.search);
        const pk = params.get('e2e_pk');
        if (!pk) return;

        didConnect.current = true;

        const account = privateKeyToAccount({
            client,
            privateKey: pk,
        });

        const wallet = createWalletAdapter({
            client,
            adaptedAccount: account,
            chain: baseSepoliaChain,
            onDisconnect: () => {},
            switchChain: () => {},
        });

        connect(() => Promise.resolve(wallet));
    }, [connect]);

    if (activeAccount) {
        return (
            <div
                data-testid="wallet-connected"
                data-address={activeAccount.address}
                style={{ display: 'none' }}
            />
        );
    }

    return null;
};

export default E2EAutoConnect;
