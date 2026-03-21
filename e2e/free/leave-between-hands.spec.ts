import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers } from '../helpers/common';

test('Player leaves between hands — immediately removed', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Player clicks Leave (.last() = desktop navbar, .first() = hidden burger menu) ──
    await player.getByTestId('leave-table-btn').last().click();

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
