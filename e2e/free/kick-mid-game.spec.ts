import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    openSettingsTab,
} from '../helpers/common';

test('Owner kicks player mid-hand — hand resolves, player removed', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Owner opens Settings > Players tab ──
    await openSettingsTab(owner, 'Players');

    // ── Owner clicks kick on player B ──
    await owner
        .locator('[data-testid^="kick-player-"]')
        .first()
        .waitFor({ timeout: 10_000 });
    await owner.locator('[data-testid^="kick-player-"]').first().click();

    // ── Confirmation dialog appears — owner confirms kick ──
    await owner.getByTestId('confirm-kick-btn').waitFor({ timeout: 5_000 });
    await owner.getByTestId('confirm-kick-btn').click();

    // ── Wait for confirmation dialog to close ──
    await owner
        .getByTestId('confirm-kick-btn')
        .waitFor({ state: 'hidden', timeout: 5_000 });

    // ── Close settings modal ──
    await owner.getByTestId('settings-close-btn').click();

    // ── Player folds to finish the hand quickly ──
    await player
        .getByTestId('action-fold')
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 });
    await player.getByTestId('action-fold').first().click();

    // ── Owner: taken-seat-2 disappears after hand resolves ──
    await owner
        .getByTestId('taken-seat-2')
        .waitFor({ state: 'hidden', timeout: 15_000 });

    // ── Player: now unseated, sees empty-seat-2 available ──
    await player
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 15_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
