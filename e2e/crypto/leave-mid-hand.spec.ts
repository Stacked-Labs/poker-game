import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameTwoPlayers,
    startGame,
    getActingPlayer,
    clickCheckOrCall,
} from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: player requests leave mid-hand — removed after hand completes', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── PlayerB clicks Leave mid-hand (.last() = desktop navbar) ──
    await cryptoPlayerB.getByTestId('leave-table-btn').last().click();

    // ── Verify: leave button toggles to "cancel" state ──
    await expect(
        cryptoPlayerB.getByTestId('leave-table-btn').last()
    ).toHaveAttribute('aria-pressed', 'true', { timeout: 5_000 });

    // ── Play out the hand (check/call through all streets) ──
    let result = await getActingPlayer(cryptoPlayerA, cryptoPlayerB);
    await clickCheckOrCall(result.actor);
    result = await getActingPlayer(cryptoPlayerA, cryptoPlayerB);
    await clickCheckOrCall(result.actor);

    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    for (let street = 0; street < 3; street++) {
        result = await getActingPlayer(cryptoPlayerA, cryptoPlayerB);
        await clickCheckOrCall(result.actor);
        result = await getActingPlayer(cryptoPlayerA, cryptoPlayerB);
        await clickCheckOrCall(result.actor);
    }

    // ── Owner: taken-seat-2 disappears after hand completes ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'hidden', timeout: 30_000 });

    // ── PlayerB: now unseated, sees empty-seat-2 available ──
    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 30_000 });
});
