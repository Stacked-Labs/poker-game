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
        // A cold `next dev` boot + first-route compile can exceed the 60s default.
        timeout: 180_000,
    },
    projects: [
        {
            name: 'free',
            testDir: './e2e/free',
            // The RIT all-in flow is long: create + two seats + a full hand + the
            // post-runout next-hand wait, on top of `next dev` lazy compilation.
            // 120s is too tight for it; give the free suite real headroom.
            timeout: 240_000,
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
