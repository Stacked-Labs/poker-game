import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers, startGame } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: player disconnects and reconnects mid-hand — can resume play', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Save table URL ──
    const tableUrl = cryptoPlayerB.url();

    // ── Simulate disconnect: navigate away ──
    await cryptoPlayerB.goto('about:blank');
    await cryptoPlayerA.waitForTimeout(2_000);

    // ── Reconnect: navigate back to table ──
    await cryptoPlayerB.goto(`${tableUrl}`);

    // ── Verify: playerB can see the table and owner is seated ──
    await cryptoPlayerB
        .getByTestId('taken-seat-1')
        .waitFor({ state: 'visible', timeout: 30_000 });

    // ── Verify: owner still sees playerB seated ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    // ── Verify: playerB has action buttons (can still play) ──
    await cryptoPlayerB
        .getByTestId('action-fold')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 });
});
