import { test, expect } from '../fixtures-wallet';
import {
    dismissLobbyBanner,
    startGame,
    getActingPlayer,
} from '../helpers/common';

const CHAIN_TIMEOUT = 120_000;
const TEST_BUY_IN = '100';
const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto game: acting player folds — opponent wins, new hand starts', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    // ── PlayerA creates crypto game and deposits to seat 1 ──
    await cryptoPlayerA.goto(`/create-game?e2e_pk=${PK_A}`);
    await cryptoPlayerA.getByTestId('play-type-crypto').click();
    await cryptoPlayerA
        .getByTestId('create-game-btn')
        .waitFor({ timeout: 60_000 });
    await cryptoPlayerA.getByTestId('create-game-btn').click();
    await cryptoPlayerA.waitForURL(/\/table\/.+/, { timeout: 60_000 });
    const tableUrl = cryptoPlayerA.url();
    await dismissLobbyBanner(cryptoPlayerA);

    await cryptoPlayerA
        .getByTestId('empty-seat-1')
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerA.getByTestId('empty-seat-1').click();
    await cryptoPlayerA
        .getByTestId('buy-in-input')
        .waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('buy-in-input').clear();
    await cryptoPlayerA.getByTestId('buy-in-input').fill(TEST_BUY_IN);
    await cryptoPlayerA.getByTestId('join-table-btn').click();
    await cryptoPlayerA
        .getByTestId('taken-seat-1')
        .waitFor({ timeout: CHAIN_TIMEOUT });

    // ── PlayerB deposits to request seat 2 ──
    const tablePath = new URL(tableUrl).pathname;
    await cryptoPlayerB.goto(`${tablePath}?e2e_pk=${PK_B}`);
    await dismissLobbyBanner(cryptoPlayerB);

    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('empty-seat-2').click();
    await cryptoPlayerB
        .getByTestId('buy-in-input')
        .waitFor({ timeout: 5_000 });
    await cryptoPlayerB.getByTestId('buy-in-input').clear();
    await cryptoPlayerB.getByTestId('buy-in-input').fill(TEST_BUY_IN);
    await cryptoPlayerB.getByTestId('join-table-btn').click();

    // ── Owner accepts ──
    await expect(
        cryptoPlayerA.locator('[data-testid="seat-request-popup"]')
    ).toBeVisible({ timeout: CHAIN_TIMEOUT });
    await cryptoPlayerA
        .locator('[data-testid^="accept-player-"]')
        .first()
        .click();
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ timeout: 30_000 });
    await cryptoPlayerB
        .getByTestId('taken-seat-1')
        .waitFor({ timeout: 30_000 });
    await cryptoPlayerA
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });

    // ── Start game ──
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Acting player folds ──
    const { actor } = await getActingPlayer(cryptoPlayerA, cryptoPlayerB);
    await actor.getByTestId('action-fold').first().click();

    // ── New hand starts ──
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });
    await cryptoPlayerB
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await expect(
        cryptoPlayerA.getByTestId('player-hole-cards-1')
    ).toBeAttached({ timeout: 10_000 });
    await expect(
        cryptoPlayerB.getByTestId('player-hole-cards-2')
    ).toBeAttached({ timeout: 10_000 });
});
