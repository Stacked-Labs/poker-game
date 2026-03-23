import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers, startGame } from '../helpers/common';

test('Owner pauses and resumes game', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Start game ──
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Owner clicks pause ──
    await owner.getByTestId('pause-btn').waitFor({ timeout: 5_000 });
    await owner.getByTestId('pause-btn').click();

    // ── Verify: pause button changes to resume (aria-label changes) ──
    await expect(
        owner.getByTestId('pause-btn')
    ).toHaveAttribute('aria-label', 'Resume Game', { timeout: 10_000 });

    // ── Owner clicks resume ──
    await owner.getByTestId('pause-btn').click();

    // ── Verify: button changes back to pause ──
    await expect(
        owner.getByTestId('pause-btn')
    ).toHaveAttribute('aria-label', 'Pause Game', { timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
