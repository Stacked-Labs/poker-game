import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Player Stats - Stacked Poker',
    description:
        'View your poker stats on Stacked. Track games played, tables created, and your overall performance across free and crypto poker sessions.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Player Stats - Stacked Poker',
        description:
            'View your poker stats on Stacked. Track games played, tables created, and your overall performance.',
        url: 'https://stackedpoker.io/stats',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/home_preview.png',
                width: 1200,
                height: 630,
                alt: 'Player Stats - Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Player Stats - Stacked Poker',
        description:
            'View your poker stats on Stacked. Track games played and overall performance.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ['poker stats', 'poker statistics', 'player performance', 'stacked poker'],
    alternates: {
        canonical: 'https://stackedpoker.io/stats',
    },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
