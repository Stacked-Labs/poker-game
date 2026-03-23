import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers, openSettingsTab } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: owner updates blinds between hands', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Owner opens Settings > Settings tab ──
    await openSettingsTab(cryptoPlayerA, 'Settings');

    // ── Owner changes small blind to 10 ──
    const sbInput = cryptoPlayerA.getByTestId('sb-input');
    await sbInput.waitFor({ timeout: 5_000 });
    await sbInput.clear();
    await sbInput.fill('10');

    // ── Owner changes big blind to 20 ──
    const bbInput = cryptoPlayerA.getByTestId('bb-input');
    await bbInput.clear();
    await bbInput.fill('20');

    // ── Owner confirms blind changes ──
    await cryptoPlayerA.getByTestId('blinds-confirm-btn').click();

    // ── Close settings ──
    await cryptoPlayerA.getByTestId('settings-close-btn').click();

    // ── Verify: blind display shows pending update ──
    await expect(cryptoPlayerA.getByText('NEXT HAND: 10/20')).toBeVisible({ timeout: 10_000 });
});
