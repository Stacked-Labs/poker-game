import React, { useEffect } from 'react';
import type { Preview } from '@storybook/react';
import { ChakraProvider, ColorModeScript, useColorMode } from '@chakra-ui/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { ReactRenderer } from '@storybook/react';
import { theme } from '../app/theme';

/**
 * Bridges Storybook's withThemeByClassName toggle to Chakra's color mode context.
 * withThemeByClassName sets/removes "chakra-ui-dark" on <html>, but ChakraProvider
 * tracks color mode in its own context and doesn't read that class back.
 * This component watches the class and calls setColorMode to keep them in sync.
 */
function ColorModeSync() {
    const { setColorMode } = useColorMode();

    useEffect(() => {
        const sync = () => {
            const isDark = document.documentElement.classList.contains('chakra-ui-dark');
            setColorMode(isDark ? 'dark' : 'light');
        };

        // Sync on mount in case the class is already set
        sync();

        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [setColorMode]);

    return null;
}

const preview: Preview = {
    decorators: [
        // 1. Color mode toggle — adds/removes "chakra-ui-dark" class on <html>
        withThemeByClassName<ReactRenderer>({
            themes: {
                light: '',
                dark: 'chakra-ui-dark',
            },
            defaultTheme: 'light',
        }),
        // 2. App theme + provider + color mode sync
        (Story) => (
            <>
                <ColorModeScript
                    initialColorMode={theme.config?.initialColorMode ?? 'light'}
                />
                <ChakraProvider theme={theme}>
                    <ColorModeSync />
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
