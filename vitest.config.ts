import { defineConfig } from 'vitest/config';

// Unit tests for pure logic (no DOM/React needed). E2E stays on Playwright.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['app/**/*.test.ts'],
        // Exclude Playwright specs (they live under e2e/ and use @playwright/test).
        exclude: ['e2e/**', 'node_modules/**'],
    },
});
