'use client';

import { useEffect, useRef } from 'react';
import {
    useActiveAccount,
    useActiveWalletConnectionStatus,
} from 'thirdweb/react';
import { logoutUser } from '@/app/contexts/AuthContext';
import { normalizeAddr } from '@/app/lib/walletSession';

/**
 * Resets table-scoped UI state (seat requests, WS session, Zustand stores) when the connected
 * wallet is SWITCHED to a different account — including a switch made inside the wallet
 * extension itself (Rabby/MetaMask), which surfaces only as the active address changing.
 *
 * Two deliberate behaviors:
 *  - It clears the old wallet's session (`logoutUser`) and AWAITS it before reloading. The
 *    original bug was a synchronous `window.location.reload()` that aborted AuthContext's
 *    in-flight `/logout`, leaving the new wallet riding the old wallet's JWT.
 *  - It does NOT react to a plain disconnect (address → none). The SIWE cookie stays valid and
 *    the player keeps their seat via the WebSocket; AutoConnect re-hydration after a table
 *    move / new tab / transient blip must not trigger a reload or a logout.
 */
export default function WalletChangeReloader() {
    const account = useActiveAccount();
    const status = useActiveWalletConnectionStatus();
    const settledAddrRef = useRef<string | null>(null);
    const reloadingRef = useRef(false);

    useEffect(() => {
        // Only trust the address once AutoConnect has settled — ignore the undefined→0x…
        // hydration transition and transient connecting/unknown blips.
        if (status !== 'connected' && status !== 'disconnected') return;

        const current = normalizeAddr(account?.address); // '' when no / malformed wallet

        // Establish the baseline the first time we see a real connected wallet.
        if (settledAddrRef.current === null) {
            if (current) settledAddrRef.current = current;
            return;
        }

        // Genuine switch to a DIFFERENT valid wallet. A plain disconnect (current === '') is
        // intentionally ignored so the session/seat survive.
        if (current && current !== settledAddrRef.current) {
            if (reloadingRef.current) return;
            reloadingRef.current = true;
            const prev = settledAddrRef.current;
            settledAddrRef.current = current;
            console.log(
                '[WalletChangeReloader] Wallet switched — clearing old session, then reloading',
                { prev, current }
            );
            // Clear the old wallet's JWT BEFORE navigating so the reload can never race the
            // logout. On reload, AutoConnect reconnects the new wallet and useWalletAuth runs a
            // fresh SIWE for it.
            logoutUser().finally(() => window.location.reload());
        }
    }, [account?.address, status]);

    return null;
}
