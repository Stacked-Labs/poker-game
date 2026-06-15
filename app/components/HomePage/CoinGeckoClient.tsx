'use client';

import dynamic from 'next/dynamic';
import { useIsBaseApp } from '@/app/hooks/useIsBaseApp';

const CoinGecko = dynamic(() => import('./CoinGecko'), { ssr: false });

export default function CoinGeckoClient() {
    // Hide the crypto price ticker inside the Base App — it's noise for a poker
    // player in a wallet that already shows prices, and it collides with the
    // host header.
    const isBaseApp = useIsBaseApp();
    if (isBaseApp) return null;
    return <CoinGecko />;
}
