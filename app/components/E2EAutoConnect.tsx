'use client';

import { useEffect, useRef } from 'react';
import { useConnect, useActiveAccount } from 'thirdweb/react';
import { privateKeyToAccount, createWalletAdapter } from 'thirdweb/wallets';
import { client, baseSepoliaChain } from '@/app/thirdwebclient';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Test-only component that auto-connects a wallet from a private key
 * passed via the `?e2e_pk=<hex>` query parameter.
 *
 * In Playwright fixtures, `@johanneskares/wallet-mock` is also installed to
 * provide a headless EIP-6963 / EIP-1193 provider for any RPC calls the app
 * makes. The private key used in the fixture matches the mock wallet account
 * so both operate on the same address.
 *
 * Renders a hidden `[data-testid="wallet-connected"]` element once connected
 * so fixtures can gate on it via `waitForSelector`.
 */
const E2EAutoConnect = () => {
    const { connect } = useConnect();
    const activeAccount = useActiveAccount();
    const { isAuthenticated } = useAuth();
    const didConnect = useRef(false);

    useEffect(() => {
        if (didConnect.current) return;

        const params = new URLSearchParams(window.location.search);
        const pk = params.get('e2e_pk');
        if (!pk) return;

        didConnect.current = true;

        const account = privateKeyToAccount({
            client,
            privateKey: pk as `0x${string}`,
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
            <>
                <div
                    data-testid="wallet-connected"
                    data-address={activeAccount.address}
                    style={{ display: 'none' }}
                />
                {isAuthenticated && (
                    <div
                        data-testid="wallet-authenticated"
                        style={{ display: 'none' }}
                    />
                )}
            </>
        );
    }

    return null;
};

export default E2EAutoConnect;
