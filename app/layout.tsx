import './globals.css';
import { Providers } from './providers';
import { Libre_Barcode_39_Text, Poppins } from 'next/font/google';
import HomeNavBar from './components/HomePage/HomeNavBar';
import React from 'react';
import type { Metadata } from 'next';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    display: 'swap',
    variable: '--font-poppins',
});

const libreBarcode = Libre_Barcode_39_Text({
    subsets: ['latin'],
    weight: '400',
    display: 'swap',
    variable: '--font-barcode',
});

export const metadata: Metadata = {
    other: {
        'base:app_id': '697e0df32aaf0bc9ad8a2b7',
        'fc:miniapp': JSON.stringify({
            version: '1',
            imageUrl: 'https://stackedpoker.io/previews/home_preview.png',
            button: {
                title: 'Play Stacked',
                action: {
                    type: 'launch_miniapp',
                    name: 'Stacked Poker',
                    url: 'https://stackedpoker.io/',
                    splashImageUrl:
                        'https://stackedpoker.io/previews/home_preview.png',
                    splashBackgroundColor: '#0b1020',
                },
            },
        }),
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
                    name="base:app_id"
                    content="697e0df32aaf0bc9ad8a2b7"
                />
                <link
                    rel="preconnect"
                    href="https://challenges.cloudflare.com"
                />
                <link
                    rel="dns-prefetch"
                    href="https://challenges.cloudflare.com"
                />
            </head>
            <body
                className={`${poppins.className} ${poppins.variable} ${libreBarcode.variable}`}
            >
                <Providers>
                    <HomeNavBar />
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
}
