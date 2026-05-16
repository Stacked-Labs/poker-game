'use client';

import dynamic from 'next/dynamic';

const CoinGecko = dynamic(() => import('./CoinGecko'), { ssr: false });

export default function CoinGeckoClient() {
    return <CoinGecko />;
}
