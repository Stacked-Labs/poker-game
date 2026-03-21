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

test('Crypto game: player raises — pot increases, opponent sees call', async ({
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

    // ── Acting player raises ──
    const { actor, opponent } = await getActingPlayer(
        cryptoPlayerA,
        cryptoPlayerB
    );

    // Open raise input box (.first() for portrait/landscape duplicates)
    await actor.getByTestId('action-raise').first().click();
    await actor
        .getByTestId('raise-input')
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 });
    // Submit raise with default amount (scoped to the RaiseInputBox group)
    await actor
        .locator('.raise-action-buttons-group [data-testid="action-raise"]')
        .click();

    // ── Opponent is now acting and sees call button ──
    await opponent
        .locator('[data-testid="action-call"]:not([data-queue-mode])')
        .waitFor({ state: 'visible', timeout: 10_000 });

    // ── Opponent calls ──
    await opponent.getByTestId('action-call').first().click();

    // ── Postflop: pot should be 40 ──
    await opponent
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });
    await expect(opponent.getByTestId('pot-amount')).toContainText('40', {
        timeout: 10_000,
    });
});
