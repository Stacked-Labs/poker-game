import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Leaderboard - Stacked Poker',
    description:
        'See the top poker players on Stacked Poker. Compete for the highest ranking on our global leaderboard and earn points every hand you play.',
    icons: { icon: '/favicon.ico' },
    openGraph: {
        title: 'Leaderboard - Stacked Poker',
        description:
            'Climb the global poker rankings on Stacked. Earn points every hand and compete with players worldwide.',
        url: 'https://stackedpoker.io/leaderboard',
        siteName: 'Stacked Poker',
        images: [
            {
                url: 'https://stackedpoker.io/previews/home_preview.png',
                width: 1200,
                height: 630,
                alt: 'Leaderboard - Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Leaderboard - Stacked Poker',
        description:
            'Climb the global poker rankings on Stacked. Earn points every hand and compete with players worldwide.',
        images: ['https://stackedpoker.io/previews/home_preview.png'],
    },
    keywords: ['poker leaderboard', 'poker rankings', 'online poker points', 'stacked poker'],
    alternates: {
        canonical: 'https://stackedpoker.io/leaderboard',
    },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
