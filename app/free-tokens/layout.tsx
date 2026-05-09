import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Free Testnet USDC - Stacked Poker',
    description:
        'Grab free Base Sepolia ETH and USDC, then sit down at a table on Stacked. No account, no signup.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Free Testnet USDC - Stacked Poker',
        description:
            'Grab free Base Sepolia ETH and USDC, then sit down at a table on Stacked. No account, no signup.',
        url: 'https://stackedpoker.io/free-tokens',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/home_preview.png',
                width: 1200,
                height: 630,
                alt: 'Free Tokens - Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Free Testnet USDC - Stacked Poker',
        description:
            'Free Base Sepolia ETH and USDC for Stacked. Two minutes, no signup.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ['testnet USDC', 'free crypto poker', 'Base Sepolia faucet', 'poker faucet', 'crypto poker testnet'],
    alternates: {
        canonical: 'https://stackedpoker.io/free-tokens',
    },
};

export default function FreeTokensLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
