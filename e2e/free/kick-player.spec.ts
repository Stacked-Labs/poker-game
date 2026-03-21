import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers, openSettingsTab } from '../helpers/common';

test('Owner kicks seated player — player removed, seat available', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

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

    // ── Owner: taken-seat-2 disappears (owner is seated, doesn't see empty-seat buttons) ──
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
