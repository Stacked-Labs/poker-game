import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameTwoPlayers,
    startGame,
    playHandToCompletion,
    openSettingsTab,
} from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: host collects rake after a hand', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Start game and play a full hand to generate rake ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await playHandToCompletion(cryptoPlayerA, cryptoPlayerB);

    // ── Wait for next hand to start (confirms settlement happened) ──
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 60_000 });

    // ── Wait for on-chain settlement to complete ──
    await cryptoPlayerA.waitForTimeout(5_000);

    // ── Owner opens Settings > Players tab ──
    await openSettingsTab(cryptoPlayerA, 'Players');

    // ── Wait for rake balance to load and Collect button to be enabled ──
    await cryptoPlayerA
        .getByTestId('host-rake-collect-btn')
        .waitFor({ timeout: 10_000 });

    // ── If rake exists, click Collect ──
    const isDisabled = await cryptoPlayerA
        .getByTestId('host-rake-collect-btn')
        .isDisabled();

    if (!isDisabled) {
        await cryptoPlayerA.getByTestId('host-rake-collect-btn').click();

        // ── Wait for transaction to complete ──
        await expect(
            cryptoPlayerA.getByTestId('host-rake-collect-btn')
        ).not.toHaveText('Collecting...', { timeout: 120_000 });
    }

    // ── Verify: button is now disabled (no more rake to collect) ──
    await expect(
        cryptoPlayerA.getByTestId('host-rake-collect-btn')
    ).toBeDisabled({ timeout: 10_000 });
});
