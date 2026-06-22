import { defineConfig, type UserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Unit tests for pure logic run on `node`; component tests (*.test.tsx) run on jsdom with React
// Testing Library. E2E stays on Playwright.
export default defineConfig({
    // Cast: @vitejs/plugin-react is typed against a different bundled vite version than vitest's,
    // which otherwise trips TS "excessive stack depth" on the Plugin type. Runtime is unaffected.
    plugins: [react() as unknown as NonNullable<UserConfig['plugins']>[number]],
    resolve: {
        // Mirror tsconfig "@/*" -> "./*" so tests can use the same import paths as the app.
        alias: {
            '@': fileURLToPath(new URL('.', import.meta.url)),
        },
    },
    test: {
        // Default env is node (fast, for pure-logic *.test.ts). Component tests opt into jsdom.
        environment: 'node',
        environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
        setupFiles: ['./vitest.setup.ts'],
        include: ['app/**/*.test.{ts,tsx}'],
        // Exclude Playwright specs (they live under e2e/ and use @playwright/test).
        exclude: ['e2e/**', 'node_modules/**'],
    },
});
