'use client';

import { useEffect, useRef } from 'react';
import { useActiveAccount } from 'thirdweb/react';

/**
 * Reloads the page when the connected wallet address changes or disconnects.
 * Used on table pages to reset all user-specific state (seat requests, WS session, etc.).
 */
export default function WalletChangeReloader() {
    const account = useActiveAccount();
    const prevAddressRef = useRef<string | undefined>(undefined);
    const hasSettledRef = useRef(false);

    useEffect(() => {
        const current = account?.address;

        // Wait until we have a real wallet address before we start tracking.
        // This avoids reloading during thirdweb hydration (undefined → 0x...).
        if (!hasSettledRef.current) {
            if (current) {
                // First time we see a real address — start tracking from here
                hasSettledRef.current = true;
                prevAddressRef.current = current;
            }
            return;
        }

        const prev = prevAddressRef.current;

        // Only reload on genuine wallet switch or disconnect
        if (prev && prev !== current) {
            console.log('[WalletChangeReloader] Wallet changed, reloading', { prev, current });
            window.location.reload();
        }

        prevAddressRef.current = current;
    }, [account?.address]);

    return null;
}
