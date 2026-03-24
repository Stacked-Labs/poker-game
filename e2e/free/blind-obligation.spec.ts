/**
 * Blind Obligation — free-game e2e tests
 *
 * Three-player layout: owner = seat 1, player2 = seat 2, player3 = seat 3.
 *
 * Scenario: owner queues "Sit out next hand" while hand 1 is in progress.
 * After hand 1 ends, owner sits out and the server sets their blind obligation
 * (they missed the blind they would have posted in hand 2). Because player2
 * and player3 are still ready, hand 2 auto-starts between them.
 *
 * While hand 2 is ongoing, owner must see BlindObligationControls in the
 * footer. player2 and player3 must not.
 *
 * Per Robert's Rules:
 *   - Missing BB only     → post live BB to re-enter immediately.
 *   - Missing SB + BB     → post dead SB + live BB, or wait for natural BB.
 *   - "Wait for BB"       → skip until the blind reaches your seat naturally.
 */

import { test, expect } from '@playwright/test';
import {
    setupFreeGameThreePlayers,
    startGame,
    endHandByFolding,
} from '../helpers/common';

test('Owner queues sit-out mid-hand → sees blind obligation controls during next hand', async ({
    browser,
}) => {
    const { owner, player2, player3, ctxOwner, ctxPlayer2, ctxPlayer3 } =
        await setupFreeGameThreePlayers(browser);

    // ── Start hand 1 ──────────────────────────────────────────────────────
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Owner queues "Sit out next hand" while IN hand 1 ──────────────────
    // Deferred path: SitOutNextHand = true; obligation is not set until the
    // hand ends and InitiateNewHand() processes the deferred sit-out.
    await owner.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();
    await expect(
        owner.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });

    // ── Play hand 1 to completion ──────────────────────────────────────────
    await endHandByFolding([owner, player2, player3]);

    // Owner is now sitting out; InitiateNewHand() has set their blind
    // obligation and broadcast the state. player2 + player3 are still ready
    // so hand 2 auto-starts between them.
    await expect(
        owner.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });

    // ── Wait for hand 2 to be running (player2 vs player3) ────────────────
    await player2
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // ── Owner sees BlindObligationControls DURING the ongoing hand ─────────
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).toBeVisible({ timeout: 15_000 });
    await expect(owner.getByTestId('blind-obligation-wait-bb')).toBeVisible();
    await expect(owner.getByTestId('blind-obligation-post-now')).toBeVisible();
    await expect(owner.getByTestId('blind-obligation-sit-out')).toBeVisible();

    // ── Other players must NOT see blind obligation controls ───────────────
    await expect(
        player2.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
    await expect(
        player3.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();

    await ctxOwner.close();
    await ctxPlayer2.close();
    await ctxPlayer3.close();
});

test('Owner with blind obligation can post now and clear the obligation', async ({
    browser,
}) => {
    const { owner, player2, player3, ctxOwner, ctxPlayer2, ctxPlayer3 } =
        await setupFreeGameThreePlayers(browser);

    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Owner queues sit-out mid-hand
    await owner.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();
    await endHandByFolding([owner, player2, player3]);

    // Wait for owner to be sitting out and hand 2 to start
    await expect(
        owner.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });
    await player2
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // Blind obligation controls appear while hand 2 is running
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).toBeVisible({ timeout: 15_000 });

    // ── Owner clicks "Post now" ────────────────────────────────────────────
    // "Post now" is a queued action — payOwedBlinds fires at the next preflop
    // boundary, NOT on click. The component also auto-queues "post_now" when
    // the obligation first appears, so clicking it may CANCEL the auto-queue
    // (toggle). Ensure it ends up queued before ending the hand.
    const postBtn = owner.getByTestId('blind-obligation-post-now');
    await postBtn.click();
    if (!(await postBtn.textContent())?.includes('Queued')) {
        await postBtn.click(); // auto-queue was cancelled — re-queue
    }
    await expect(postBtn).toContainText('Queued');

    // End hand 2 so the queued post executes at the next preflop boundary
    await endHandByFolding([player2, player3], 1);

    // Controls disappear once payOwedBlinds is processed and obligation cleared
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).not.toBeVisible({ timeout: 30_000 });

    await ctxOwner.close();
    await ctxPlayer2.close();
    await ctxPlayer3.close();
});
