import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Public Games - Stacked Poker',
    description:
        'Browse live poker tables and join instantly. No sign up required. Filter by free or crypto tables and find your seat now.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Public Games - Stacked Poker',
        description:
            'Browse live poker tables and join instantly. No sign up required. Filter by free or crypto tables and find your seat now.',
        url: 'https://stackedpoker.io/public-games',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/home_preview.png',
                width: 1200,
                height: 630,
                alt: 'Public Games - Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Public Games - Stacked Poker',
        description:
            'Browse live poker tables and join instantly. No sign up required.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ['online poker tables', 'join poker game', 'live poker', 'free poker', 'crypto poker'],
    alternates: {
        canonical: 'https://stackedpoker.io/public-games',
    },
};

export default function PublicGamesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
