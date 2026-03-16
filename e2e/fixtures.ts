import { test as base, type Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const WALLET_A_KEY = process.env.E2E_WALLET_A_PRIVATE_KEY!;
const WALLET_B_KEY = process.env.E2E_WALLET_B_PRIVATE_KEY!;

if (!WALLET_A_KEY || WALLET_A_KEY.includes('REPLACE')) {
    throw new Error(
        'E2E_WALLET_A_PRIVATE_KEY not set in .env.test — generate two test wallets and fund them on Base Sepolia'
    );
}
if (!WALLET_B_KEY || WALLET_B_KEY.includes('REPLACE')) {
    throw new Error(
        'E2E_WALLET_B_PRIVATE_KEY not set in .env.test — generate two test wallets and fund them on Base Sepolia'
    );
}

export type PokerFixtures = {
    playerA: Page;
    playerB: Page;
};

export const test = base.extend<PokerFixtures>({
    playerA: async ({ browser }, use) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(`/?e2e_pk=${WALLET_A_KEY}`);
        await page.waitForSelector('[data-testid="wallet-connected"]', {
            state: 'attached',
            timeout: 30_000,
        });
        await use(page);
        await ctx.close();
    },

    playerB: async ({ browser }, use) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(`/?e2e_pk=${WALLET_B_KEY}`);
        await page.waitForSelector('[data-testid="wallet-connected"]', {
            state: 'attached',
            timeout: 30_000,
        });
        await use(page);
        await ctx.close();
    },
});

export { expect } from '@playwright/test';
