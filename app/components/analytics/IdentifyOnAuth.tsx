'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { identifyUser, resetUser, track } from '@/app/utils/analytics';

export function IdentifyOnAuth() {
    const { isAuthenticated, userAddress } = useAuth();
    const identifiedRef = useRef<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && userAddress) {
            const addr = userAddress.toLowerCase();
            if (identifiedRef.current !== addr) {
                identifyUser(addr);
                track('wallet_connected', { address: addr });
                identifiedRef.current = addr;
            }
        } else if (!isAuthenticated && identifiedRef.current) {
            track('wallet_disconnected', { address: identifiedRef.current });
            resetUser();
            identifiedRef.current = null;
        }
    }, [isAuthenticated, userAddress]);

    return null;
}
