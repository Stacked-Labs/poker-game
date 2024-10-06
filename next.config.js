// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const f = require('dotenv');

// const envPath = `./.env.${process.env?.BUILD_ENV || 'local'}`;
const envPath = './.env.local';

if (!fs.existsSync(envPath)) {
    console.error('> env file not exists > ', envPath);
    process.exit(11);
}

f.config({ path: envPath });

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
        PROJECT_ID: process.env.PROJECT_ID,
    },
};
module.exports = nextConfig;
