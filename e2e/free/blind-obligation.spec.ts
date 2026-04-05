/**
 * Blind Obligation — free-game e2e tests
 *
 * Three-player layout: owner = seat 1, player2 = seat 2, player3 = seat 3.
 *
 * Scenario: owner queues "Sit out next hand" while hand 1 is in progress.
 * Blind obligation is not created at click-time. It is created when a later
 * hand starts and a blind position actually passes through the missing seat.
 * Because player2 and player3 are still ready, hand 2 auto-starts between them.
 *
 * While hand 2 is ongoing, owner must see BlindObligationControls in the
 * footer. player2 and player3 must not.
 *
 * Per Robert's Rules:
 *   - Missing BB only     → post live BB to re-enter immediately.
 *   - Missing SB + BB     → post dead SB + live BB, or wait for natural BB.
 *   - "Wait for BB"       → skip until the blind reaches your seat naturally.
 */

import { test, expect, type Locator } from '@playwright/test';
import {
    setupFreeGameThreePlayers,
    startGame,
    endHandByFolding,
} from '../helpers/common';

async function parseNumericText(locator: Locator) {
    const raw = (await locator.first().textContent()) ?? '';
    const normalized = raw.replace(/,/g, '').trim();
    const value = Number.parseFloat(normalized);
    if (Number.isNaN(value)) {
        throw new Error(`Could not parse numeric value from "${raw}"`);
    }
    return value;
}

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
    // Deferred path: SitOutNextHand = true; obligation is not set immediately.
    await owner.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();
    await expect(
        owner.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();

    // ── Play hand 1 to completion ──────────────────────────────────────────
    await endHandByFolding([owner, player2, player3]);

    // Owner is now sitting out. Once hand 2 starts and blinds are assigned,
    // missed-blind obligation is broadcast.
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
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
    await endHandByFolding([owner, player2, player3]);

    // Wait for owner to be sitting out and hand 2 to start
    await expect(
        owner.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });
    await player2
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });
    const hand2Pot = await parseNumericText(player2.getByTestId('pot-amount'));
    const ownerStackBeforePost = await parseNumericText(
        owner.getByTestId('player-stack-1')
    );

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
    await endHandByFolding([owner, player2, player3], 1);

    // Controls disappear once payOwedBlinds is processed and obligation cleared
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).not.toBeVisible({ timeout: 30_000 });
    await expect(
        owner.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).not.toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });
    // End hand 3 so the queued post can be checked if its actually in the pot
    endHandByFolding([owner, player2, player3]);
    const hand3Pot = await parseNumericText(owner.getByTestId('pot-amount'));
    const ownerStackAfterPost = await parseNumericText(
        owner.getByTestId('player-stack-1')
    );
    expect(hand3Pot).toBeGreaterThan(hand2Pot);
    expect(ownerStackAfterPost).toBeLessThan(ownerStackBeforePost);

    await ctxOwner.close();
    await ctxPlayer2.close();
    await ctxPlayer3.close();
});

/**
 * Non-owner player blind obligation tests.
 *
 * Three-player layout: owner = seat 1 (BTN in hand 1), player2 = seat 2 (SB),
 * player3 = seat 3 (BB).
 *
 * Scenario: player3 (BB, not the table owner) queues "Sit out next hand" while
 * hand 1 is in progress. Obligation is created only when a blind is actually
 * missed in a later hand. Because owner and player2 are still ready, hand 2
 * auto-starts between them.
 *
 * While hand 2 is ongoing:
 *   - player3 must see BlindObligationControls
 *   - owner and player2 must NOT see the controls
 */

test('Non-owner player3 (BB) queues sit-out mid-hand → sees blind obligation controls during next hand', async ({
    browser,
}) => {
    const { owner, player2, player3, ctxOwner, ctxPlayer2, ctxPlayer3 } =
        await setupFreeGameThreePlayers(browser);

    // ── Start hand 1 ──────────────────────────────────────────────────────
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Player3 (BB) queues "Sit out next hand" while IN hand 1 ──────────
    await player3.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();
    await expect(
        player3.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });
    await expect(
        player3.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();

    // ── Play hand 1 to completion ──────────────────────────────────────────
    await endHandByFolding([owner, player2, player3]);

    // Player3 is now sitting out. Owner + player2 are still ready so hand 2
    // auto-starts; missed-blind obligation appears once the blind passes.
    await expect(
        player3.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });

    // ── Wait for hand 2 to be running (owner vs player2) ──────────────────
    await player3
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // ── Player3 sees BlindObligationControls DURING the ongoing hand ───────
    await expect(
        player3.getByTestId('blind-obligation-controls')
    ).toBeVisible({ timeout: 15_000 });
    await expect(player3.getByTestId('blind-obligation-wait-bb')).toBeVisible();
    await expect(player3.getByTestId('blind-obligation-post-now')).toBeVisible();
    await expect(player3.getByTestId('blind-obligation-sit-out')).toBeVisible();

    // ── Owner and player2 must NOT see blind obligation controls ──────────
    await expect(
        owner.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
    await expect(
        player2.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();

    await ctxOwner.close();
    await ctxPlayer2.close();
    await ctxPlayer3.close();
});

test('Non-owner player3 (BB) with blind obligation can post now and clear the obligation', async ({
    browser,
}) => {
    const { owner, player2, player3, ctxOwner, ctxPlayer2, ctxPlayer3 } =
        await setupFreeGameThreePlayers(browser);

    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Player3 (BB) queues sit-out mid-hand.
    await player3.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();
    await expect(
        player3.getByTestId('blind-obligation-controls')
    ).not.toBeVisible();
    await endHandByFolding([owner, player2, player3]);

    // Wait for player3 to be sitting out and hand 2 (owner vs player2) to start
    await expect(
        player3.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });
    await player3
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });
    const hand2Pot = await parseNumericText(player3.getByTestId('pot-amount'));
    const player3StackBeforePost = await parseNumericText(
        player3.getByTestId('player-stack-3')
    );

    // Blind obligation controls appear for player3 while hand 2 is running
    await expect(
        player3.getByTestId('blind-obligation-controls')
    ).toBeVisible({ timeout: 15_000 });

    // ── Player3 clicks "Post now" ──────────────────────────────────────────
    // "Post now" is a queued action — payOwedBlinds fires at the next preflop
    // boundary. The component auto-queues it on appearance; clicking may cancel
    // (toggle). Ensure it ends up queued before ending the hand.
    const postBtn = player3.getByTestId('blind-obligation-post-now');
    await postBtn.click();
    if (!(await postBtn.textContent())?.includes('Queued')) {
        await postBtn.click(); // auto-queue was cancelled — re-queue
    }
    await expect(postBtn).toContainText('Queued');

    // End hand 2 so the queued post executes at the next preflop boundary
    await endHandByFolding([owner, player2], 1);

    // Controls disappear once payOwedBlinds is processed and obligation cleared
    await expect(
        player3.getByTestId('blind-obligation-controls')
    ).not.toBeVisible({ timeout: 30_000 });
    await expect(
        player3.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).not.toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });
    await player3
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });
    const hand3Pot = await parseNumericText(player3.getByTestId('pot-amount'));
    const player3StackAfterPost = await parseNumericText(
        player3.getByTestId('player-stack-3')
    );
    expect(hand3Pot).toBeGreaterThan(hand2Pot);
    expect(player3StackAfterPost).toBeLessThan(player3StackBeforePost);

    await ctxOwner.close();
    await ctxPlayer2.close();
    await ctxPlayer3.close();
});
