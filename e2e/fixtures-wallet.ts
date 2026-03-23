import { test as base, type Page } from '@playwright/test';
import { installMockWallet } from '@johanneskares/wallet-mock';
import { privateKeyToAccount } from 'viem/accounts';
import { http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Anvil default accounts — no real funds, safe for free-game tests
const ANVIL_PK_A =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const;
const ANVIL_PK_B =
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const;

// Funded keys for crypto tests — set in .env.test (loaded by playwright.config.ts)
const CRYPTO_PK_A = process.env.TEST_CRYPTO_PK_A as `0x${string}` | undefined;
const CRYPTO_PK_B = process.env.TEST_CRYPTO_PK_B as `0x${string}` | undefined;
const CRYPTO_PK_C = process.env.TEST_CRYPTO_PK_C as `0x${string}` | undefined;

export type WalletFixtures = {
    playerA: Page;
    playerB: Page;
    cryptoPlayerA: Page;
    cryptoPlayerB: Page;
    cryptoPlayerC: Page;
};

async function setupCryptoPage(
    browser: import('@playwright/test').Browser,
    pk: `0x${string}`
): Promise<import('@playwright/test').Page> {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await installMockWallet({
        page,
        account: privateKeyToAccount(pk),
        defaultChain: baseSepolia,
        transports: { [baseSepolia.id]: http() },
    });
    await page.goto(`/?e2e_pk=${pk}`);
    await page.waitForSelector('[data-testid="wallet-connected"]', {
        state: 'attached',
        timeout: 30_000,
    });
    return page;
}

export const test = base.extend<WalletFixtures>({
    // Free-game fixtures — Anvil keys, no SIWE wait needed
    playerA: async ({ browser }, use) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await installMockWallet({
            page,
            account: privateKeyToAccount(ANVIL_PK_A),
            defaultChain: baseSepolia,
            transports: { [baseSepolia.id]: http() },
        });
        await page.goto(`/?e2e_pk=${ANVIL_PK_A}`);
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
        await installMockWallet({
            page,
            account: privateKeyToAccount(ANVIL_PK_B),
            defaultChain: baseSepolia,
            transports: { [baseSepolia.id]: http() },
        });
        await page.goto(`/?e2e_pk=${ANVIL_PK_B}`);
        await page.waitForSelector('[data-testid="wallet-connected"]', {
            state: 'attached',
            timeout: 30_000,
        });
        await use(page);
        await ctx.close();
    },

    // Crypto fixtures — funded Base Sepolia keys from .env.test
    cryptoPlayerA: async ({ browser }, use) => {
        if (!CRYPTO_PK_A || CRYPTO_PK_A === '0x')
            throw new Error('TEST_CRYPTO_PK_A must be set in .env.test');
        const page = await setupCryptoPage(browser, CRYPTO_PK_A);
        await use(page);
        await page.context().close();
    },

    cryptoPlayerB: async ({ browser }, use) => {
        if (!CRYPTO_PK_B || CRYPTO_PK_B === '0x')
            throw new Error('TEST_CRYPTO_PK_B must be set in .env.test');
        const page = await setupCryptoPage(browser, CRYPTO_PK_B);
        await use(page);
        await page.context().close();
    },

    cryptoPlayerC: async ({ browser }, use) => {
        if (!CRYPTO_PK_C || CRYPTO_PK_C === '0x')
            throw new Error('TEST_CRYPTO_PK_C must be set in .env.test');
        const page = await setupCryptoPage(browser, CRYPTO_PK_C);
        await use(page);
        await page.context().close();
    },
});

export { expect } from '@playwright/test';
