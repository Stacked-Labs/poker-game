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

export async function generateMetadata(): Promise<Metadata> {
    return {
        other: {
            'fc:miniapp': JSON.stringify({
                version: 'next',
                imageUrl: 'https://images.pexels.com/photos/34194627/pexels-photo-34194627.jpeg', // Placeholder for testing
                button: {
                    title: 'Stacked Poker',
                    action: {
                        type: 'launch_miniapp',
                        name: 'Stacked Poker',
                        url: 'https://throneless-leadingly-rob.ngrok-free.dev', // This is a placeholder for testing, replace with actual stacked URL.
                        splashImageUrl: 'https://images.pexels.com/photos/34194627/pexels-photo-34194627.jpeg', // Placeholder for testing
                        splashBackgroundColor: '#000000', // Placeholder for testing
                    },
                },
            }),
        },
    };
}

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

