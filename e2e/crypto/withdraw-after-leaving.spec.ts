import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: player withdraws after leaving table', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── PlayerB leaves the table ──
    await cryptoPlayerB.getByTestId('leave-table-btn').last().click();

    // ── Owner sees player removed ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'hidden', timeout: 30_000 });

    // ── PlayerB sees they are unseated ──
    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 30_000 });

    // ── PlayerB clicks Withdraw button (.last() = landscape navbar) ──
    await cryptoPlayerB
        .getByTestId('withdraw-btn')
        .last()
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('withdraw-btn').last().click();

    // ── Withdraw modal opens — verify balance is shown ──
    await cryptoPlayerB
        .getByTestId('withdraw-confirm-btn')
        .waitFor({ timeout: 10_000 });

    // ── Verify no seated warning is shown ──
    await expect(
        cryptoPlayerB.getByTestId('withdraw-seated-warning')
    ).toBeHidden();

    // ── Click withdraw confirm ──
    await cryptoPlayerB.getByTestId('withdraw-confirm-btn').click();

    // ── Wait for transaction to complete (modal closes on success) ──
    await cryptoPlayerB
        .getByTestId('withdraw-confirm-btn')
        .waitFor({ state: 'hidden', timeout: 120_000 });
});
