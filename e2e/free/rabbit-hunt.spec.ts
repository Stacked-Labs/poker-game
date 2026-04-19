/**
 * Rabbit Hunt E2E Tests (non-crypto, free tables)
 *
 * Tests all rabbit hunting scenarios:
 *   - Feature disabled by default
 *   - Non-owner cannot toggle
 *   - Owner enables feature
 *   - Preflop fold → 5 rabbit placeholders → click reveals all
 *   - Flop fold  → 2 rabbit placeholders → click reveals all
 *   - Turn fold  → 1 rabbit placeholder  → click reveals all
 *   - River fold → 0 rabbit placeholders (all 5 cards already on board)
 *   - Rabbit cards cleared on next hand
 */

import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    getActingPlayer,
    openSettingsTab,
    enableRabbitHunt,
    completeStreet,
} from '../helpers/common';

// ──────────────────────────────────────────────────────────────────
// Helper: fold whoever has the action, return both pages for checks.
// ──────────────────────────────────────────────────────────────────
async function foldActivePlayer(
    pageA: import('@playwright/test').Page,
    pageB: import('@playwright/test').Page
) {
    const { actor, opponent } = await getActingPlayer(pageA, pageB);
    await actor.getByTestId('action-fold').first().click();
    // If the fold-guard modal appears (player can check for free), confirm fold anyway.
    const foldAnywayBtn = actor.getByTestId('fold-anyway-btn');
    if (await foldAnywayBtn.isVisible({ timeout: 1_500 }).catch(() => false)) {
        await foldAnywayBtn.click();
    }
    return { actor, opponent };
}

// ──────────────────────────────────────────────────────────────────
// 1. Disabled by default — no rabbit placeholders after preflop fold
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt disabled by default — no placeholders after fold', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await foldActivePlayer(owner, player);

    // No rabbit placeholder should appear on either page
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).not.toBeVisible({
        timeout: 4_000,
    });
    await expect(player.getByTestId('rabbit-card-placeholder').first()).not.toBeVisible({
        timeout: 4_000,
    });

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 2. Non-owner cannot toggle rabbit hunt
// ──────────────────────────────────────────────────────────────────
test('Non-owner rabbit hunt toggle is disabled', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await openSettingsTab(player, 'Settings');
    const toggle = player.getByTestId('rabbit-hunt-toggle');
    await toggle.waitFor({ timeout: 5_000 });
    await expect(toggle).toBeDisabled();

    await player.getByTestId('settings-close-btn').click();
    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 3. Preflop fold → 5 rabbit placeholders → click reveals all
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: preflop fold shows 5 rabbit placeholders, click reveals all', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await foldActivePlayer(owner, player);

    // 5 rabbit placeholders should appear (all community card slots)
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });
    const placeholders = owner.getByTestId('rabbit-card-placeholder');
    await expect(placeholders).toHaveCount(5, { timeout: 8_000 });

    // Clicking one placeholder reveals all 5 rabbit cards
    await placeholders.first().click();

    await expect(owner.getByTestId('rabbit-card-placeholder')).toHaveCount(0, {
        timeout: 5_000,
    });
    // All 5 rabbit card slots should now show revealed cards
    for (let i = 0; i < 5; i++) {
        await expect(owner.getByTestId(`rabbit-card-${i}`)).toBeVisible({
            timeout: 5_000,
        });
    }

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 4. Flop fold → 2 rabbit placeholders (turn + river) → click reveals
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: fold on flop shows 2 rabbit placeholders', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Complete preflop (SB call + BB check) → advances to flop
    await completeStreet(owner, player);
    await owner
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    // Fold on the flop
    await foldActivePlayer(owner, player);

    // 2 rabbit placeholders (turn + river slots)
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });
    await expect(owner.getByTestId('rabbit-card-placeholder')).toHaveCount(2, {
        timeout: 8_000,
    });

    // Click reveals both
    await owner.getByTestId('rabbit-card-placeholder').first().click();
    await expect(owner.getByTestId('rabbit-card-placeholder')).toHaveCount(0, {
        timeout: 5_000,
    });
    await expect(owner.getByTestId('rabbit-card-3')).toBeVisible({ timeout: 5_000 });
    await expect(owner.getByTestId('rabbit-card-4')).toBeVisible({ timeout: 5_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 5. Turn fold → 1 rabbit placeholder (river) → click reveals
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: fold on turn shows 1 rabbit placeholder', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Complete preflop → flop
    await completeStreet(owner, player);
    await owner
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    // Complete flop → turn (community cards count goes from 3 to 4)
    await completeStreet(owner, player);
    // Wait for the 4th community card to appear (turn card slot, index 3)
    await owner.getByTestId('rabbit-card-placeholder').waitFor({
        state: 'detached',
        timeout: 8_000,
    }).catch(() => {/* may not have been visible yet */});
    // Small settle time for the turn card to be dealt
    await owner.waitForTimeout(600);

    // Fold on the turn
    await foldActivePlayer(owner, player);

    // 1 rabbit placeholder (river slot only)
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });
    await expect(owner.getByTestId('rabbit-card-placeholder')).toHaveCount(1, {
        timeout: 8_000,
    });

    // Click reveals the river card
    await owner.getByTestId('rabbit-card-placeholder').first().click();
    await expect(owner.getByTestId('rabbit-card-placeholder')).toHaveCount(0, {
        timeout: 5_000,
    });
    await expect(owner.getByTestId('rabbit-card-4')).toBeVisible({ timeout: 5_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 6. River fold — all 5 community cards dealt → no rabbit placeholders
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: fold on river shows no rabbit placeholders (all dealt)', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Advance to river: preflop + flop + turn
    await completeStreet(owner, player);
    await owner
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });
    await completeStreet(owner, player);
    await owner.waitForTimeout(800); // turn card dealt
    await completeStreet(owner, player);
    await owner.waitForTimeout(800); // river card dealt

    // Fold on the river
    await foldActivePlayer(owner, player);

    // No rabbit placeholders — all 5 cards already on board
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).not.toBeVisible({
        timeout: 5_000,
    });

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 7. Rabbit cards cleared when next hand starts
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: placeholders disappear when next hand starts', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await foldActivePlayer(owner, player);

    // Rabbit placeholders visible
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });

    // Mark ready → next hand begins automatically
    const readyBtn = owner.getByTestId('action-ready').first();
    if (await readyBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await readyBtn.click();
    }
    const readyBtnP = player.getByTestId('action-ready').first();
    if (await readyBtnP.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await readyBtnP.click();
    }

    // Wait for new hand (back to preflop)
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 20_000 });

    // Rabbit placeholders should be gone
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).not.toBeVisible({
        timeout: 5_000,
    });

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 8. Both players see rabbit placeholders (broadcast state check)
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: both players see the same rabbit placeholders', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await foldActivePlayer(owner, player);

    // Both pages should show the same rabbit placeholder count (5 preflop)
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });
    await expect(player.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });
    await expect(owner.getByTestId('rabbit-card-placeholder')).toHaveCount(5, {
        timeout: 8_000,
    });
    await expect(player.getByTestId('rabbit-card-placeholder')).toHaveCount(5, {
        timeout: 8_000,
    });

    await ctxOwner.close();
    await ctxPlayer.close();
});

// ──────────────────────────────────────────────────────────────────
// 9. Toggle rabbit hunt off mid-session — next fold produces no rabbit cards
// ──────────────────────────────────────────────────────────────────
test('Rabbit hunt: disabling mid-session stops rabbit cards on next hand', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // Enable, verify works, then disable
    await enableRabbitHunt(owner);
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    await foldActivePlayer(owner, player);

    // Confirm enabled: placeholders appear
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).toBeVisible({
        timeout: 8_000,
    });

    // Now disable rabbit hunt via settings
    await openSettingsTab(owner, 'Settings');
    const toggle = owner.getByTestId('rabbit-hunt-toggle');
    await toggle.waitFor({ timeout: 5_000 });
    if (await toggle.isChecked()) {
        await toggle.click();
    }
    await owner.getByTestId('settings-close-btn').click();

    // Start next hand
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 20_000 });

    await foldActivePlayer(owner, player);

    // No rabbit placeholders this time
    await expect(owner.getByTestId('rabbit-card-placeholder').first()).not.toBeVisible({
        timeout: 5_000,
    });

    await ctxOwner.close();
    await ctxPlayer.close();
});
