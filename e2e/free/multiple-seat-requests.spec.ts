import { test, expect } from '@playwright/test';
import { dismissLobbyBanner } from '../helpers/common';

test('Owner accepts multiple seat requests — all players seated', async ({
    browser,
}) => {
    const ctxOwner = await browser.newContext();
    const ctxPlayer2 = await browser.newContext();
    const ctxPlayer3 = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const player2 = await ctxPlayer2.newPage();
    const player3 = await ctxPlayer3.newPage();

    // Owner creates game and sits seat 1
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

    const tablePath = new URL(tableUrl).pathname;

    // Player2 requests seat 2
    await player2.goto(tablePath);
    await dismissLobbyBanner(player2);
    await player2.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await player2.getByTestId('empty-seat-2').click();
    await player2.getByTestId('username-input').fill('Player2');
    await player2.getByTestId('buy-in-input').clear();
    await player2.getByTestId('buy-in-input').fill('500');
    await player2.getByTestId('join-table-btn').click();

    // Owner accepts player 2
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'hidden', timeout: 10_000 });

    // Player3 requests seat 3
    await player3.goto(tablePath);
    await dismissLobbyBanner(player3);
    await player3.getByTestId('empty-seat-3').waitFor({ timeout: 10_000 });
    await player3.getByTestId('empty-seat-3').click();
    await player3.getByTestId('username-input').fill('Player3');
    await player3.getByTestId('buy-in-input').clear();
    await player3.getByTestId('buy-in-input').fill('500');
    await player3.getByTestId('join-table-btn').click();

    // Owner accepts player 3
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-3').waitFor({ timeout: 30_000 });

    // Verify all three seats taken on owner's screen
    await owner.getByTestId('taken-seat-1').waitFor({ state: 'visible', timeout: 5_000 });
    await owner.getByTestId('taken-seat-2').waitFor({ state: 'visible', timeout: 5_000 });
    await owner.getByTestId('taken-seat-3').waitFor({ state: 'visible', timeout: 5_000 });

    await ctxOwner.close();
    await ctxPlayer2.close();
    await ctxPlayer3.close();
});
