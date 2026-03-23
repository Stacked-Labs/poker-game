import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers, startGame } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: owner pauses and resumes game', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Owner clicks pause ──
    await cryptoPlayerA.getByTestId('pause-btn').waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('pause-btn').click();

    // ── Verify: pause button changes to resume ──
    await expect(
        cryptoPlayerA.getByTestId('pause-btn')
    ).toHaveAttribute('aria-label', 'Cancel Pause', { timeout: 10_000 });

    // ── Owner clicks resume ──
    await cryptoPlayerA.getByTestId('pause-btn').click();

    // ── Verify: button changes back to pause ──
    await expect(
        cryptoPlayerA.getByTestId('pause-btn')
    ).toHaveAttribute('aria-label', 'Pause Game', { timeout: 10_000 });
});
