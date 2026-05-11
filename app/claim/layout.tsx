import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Claim Your NFT | Stacked Poker',
    description:
        'A soulbound badge for partners and players who shape the Stacked Poker room. By invitation, on Base.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Claim Your NFT | Stacked Poker',
        description:
            'A soulbound badge for partners and players who shape the Stacked Poker room. By invitation, on Base.',
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
        description: 'A soulbound badge for partners and players who shape the Stacked Poker room. By invitation, on Base.',
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
