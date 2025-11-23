import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import '@fontsource/luckiest-guy';
import '@fontsource/poppins';
import '@fontsource/libre-barcode-39-text';
import '@fontsource/geist-sans/500.css'; // Geist Medium
import '@fontsource/geist-sans/600.css'; // Geist SemiBold
import '@fontsource/geist-sans/700.css'; // Geist Bold
import '@fontsource/geist-sans/800.css'; // Geist ExtraBold
import '@fontsource/geist-sans/900.css'; // Geist Black
import HomeNavBar from './components/HomePage/HomeNavBar';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Stacked - Poker with Friends',
    description:
        'The easiest way to play poker for free or with crypto. No download, no sign up needed.',
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: 'Stacked - Poker with Friends',
        description:
            'The easiest way to play poker for free or for crypto. No download, no sign up needed.',
        url: 'https://stackedpoker.io',
        siteName: 'Stacked Poker',
        images: [
            {
                url: '',
                width: 1200,
                height: 630,
                alt: 'Stacked Poker',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        title: 'Stacked - Poker with Friends',
        description:
            'The easiest way to play poker for free or with crypto. No download, no sign up needed.',
        images: [''],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <meta
                    httpEquiv="Content-Security-Policy"
                    content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://*.cloudflare.com https://widgets.coingecko.com; frame-src 'self' https://challenges.cloudflare.com https://embedded-wallet.thirdweb.com; connect-src 'self' http://localhost:8080 ws://localhost:8080 https://api.stackedpoker.io wss://api.stackedpoker.io https://challenges.cloudflare.com https://*.cloudflare.com wss://* ws://* https://*; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; font-src 'self' data:; worker-src 'self' blob:;"
                />
            </head>
            <body className={inter.className}>
                <Providers>
                    <HomeNavBar />
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
