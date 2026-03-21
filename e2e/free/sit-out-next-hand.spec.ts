import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    playHandToCompletion,
} from '../helpers/common';

test('Player sits out next hand — marked away, clicks I\'m Back to rejoin', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Player clicks "Sit out next hand" (.first() = landscape navbar) ──
    await player.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();

    // ── Verify: button now shows "Cancel sit out" ──
    await expect(
        player.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });

    // ── Play out the current hand ──
    await playHandToCompletion(owner, player);

    // ── After hand: player becomes away, button changes to "I'm back" ──
    await expect(
        player.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', "I'm back", { timeout: 30_000 });

    // ── Player clicks "I'm Back" to rejoin ──
    await player.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();

    // ── Verify: button transitions through "Cancel rejoin" then back to "Sit out next hand" ──
    await expect(
        player.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Sit out next hand', { timeout: 30_000 });

    // ── Both players are still seated ──
    await owner
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
