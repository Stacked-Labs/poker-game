const fs = require('fs');
const f = require('dotenv');

const envPath = `./.env.${process.env?.BUILD_ENV || 'local'}`;

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
  compiler: {

  },
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
};
module.exports = nextConfig;
