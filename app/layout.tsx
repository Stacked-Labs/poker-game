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

const inter = Inter({ subsets: ['latin'] });

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
