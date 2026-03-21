import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameTwoPlayers,
    startGame,
    getActingPlayer,
} from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: winner can show cards after opponent folds', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Determine who acts first and make one player fold ──
    const { actor, opponent } = await getActingPlayer(cryptoPlayerA, cryptoPlayerB);
    await actor.getByTestId('action-fold').first().click();

    // ── Winner should see "Show Cards" button ──
    await opponent
        .getByTestId('action-show')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 });

    // ── Winner clicks "Show Cards" ──
    await opponent.getByTestId('action-show').first().click();

    // ── Verify: show button becomes disabled after clicking ──
    await expect(
        opponent.getByTestId('action-show').first()
    ).toBeDisabled({ timeout: 10_000 });
});
