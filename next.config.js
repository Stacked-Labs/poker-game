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
        PROJECT_ID: process.env.PROJECT_ID,
    },
};
module.exports = nextConfig;
