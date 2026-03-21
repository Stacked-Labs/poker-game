import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameTwoPlayers,
    startGame,
    dismissLobbyBanner,
} from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: spectator can view game but has no action buttons', async ({
    cryptoPlayerA,
    cryptoPlayerB,
    browser,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── Spectator joins same table without sitting ──
    const ctxSpectator = await browser.newContext();
    const spectator = await ctxSpectator.newPage();
    const tablePath = new URL(cryptoPlayerA.url()).pathname;
    await spectator.goto(tablePath);
    await dismissLobbyBanner(spectator);

    // ── Verify: spectator sees both seated players ──
    await spectator
        .getByTestId('taken-seat-1')
        .waitFor({ state: 'visible', timeout: 15_000 });
    await spectator
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Verify: spectator does NOT see action buttons ──
    await expect(spectator.getByTestId('action-fold').first()).toBeHidden({
        timeout: 5_000,
    });

    await ctxSpectator.close();
});
