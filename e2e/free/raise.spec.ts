import { test, expect } from '@playwright/test';
import {
    dismissLobbyBanner,
    startGame,
    getActingPlayer,
} from '../helpers/common';

test('Player raises — pot increases, opponent sees call button', async ({
    browser,
}) => {
    const ctxOwner = await browser.newContext();
    const ctxPlayer = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const player = await ctxPlayer.newPage();

    // ── Owner creates free game and sits seat 1 ──
    await owner.goto('/create-game');
    await owner.getByTestId('create-game-btn').click();
    await owner.waitForURL(/\/table\/.+/, { timeout: 30_000 });
    const tableUrl = owner.url();
    await dismissLobbyBanner(owner);

    await owner.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await owner.getByTestId('empty-seat-1').click();
    await owner.getByTestId('username-input').fill('Owner');
    await owner.getByTestId('buy-in-input').clear();
    await owner.getByTestId('buy-in-input').fill('500');
    await owner.getByTestId('join-table-btn').click();
    await owner.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });

    // ── Player joins and requests seat 2 ──
    const tablePath = new URL(tableUrl).pathname;
    await player.goto(tablePath);
    await dismissLobbyBanner(player);

    await player.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await player.getByTestId('empty-seat-2').click();
    await player.getByTestId('username-input').fill('Player2');
    await player.getByTestId('buy-in-input').clear();
    await player.getByTestId('buy-in-input').fill('500');
    await player.getByTestId('join-table-btn').click();

    // ── Owner accepts ──
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await player.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Acting player raises ──
    const { actor, opponent } = await getActingPlayer(owner, player);

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

    // ── Opponent is now the acting player and sees a call button ──
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

    await ctxOwner.close();
    await ctxPlayer.close();
});
