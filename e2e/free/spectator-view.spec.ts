import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    dismissLobbyBanner,
} from '../helpers/common';

test('Spectator can view game but has no action buttons', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Spectator joins same table without sitting ──
    const ctxSpectator = await browser.newContext();
    const spectator = await ctxSpectator.newPage();
    const tablePath = new URL(owner.url()).pathname;
    await spectator.goto(tablePath);
    await dismissLobbyBanner(spectator);

    // ── Verify: spectator sees both seated players ──
    await spectator
        .getByTestId('taken-seat-1')
        .waitFor({ state: 'visible', timeout: 15_000 });
    await spectator
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Verify: spectator does NOT see action buttons ──
    await expect(spectator.getByTestId('action-fold').first()).toBeHidden({
        timeout: 5_000,
    });
    await expect(spectator.getByTestId('action-call').first()).toBeHidden({
        timeout: 5_000,
    });

    // ── Verify: spectator sees both players seated (game is visible) ──
    await spectator
        .getByTestId('taken-seat-1')
        .waitFor({ state: 'visible', timeout: 10_000 });
    await spectator
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    await ctxSpectator.close();
    await ctxOwner.close();
    await ctxPlayer.close();
});
