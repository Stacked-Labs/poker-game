import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import '@fontsource/luckiest-guy';
import '@fontsource/poppins';
import '@fontsource/libre-barcode-39-text';
import HomeNavBar from './components/HomePage/HomeNavBar';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Stacked Poker',
    description:
        'The premier platform to play poker for free with your friends or to up the stakes and battle for any ERC20 cryptocurrency',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <body className={inter.className}>
            <Providers>
                <HomeNavBar />
                {children}
            </Providers>
        </body>
    );
}
