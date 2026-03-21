import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: player leaves between hands — immediately removed', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── PlayerB clicks Leave (.last() = desktop navbar) ──
    await cryptoPlayerB.getByTestId('leave-table-btn').last().click();

    // ── Owner: taken-seat-2 disappears ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'hidden', timeout: 30_000 });

    // ── PlayerB: now unseated, sees empty-seat-2 available ──
    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 30_000 });
});
