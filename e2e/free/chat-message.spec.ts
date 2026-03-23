import { test, expect } from '@playwright/test';
import { setupFreeGameTwoPlayers } from '../helpers/common';

test('Two players can exchange chat messages', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // ── Owner opens chat ──
    await owner.getByTestId('chat-toggle-btn').click();
    await owner.getByTestId('chat-input').waitFor({ timeout: 5_000 });

    // ── Player opens chat ──
    await player.getByTestId('chat-toggle-btn').click();
    await player.getByTestId('chat-input').waitFor({ timeout: 5_000 });

    // ── Player sends a message ──
    await player.getByTestId('chat-input').fill('Hello from Player2');
    await player.getByTestId('chat-send-btn').click();

    // ── Verify message appears on player's screen ──
    await expect(
        player.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from Player2',
        })
    ).toBeVisible({ timeout: 10_000 });

    // ── Verify message appears on owner's screen ──
    await expect(
        owner.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from Player2',
        })
    ).toBeVisible({ timeout: 10_000 });

    // ── Owner replies ──
    await owner.getByTestId('chat-input').fill('Hey back from Owner');
    await owner.getByTestId('chat-send-btn').click();

    // ── Verify reply appears on both screens ──
    await expect(
        owner.locator('[data-testid="chat-message"]', {
            hasText: 'Hey back from Owner',
        })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
        player.locator('[data-testid="chat-message"]', {
            hasText: 'Hey back from Owner',
        })
    ).toBeVisible({ timeout: 10_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
