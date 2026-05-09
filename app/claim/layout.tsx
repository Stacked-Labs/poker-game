import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Claim Your NFT | Stacked Poker',
    description:
        'Claim your exclusive Stacked Poker soulbound NFT. Whitelisted wallets only — holds unlock a points boost on the leaderboard.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Claim Your NFT | Stacked Poker',
        description:
            'Claim your exclusive Stacked Poker soulbound NFT. Whitelisted wallets only.',
        url: 'https://stackedpoker.io/claim',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/home_preview.png',
                width: 1200,
                height: 630,
                alt: 'Claim NFT - Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Claim Your NFT | Stacked Poker',
        description: 'Claim your exclusive Stacked Poker soulbound NFT. Whitelisted wallets only.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ['stacked poker NFT', 'soulbound NFT', 'poker NFT claim', 'Base NFT'],
    alternates: {
        canonical: 'https://stackedpoker.io/claim',
    },
};

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
