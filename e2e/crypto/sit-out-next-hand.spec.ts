import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameTwoPlayers,
    startGame,
    playHandToCompletion,
} from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: player sits out next hand — marked away, clicks I\'m Back to rejoin', async ({
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

    // ── Verify: button now shows "Cancel sit out" ──
    await expect(
        cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });

    // ── Play out the current hand ──
    await playHandToCompletion(cryptoPlayerA, cryptoPlayerB);

    // ── After hand: playerB becomes away, button changes to "I'm back" ──
    await expect(
        cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });

    // ── PlayerB clicks "I'm Back" to rejoin ──
    await cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();

    // ── Verify: button transitions through "Cancel rejoin" then back to "Sit out next hand" ──
    await expect(
        cryptoPlayerB.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Sit out next hand', { timeout: 30_000 });

    // ── Both players are still seated ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });
});
