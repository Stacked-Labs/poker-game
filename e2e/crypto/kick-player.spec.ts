import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers, openSettingsTab } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: owner kicks seated player — player removed, seat available', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Owner opens Settings > Players tab ──
    await openSettingsTab(cryptoPlayerA, 'Players');

    // ── Owner clicks kick on player B ──
    await cryptoPlayerA
        .locator('[data-testid^="kick-player-"]')
        .first()
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerA
        .locator('[data-testid^="kick-player-"]')
        .first()
        .click();

    // ── Confirmation dialog appears — owner confirms kick ──
    await cryptoPlayerA
        .getByTestId('confirm-kick-btn')
        .waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('confirm-kick-btn').click();

    // ── Wait for confirmation dialog to close ──
    await cryptoPlayerA
        .getByTestId('confirm-kick-btn')
        .waitFor({ state: 'hidden', timeout: 5_000 });

    // ── Close settings modal ──
    await cryptoPlayerA.getByTestId('settings-close-btn').click();

    // ── Owner: taken-seat-2 disappears ──
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'hidden', timeout: 30_000 });

    // ── PlayerB: now unseated, sees empty-seat-2 available ──
    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 30_000 });
});
