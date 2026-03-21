import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    playHandToCompletion,
} from '../helpers/common';

test('Player cancels sit out before hand ends — stays active next hand', async ({
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

    // ── Verify: sit out requested ──
    await expect(
        player.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Cancel sit out', { timeout: 5_000 });

    // ── Player cancels sit out ──
    await player.locator('.navbar-away-wrapper [data-testid="away-btn"]').click();

    // ── Verify: back to normal "Sit out next hand" ──
    await expect(
        player.locator('.navbar-away-wrapper [data-testid="away-btn"]')
    ).toHaveAttribute('aria-label', 'Sit out next hand', { timeout: 5_000 });

    // ── Play out the hand ──
    await playHandToCompletion(owner, player);

    // ── Next hand starts normally with both players ──
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 30_000 });

    // ── Both players still seated and active ──
    await owner
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
