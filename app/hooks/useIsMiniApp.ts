'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// True when the page is rendered inside a Mini App host (Farcaster client,
// Coinbase Wallet, Warpcast, etc.). In those contexts the host wallet handles
// gas — we skip our USDC paymaster and hide our BuyWidget entry points so we
// don't compete with the host's onramp.
export function useIsMiniApp(): boolean {
    const [isMiniApp, setIsMiniApp] = useState(false);

    useEffect(() => {
        let cancelled = false;
        sdk.isInMiniApp()
            .then((value) => {
                if (!cancelled) setIsMiniApp(Boolean(value));
            })
            .catch(() => {
                if (!cancelled) setIsMiniApp(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return isMiniApp;
}
