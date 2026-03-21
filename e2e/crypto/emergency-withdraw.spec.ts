import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers, openSettingsTab } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: owner triggers emergency withdraw', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Owner opens Settings > Players tab (WithdrawBalanceCard is here) ──
    await openSettingsTab(cryptoPlayerA, 'Players');

    // ── Owner clicks Emergency Withdraw button ──
    await cryptoPlayerA
        .getByTestId('emergency-withdraw-btn')
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerA.getByTestId('emergency-withdraw-btn').click();

    // ── Wait for transaction to complete — button text changes to "Done" ──
    await expect(
        cryptoPlayerA.getByTestId('emergency-withdraw-btn')
    ).toHaveText('Done', { timeout: 120_000 });
});
