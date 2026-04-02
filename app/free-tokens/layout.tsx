import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Free Testnet USDC - Stacked Poker',
    description:
        'Get free testnet USDC to play crypto poker on Stacked. Connect your wallet, claim tokens from the faucet, and start playing real-money style poker on Base Sepolia.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Free Testnet USDC - Stacked Poker',
        description:
            'Get free testnet USDC to try crypto poker on Stacked. No real money needed — connect your wallet and claim tokens instantly.',
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
            'Get free testnet USDC to try crypto poker on Stacked. No real money needed.',
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
