import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    getActingPlayer,
    clickCheckOrCall,
} from '../helpers/common';

test('Player requests leave mid-hand — removed after hand completes', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Player clicks Leave mid-hand (.last() = desktop navbar) ──
    await player.getByTestId('leave-table-btn').last().click();

    // ── Verify: leave button toggles to "cancel" state ──
    await expect(
        player.getByTestId('leave-table-btn').last()
    ).toHaveAttribute('aria-pressed', 'true', { timeout: 5_000 });

    // ── Play out the hand (check/call through all streets) ──
    let result = await getActingPlayer(owner, player);
    await clickCheckOrCall(result.actor);
    result = await getActingPlayer(owner, player);
    await clickCheckOrCall(result.actor);

    await owner
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    for (let street = 0; street < 3; street++) {
        result = await getActingPlayer(owner, player);
        await clickCheckOrCall(result.actor);
        result = await getActingPlayer(owner, player);
        await clickCheckOrCall(result.actor);
    }

    // ── Owner: taken-seat-2 disappears after hand completes ──
    await owner
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'hidden', timeout: 30_000 });

    // ── Player: now unseated, sees empty-seat-2 available ──
    await player
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 30_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});

test('Player cancels leave request mid-hand — stays seated', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Player clicks Leave ──
    await player.getByTestId('leave-table-btn').last().click();

    // ── Verify leave is requested ──
    await expect(
        player.getByTestId('leave-table-btn').last()
    ).toHaveAttribute('aria-pressed', 'true', { timeout: 5_000 });

    // ── Player cancels leave request ──
    await player.getByTestId('leave-table-btn').last().click();
    await expect(
        player.getByTestId('leave-table-btn').last()
    ).toHaveAttribute('aria-pressed', 'false', { timeout: 5_000 });

    // ── Play out the hand ──
    let result = await getActingPlayer(owner, player);
    await clickCheckOrCall(result.actor);
    result = await getActingPlayer(owner, player);
    await clickCheckOrCall(result.actor);

    await owner
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    for (let street = 0; street < 3; street++) {
        result = await getActingPlayer(owner, player);
        await clickCheckOrCall(result.actor);
        result = await getActingPlayer(owner, player);
        await clickCheckOrCall(result.actor);
    }

    // ── Verify: new hand starts with player still seated ──
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });
    await owner
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
