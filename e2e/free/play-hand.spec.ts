import { test, expect } from '@playwright/test';
import {
    dismissLobbyBanner,
    startGame,
    getActingPlayer,
    clickCheckOrCall,
} from '../helpers/common';

test('Both players check/call through all streets — hand completes, new hand starts', async ({
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

    // ── Preflop ──
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // Preflop: two actions (SB calls, BB checks)
    let result = await getActingPlayer(owner, player);
    await clickCheckOrCall(result.actor);
    result = await getActingPlayer(owner, player);
    await clickCheckOrCall(result.actor);

    // ── Postflop (flop/turn/river) ──
    await owner
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    // Flop, turn, river: two checks each (6 actions total)
    for (let street = 0; street < 3; street++) {
        result = await getActingPlayer(owner, player);
        await clickCheckOrCall(result.actor);
        result = await getActingPlayer(owner, player);
        await clickCheckOrCall(result.actor);
    }

    // ── Hand complete → new hand starts (back to preflop) ──
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });
    await player
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // Both players receive new hole cards
    await expect(owner.getByTestId('player-hole-cards-1')).toBeAttached({
        timeout: 10_000,
    });
    await expect(player.getByTestId('player-hole-cards-2')).toBeAttached({
        timeout: 10_000,
    });

    await ctxOwner.close();
    await ctxPlayer.close();
});
