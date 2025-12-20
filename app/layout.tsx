import './globals.css';
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
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://stackedpoker.io'),
    title: {
        template: '%s | Stacked Poker',
        default: 'Stacked - Poker with Friends',
    },
    alternates: {
        canonical: '/',
        languages: {
            'en-US': '/en-US',
        },
    },
    openGraph: {
        title: '%s | Stacked Poker',
        images: '/previews/home_preview.png',
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
                <link
                    rel="preconnect"
                    href="https://challenges.cloudflare.com"
                />
                <link
                    rel="dns-prefetch"
                    href="https://challenges.cloudflare.com"
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
