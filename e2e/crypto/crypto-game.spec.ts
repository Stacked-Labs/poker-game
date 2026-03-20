import { test, expect } from '../fixtures-wallet';

// Blockchain operations on Base Sepolia can take 1-2 min each.
const CHAIN_TIMEOUT = 120_000; // 2 min per on-chain step
const TEST_BUY_IN = '100'; // 100 chips = 1 USDC
const PK_A = process.env.TEST_CRYPTO_PK_A as string;

test('Crypto game: owner creates table and deposits to take seat', async ({
    cryptoPlayerA,
}) => {
    // ── Navigate to create-game — pass e2e_pk so E2EAutoConnect fires ──
    await cryptoPlayerA.goto(`/create-game?e2e_pk=${PK_A}`);
    await cryptoPlayerA.getByTestId('play-type-crypto').click();

    // create-game-btn only appears once SIWE auth is complete
    await cryptoPlayerA.getByTestId('create-game-btn').waitFor({ timeout: 60_000 });
    await cryptoPlayerA.getByTestId('create-game-btn').click();

    // Contract deployment via thirdweb Engine takes ~30-60s
    await cryptoPlayerA.waitForURL(/\/table\/.+/, { timeout: 60_000 });

    // Dismiss lobby banner if it appears
    const closeBtn = cryptoPlayerA.getByTestId('lobby-banner-close');
    try {
        await closeBtn.waitFor({ state: 'visible', timeout: 8_000 });
        await closeBtn.click();
        await closeBtn.waitFor({ state: 'hidden', timeout: 5_000 });
    } catch {
        // Banner never appeared — continue
    }

    // ── Click empty seat 1 and fill in join form ──
    await cryptoPlayerA.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await cryptoPlayerA.getByTestId('empty-seat-1').click();
    await cryptoPlayerA.getByTestId('username-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('username-input').fill('OwnerA');
    await cryptoPlayerA.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('buy-in-input').clear();
    await cryptoPlayerA.getByTestId('buy-in-input').fill(TEST_BUY_IN);

    // ── Click join — triggers USDC approve() then depositAndJoin() ──
    await cryptoPlayerA.getByTestId('join-table-btn').click();

    // ── Owner is seated once the indexer picks up the deposit event ──
    await expect(cryptoPlayerA.getByTestId('taken-seat-1')).toBeVisible({
        timeout: CHAIN_TIMEOUT,
    });
});
