import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Load funded wallet keys for crypto tests (ignored by git)
config({ path: '.env.test', override: false });

export default defineConfig({
    testDir: './e2e',
    timeout: 120_000,
    expect: { timeout: 30_000 },
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        video: 'on-first-retry',
    },
    webServer: {
        command: 'npm run dev',
        port: 3000,
        env: { NEXT_PUBLIC_E2E: 'true' },
        reuseExistingServer: true,
    },
    projects: [
        {
            name: 'free',
            testDir: './e2e/free',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'crypto',
            testDir: './e2e/crypto',
            timeout: 600_000, // 10 min — blockchain ops are slow
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'wallet',
            testMatch: /wallet-connect\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
