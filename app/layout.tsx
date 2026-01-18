import './globals.css';
import { Providers } from './providers';
import { Libre_Barcode_39_Text, Poppins } from 'next/font/google';
import HomeNavBar from './components/HomePage/HomeNavBar';
import React from 'react';

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
