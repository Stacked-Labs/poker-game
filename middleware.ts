import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function splitCsv(value?: string): string[] {
    if (!value) {
        return [];
    }
    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function unique(values: string[]): string[] {
    return Array.from(new Set(values));
}

export function middleware(request: NextRequest) {
    const nonce = btoa(crypto.randomUUID());
    const isDevelopment = process.env.NODE_ENV !== 'production';

    const connectAllowlist = unique([
        "'self'",
        'https://api.stackedpoker.io',
        'wss://api.stackedpoker.io',
        'https://embedded-wallet.thirdweb.com',
        'https://status.thirdweb.com',
        'https://challenges.cloudflare.com',
        'https://widgets.coingecko.com',
        ...(isDevelopment ? ['http://localhost:3000', 'http://localhost:8080', 'ws://localhost:8080'] : []),
        ...splitCsv(process.env.NEXT_PUBLIC_CSP_CONNECT_SRC),
    ]);

    const scriptAllowlist = unique([
        "'self'",
        `'nonce-${nonce}'`,
        'https://challenges.cloudflare.com',
        'https://widgets.coingecko.com',
        ...splitCsv(process.env.NEXT_PUBLIC_CSP_SCRIPT_SRC),
    ]);

    const csp = [
        "default-src 'self'",
        `script-src ${scriptAllowlist.join(' ')}`,
        "frame-src 'self' https://challenges.cloudflare.com https://embedded-wallet.thirdweb.com",
        `connect-src ${connectAllowlist.join(' ')}`,
        "img-src 'self' data: https: blob:",
        "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
    ].join('; ');

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', csp);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    response.headers.set('Content-Security-Policy', csp);

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
    ],
};
