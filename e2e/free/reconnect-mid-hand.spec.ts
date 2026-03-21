import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers, startGame } from '../helpers/common';

test('Player disconnects and reconnects mid-hand — can resume play', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Save table URL before closing player's page ──
    const tableUrl = player.url();

    // ── Simulate disconnect: close player's page ──
    await player.close();

    // ── Wait briefly for server to detect disconnect ──
    await owner.waitForTimeout(2_000);

    // ── Reconnect: open new page in same context (preserves session) ──
    const playerReconnected = await ctxPlayer.newPage();
    await playerReconnected.goto(tableUrl);

    // ── Verify: player can see the table and is still seated ──
    await playerReconnected
        .getByTestId('taken-seat-1')
        .waitFor({ state: 'visible', timeout: 30_000 });

    // ── Verify: owner still sees player seated ──
    await owner
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    // ── Verify: player has action buttons (can still play) ──
    await playerReconnected
        .getByTestId('action-fold')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
