import { test, expect } from '@playwright/test';
import {
    dismissLobbyBanner,
    setupFreeGameTwoPlayers,
    startGame,
    getActingPlayer,
} from '../helpers/common';

/**
 * Wait until the game-stage element transitions to 'preflop' or 'waiting'.
 * Uses waitForFunction to avoid portrait/landscape CSS visibility issues.
 */
async function waitForHandConclusion(page: import('@playwright/test').Page) {
    await page.waitForFunction(
        () => {
            const el = document.querySelector('[data-testid="game-stage"]');
            const stage = el?.getAttribute('data-stage');
            return stage === 'preflop' || stage === 'waiting';
        },
        null,
        { timeout: 30_000 },
    );
}

/**
 * Go all-in: opens the raise panel, clicks "All In", then submits.
 */
async function goAllIn(page: import('@playwright/test').Page) {
    const raiseBtn = page
        .locator('[data-testid="action-raise"]:visible, [data-testid="action-bet"]:visible')
        .first();
    await raiseBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await raiseBtn.click();

    const allInBtn = page.getByRole('button', { name: 'All In' }).first();
    await allInBtn.waitFor({ state: 'visible', timeout: 3_000 });
    await allInBtn.click();

    const submitBtn = page
        .locator('[data-testid="action-raise"]:visible, [data-testid="action-bet"]:visible')
        .first();
    await submitBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await submitBtn.click();
}

/**
 * Create a free game with RIT enabled at creation time, then seat two players.
 */
async function setupFreeGameTwoPlayersWithRIT(browser: import('@playwright/test').Browser) {
    const ctxOwner = await browser.newContext();
    const ctxPlayer = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const player = await ctxPlayer.newPage();

    // Owner creates game with RIT toggle ON
    await owner.goto('/create-game');
    const ritToggle = owner.getByTestId('rit-toggle');
    await ritToggle.waitFor({ timeout: 10_000 });
    await ritToggle.click();
    await owner.getByTestId('create-game-btn').click();
    await owner.waitForURL(/\/table\/.+/, { timeout: 30_000 });
    const tableUrl = owner.url();
    await dismissLobbyBanner(owner);

    // Owner sits seat 1
    await owner.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await owner.getByTestId('empty-seat-1').click();
    await owner.getByTestId('username-input').fill('Owner');
    await owner.getByTestId('buy-in-input').clear();
    await owner.getByTestId('buy-in-input').fill('500');
    await owner.getByTestId('join-table-btn').click();
    await owner.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });

    // Player joins and requests seat 2
    const tablePath = new URL(tableUrl).pathname;
    await player.goto(tablePath);
    await dismissLobbyBanner(player);

    await player.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await player.getByTestId('empty-seat-2').click();
    await player.getByTestId('username-input').fill('Player2');
    await player.getByTestId('buy-in-input').clear();
    await player.getByTestId('buy-in-input').fill('500');
    await player.getByTestId('join-table-btn').click();

    // Owner accepts
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await player.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });

    return { owner, player, ctxOwner, ctxPlayer };
}

test('RIT enabled — both accept — two boards dealt', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayersWithRIT(browser);

    await startGame(owner);

    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // First acting player goes all-in
    let result = await getActingPlayer(owner, player);
    await goAllIn(result.actor);

    // Second player calls the all-in
    result = await getActingPlayer(owner, player);
    const callBtn = result.actor.getByTestId('action-call').first();
    await callBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await callBtn.click();

    // Both players should see the RIT consent modal
    await owner.getByTestId('rit-consent-modal').waitFor({ state: 'visible', timeout: 15_000 });
    await player.getByTestId('rit-consent-modal').waitFor({ state: 'visible', timeout: 15_000 });

    // Both accept
    await owner.getByTestId('rit-accept-btn').click();
    await player.getByTestId('rit-accept-btn').click();

    // Wait for two boards to appear
    await owner.getByTestId('rit-board-2').waitFor({ state: 'visible', timeout: 30_000 });
    await player.getByTestId('rit-board-2').waitFor({ state: 'visible', timeout: 10_000 });

    // Board labels should be visible
    await expect(owner.getByTestId('rit-board-1-label')).toBeVisible({ timeout: 5_000 });
    await expect(owner.getByTestId('rit-board-2-label')).toBeVisible({ timeout: 5_000 });

    // Second board should have community cards (count depends on the street at RIT trigger)
    const secondBoardCards = owner.locator('[data-testid="rit-second-board-cards"] > *');
    await expect(secondBoardCards).not.toHaveCount(0, { timeout: 10_000 });

    // Hand concludes — either a new hand starts (preflop) or the game pauses (waiting)
    // if one player won both boards and the other is eliminated.
    await waitForHandConclusion(owner);

    await ctxOwner.close();
    await ctxPlayer.close();
});

test('RIT enabled — one declines — single board runs', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayersWithRIT(browser);

    await startGame(owner);

    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    let result = await getActingPlayer(owner, player);
    await goAllIn(result.actor);

    result = await getActingPlayer(owner, player);
    const callBtn = result.actor.getByTestId('action-call').first();
    await callBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await callBtn.click();

    // Both should see the consent modal
    await owner.getByTestId('rit-consent-modal').waitFor({ state: 'visible', timeout: 15_000 });
    await player.getByTestId('rit-consent-modal').waitFor({ state: 'visible', timeout: 15_000 });

    // One accepts, one declines
    await owner.getByTestId('rit-accept-btn').click();
    await player.getByTestId('rit-decline-btn').click();

    // No second board should appear — hand completes with single board
    await expect(owner.getByTestId('rit-board-2')).not.toBeVisible({ timeout: 5_000 });

    // Hand concludes — new hand or game pauses if a player busted
    await waitForHandConclusion(owner);

    await ctxOwner.close();
    await ctxPlayer.close();
});

test('RIT disabled — no consent prompt appears', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // RIT is off by default — no toggle needed

    await startGame(owner);

    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    let result = await getActingPlayer(owner, player);
    await goAllIn(result.actor);

    result = await getActingPlayer(owner, player);
    const callBtn = result.actor.getByTestId('action-call').first();
    await callBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await callBtn.click();

    // No RIT consent modal should appear
    await owner.waitForTimeout(2_000);
    await expect(owner.getByTestId('rit-consent-modal')).not.toBeVisible();
    await expect(player.getByTestId('rit-consent-modal')).not.toBeVisible();

    // No second board
    await expect(owner.getByTestId('rit-board-2')).not.toBeVisible();

    // Hand concludes — new hand or game pauses if a player busted
    await waitForHandConclusion(owner);

    await ctxOwner.close();
    await ctxPlayer.close();
});
