import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ['../app/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-themes',
    ],
    framework: {
        name: '@storybook/nextjs-vite',
        options: {
            image: {
                loading: 'eager',
            },
        },
    },
    docs: {
        autodocs: 'tag',
    },
    viteFinal: async (config) => {
        config.resolve = config.resolve ?? {};
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': resolve(__dirname, '..'),
        };
        return config;
    },
};

export default config;
