import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import '@fontsource/luckiest-guy';
import '@fontsource/poppins';
import '@fontsource/libre-barcode-39-text';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Stacked Poker',
    description: 'Play poker with your friends for any stakes',
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
        <html lang="en">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
