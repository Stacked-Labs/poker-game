import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameTwoPlayers,
    startGame,
    playHandToCompletion,
} from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: player cancels sit out before hand ends — stays active next hand', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── PlayerB clicks "Sit out next hand" (.first() = landscape navbar) ──
    await cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();

    // ── Verify: sit out requested ──
    await expect(
        cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });

    // ── PlayerB cancels sit out ──
    await cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();

    // ── Verify: back to normal "Sit out next hand" ──
    await expect(
        cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Sit out next hand', { timeout: 5_000 });

    // ── Play out the hand ──
    await playHandToCompletion(cryptoPlayerA, cryptoPlayerB);

    // ── Next hand starts normally with both players ──
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // ── Both players still seated and active ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });
});
