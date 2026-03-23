import { test, expect } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    startGame,
    getActingPlayer,
} from '../helpers/common';

test('Winner can show cards after opponent folds', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Determine who acts first and make one player fold ──
    const { actor, opponent } = await getActingPlayer(owner, player);
    await actor.getByTestId('action-fold').first().click();

    // ── Winner (opponent) should see "Show Cards" button ──
    await opponent
        .getByTestId('action-show')
        .first()
        .waitFor({ state: 'visible', timeout: 15_000 });

    // ── Winner clicks "Show Cards" ──
    await opponent.getByTestId('action-show').first().click();

    // ── Verify: show button becomes disabled after clicking ──
    await expect(
        opponent.getByTestId('action-show').first()
    ).toBeDisabled({ timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
