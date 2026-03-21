import { test, expect } from '../fixtures-wallet';
import { dismissLobbyBanner } from '../helpers/common';

const CHAIN_TIMEOUT = 120_000;
const TEST_BUY_IN = '100';
const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Requester cancels crypto seat request — both sides reset', async ({
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

    // ── PlayerB navigates to table and deposits to request seat 2 ──
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

    // ── Wait for seat request to register (on-chain deposit picked up by indexer) ──
    await expect(
        cryptoPlayerA.locator('[data-testid="seat-request-popup"]')
    ).toBeVisible({ timeout: CHAIN_TIMEOUT });
    await expect(
        cryptoPlayerB.getByTestId('cancel-seat-request')
    ).toBeVisible({ timeout: 10_000 });

    // ── PlayerB cancels ──
    await cryptoPlayerB.getByTestId('cancel-seat-request').click();

    // ── PlayerB: cancel badge disappears, seat 2 is available again ──
    await cryptoPlayerB
        .getByTestId('cancel-seat-request')
        .waitFor({ state: 'hidden', timeout: 10_000 });
    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    // ── Owner: popup disappears ──
    await cryptoPlayerA
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });
});
