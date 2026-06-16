// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const f = require('dotenv');

// const envPath = `./.env.${process.env?.BUILD_ENV || 'local'}`;
const envPath = './.env.local';

if (fs.existsSync(envPath)) {
    // Load environment variables from .env.local if it exists
    f.config({ path: envPath });
} else {
    console.warn(
        '> env file not exists > ',
        envPath,
        ', proceeding without it.'
    );
}

const isDev = process.env.NODE_ENV !== 'production';

// Explicit allowlist replaces the previous `https://* wss://* ws://*` wildcard
// in connect-src. Vendor wildcards (e.g. *.thirdweb.com) are kept because each
// SDK uses many subdomains; enumerating them is brittle. The catch-all wildcard
// is gone — XSS exfiltration no longer reaches arbitrary attacker hosts.
const connectSrc = [
    "'self'",
    'https://api.stackedpoker.io',
    'wss://api.stackedpoker.io',
    'https://dev-api.stackedpoker.io',
    'wss://dev-api.stackedpoker.io',
    'https://challenges.cloudflare.com',
    'https://*.cloudflare.com',
    'https://mainnet.base.org',
    'https://sepolia.base.org',
    'https://*.thirdweb.com',
    'wss://*.thirdweb.com',
    'https://*.walletconnect.com',
    'wss://*.walletconnect.com',
    'https://*.walletconnect.org',
    'wss://*.walletconnect.org',
    'https://*.coinbase.com',
    'wss://*.coinbase.com',
    'https://*.farcaster.xyz',
    'https://warpcast.com',
    'https://api.coingecko.com',
    'https://eu.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    ...(isDev ? ['http://localhost:8080', 'ws://localhost:8080'] : []),
];

const nextConfig = {
    async headers() {
        return [
            {
                // Apply security headers to all routes
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://widgets.coingecko.com https://eu-assets.i.posthog.com https://eu.i.posthog.com",
                            "frame-src 'self' https://challenges.cloudflare.com https://embedded-wallet.thirdweb.com https://pay.thirdweb.com https://*.thirdweb.com",
                            `connect-src ${connectSrc.join(' ')}`,
                            "img-src 'self' data: https: blob:",
                            "style-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "worker-src 'self' blob:",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        config.externals.push('pino-pretty', 'lokijs', 'encoding');

        return config;
    },
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },
    compiler: {},
    reactStrictMode: false,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
        NEXT_PUBLIC_THIRDWEB_CLIENT_ID:
            process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
        NEXT_PUBLIC_THIRDWEB_BUNDLER_URL:
            process.env.NEXT_PUBLIC_THIRDWEB_BUNDLER_URL,
        NEXT_PUBLIC_VAPID_PUBLIC_KEY:
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'tenor.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.tenor.com',
                pathname: '/**',
            },
        ],
    },
};
module.exports = nextConfig;
