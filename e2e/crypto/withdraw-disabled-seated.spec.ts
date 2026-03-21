import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: withdraw shows warning while player is seated', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── PlayerB (seated) clicks Withdraw button ──
    await cryptoPlayerB
        .getByTestId('withdraw-btn')
        .last()
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('withdraw-btn').last().click();

    // ── Modal opens — verify seated warning is shown ──
    await expect(
        cryptoPlayerB.getByTestId('withdraw-seated-warning')
    ).toBeVisible({ timeout: 10_000 });

    // ── Verify the warning text ──
    await expect(
        cryptoPlayerB.getByTestId('withdraw-seated-warning')
    ).toContainText('leave the table before withdrawing');

    // ── Verify withdraw confirm button is disabled ──
    await expect(
        cryptoPlayerB.getByTestId('withdraw-confirm-btn')
    ).toBeDisabled();
});
