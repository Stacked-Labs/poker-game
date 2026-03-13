import React from 'react';
import type { Preview } from '@storybook/react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { ReactRenderer } from '@storybook/react';
import { theme } from '../app/theme';

const preview: Preview = {
    decorators: [
        // 1. Color mode toggle — must wrap ChakraProvider so class is set first
        withThemeByClassName<ReactRenderer>({
            themes: {
                light: '',
                dark: 'chakra-ui-dark',
            },
            defaultTheme: 'light',
        }),
        // 2. App theme + provider
        (Story) => (
            <>
                <ColorModeScript
                    initialColorMode={theme.config?.initialColorMode ?? 'light'}
                />
                <ChakraProvider theme={theme}>
                    <Story />
                </ChakraProvider>
            </>
        ),
    ],
    parameters: {
        // App Router support globally — avoids "invariant expected app router" error
        nextjs: {
            appDirectory: true,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
            expanded: false,
            sort: 'requiredFirst',
        },
        // Auto-log all on* props to Actions panel
        actions: { argTypesRegex: '^on[A-Z].*' },
    },
};

export default preview;
