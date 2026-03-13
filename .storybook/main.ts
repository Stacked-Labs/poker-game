import type { StorybookConfig } from '@storybook/nextjs-vite';

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
};

export default config;
