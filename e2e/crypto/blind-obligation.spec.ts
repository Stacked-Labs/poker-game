/**
 * Blind Obligation — crypto-game e2e tests
 *
 * Three-player layout: cryptoPlayerA = seat 1 (owner), cryptoPlayerB = seat 2,
 * cryptoPlayerC = seat 3.
 *
 * Scenario: owner queues "Sit out next hand" while hand 1 is in progress.
 * Blind obligation is NOT created at click-time. It is created only when a
 * subsequent hand starts and a blind position passes through the missing seat.
 * Because playerB and playerC are still ready, hand 2 auto-starts between them.
 *
 * While hand 2 is ongoing, owner must see BlindObligationControls. playerB
 * and playerC must not.
 *
 * Per Robert's Rules:
 *   - Missing BB only     → post live BB to re-enter immediately.
 *   - Missing SB + BB     → post dead SB + live BB, or wait for natural BB.
 *   - "Wait for BB"       → skip until the blind reaches your seat naturally.
 *
 * Crypto-specific notes:
 *   - Setup uses on-chain deposits — allow CHAIN_TIMEOUT for seat confirmation.
 *   - All other assertions are pure game-state (WebSocket) and run at the same
 *     speed as free-game tests once the table is live.
 */

import { test, expect } from '../fixtures-wallet';
import {
    setupCryptoGameThreePlayers,
    startGame,
    endHandByFolding,
} from '../helpers/common';

const CHAIN_TIMEOUT = 120_000;
const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;
const PK_C = process.env.TEST_CRYPTO_PK_C as string;

test('Crypto: owner queues sit-out mid-hand → sees blind obligation controls during next hand', async ({
    cryptoPlayerA,
    cryptoPlayerB,
    cryptoPlayerC,
}) => {
    await setupCryptoGameThreePlayers(
        cryptoPlayerA, cryptoPlayerB, cryptoPlayerC,
        PK_A, PK_B, PK_C,
        '100', CHAIN_TIMEOUT
    );

    // ── Start hand 1 ──────────────────────────────────────────────────────
    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Owner (seat 1) queues "Sit out next hand" while IN hand 1 ─────────
    await cryptoPlayerA
        .locator('.navbar-away-wrapper [data-testid="away-btn"]')
        .click();
    await expect(
        cryptoPlayerA.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });
    // Obligation should not exist yet while still in hand 1.
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();

    // ── End hand 1 quickly (fold owner then next player) ──────────────────
    await endHandByFolding([cryptoPlayerA, cryptoPlayerB, cryptoPlayerC]);

    // Owner is now sitting out; InitiateNewHand() sets the blind obligation
    // and broadcasts. playerB + playerC are still ready so hand 2 auto-starts.
    await expect(
        cryptoPlayerA.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });

    // ── Wait for hand 2 to be running (playerB vs playerC) ────────────────
    await cryptoPlayerB
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // ── Owner sees BlindObligationControls DURING the ongoing hand ─────────
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-controls')
    ).toBeVisible({ timeout: 15_000 });
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-wait-bb')
    ).toBeVisible();
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-post-now')
    ).toBeVisible();
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-sit-out')
    ).toBeVisible();

    // ── Other players must NOT see blind obligation controls ───────────────
    await expect(
        cryptoPlayerB.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
    await expect(
        cryptoPlayerC.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
});

test('Crypto: owner with blind obligation can post now and clear the obligation', async ({
    cryptoPlayerA,
    cryptoPlayerB,
    cryptoPlayerC,
}) => {
    await setupCryptoGameThreePlayers(
        cryptoPlayerA, cryptoPlayerB, cryptoPlayerC,
        PK_A, PK_B, PK_C,
        '100', CHAIN_TIMEOUT
    );

    await startGame(cryptoPlayerA);
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Owner queues sit-out mid-hand
    await cryptoPlayerA
        .locator('.navbar-away-wrapper [data-testid="away-btn"]')
        .click();
    // No obligation yet; it should appear only after a blind is actually missed.
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
    await endHandByFolding([cryptoPlayerA, cryptoPlayerB, cryptoPlayerC]);

    // Wait for owner to be sitting out and hand 2 to start
    await expect(
        cryptoPlayerA.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });
    await cryptoPlayerB
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // Blind obligation controls appear while hand 2 is running
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-controls')
    ).toBeVisible({ timeout: 15_000 });

    // ── Owner clicks "Post now" ────────────────────────────────────────────
    // "Post now" is queued, not immediate — payOwedBlinds fires at the next
    // preflop boundary. The component auto-queues it; clicking may cancel
    // (toggle). Ensure the action ends up queued before ending the hand.
    const postBtn = cryptoPlayerA.getByTestId('blind-obligation-post-now');
    await postBtn.click();
    if (!(await postBtn.textContent())?.includes('Queued')) {
        await postBtn.click(); // auto-queue was cancelled — re-queue
    }
    await expect(postBtn).toContainText('Queued');

    // End hand 2 so the queued post executes at the next preflop boundary
    await endHandByFolding([cryptoPlayerB, cryptoPlayerC], 1);

    // Controls disappear once payOwedBlinds is processed and obligation cleared
    await expect(
        cryptoPlayerA.getByTestId('blind-obligation-controls')
    ).not.toBeVisible({ timeout: 30_000 });
});
