import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers } from '../helpers/common';

test('Spectator can send chat message visible to seated players', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Spectator joins same table without sitting ──
    const ctxSpectator = await browser.newContext();
    const spectator = await ctxSpectator.newPage();
    const tablePath = new URL(owner.url()).pathname;
    await spectator.goto(tablePath);

    // ── Wait for spectator's WebSocket connection (chat input becomes enabled) ──
    await spectator.getByTestId('chat-toggle-btn').waitFor({ timeout: 10_000 });
    await spectator.getByTestId('chat-toggle-btn').click();
    await spectator
        .getByTestId('chat-input')
        .waitFor({ timeout: 5_000 });

    // ── Owner and Player open chat ──
    await owner.getByTestId('chat-toggle-btn').click();
    await owner.getByTestId('chat-input').waitFor({ timeout: 5_000 });
    await player.getByTestId('chat-toggle-btn').click();
    await player.getByTestId('chat-input').waitFor({ timeout: 5_000 });

    // ── Spectator sends a message ──
    await spectator.getByTestId('chat-input').fill('Hello from spectator');
    await spectator.getByTestId('chat-send-btn').click();

    // ── Verify message appears on spectator's screen ──
    await expect(
        spectator.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from spectator',
        })
    ).toBeVisible({ timeout: 10_000 });

    // ── Verify message appears on owner's screen ──
    await expect(
        owner.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from spectator',
        })
    ).toBeVisible({ timeout: 10_000 });

    // ── Verify message appears on player's screen ──
    await expect(
        player.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from spectator',
        })
    ).toBeVisible({ timeout: 10_000 });

    await ctxSpectator.close();
    await ctxOwner.close();
    await ctxPlayer.close();
});
