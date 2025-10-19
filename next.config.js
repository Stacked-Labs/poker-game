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

const nextConfig = {
    async headers() {
        return [
            {
                source: '/cards/webp/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Apply security headers to all routes
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://widgets.coingecko.com",
                            "frame-src 'self' https://challenges.cloudflare.com https://embedded-wallet.thirdweb.com",
                            "connect-src 'self' http://localhost:8080 ws://localhost:8080 https://api.stackedpoker.io wss://api.stackedpoker.io https://challenges.cloudflare.com wss://* ws://* https://*",
                            "img-src 'self' data: https: blob:",
                            "style-src 'self' 'unsafe-inline'",
                            "font-src 'self' data:",
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
    },
};
module.exports = nextConfig;
