import { test, expect } from '../fixtures-wallet';
import { setupCryptoGameTwoPlayers } from '../helpers/common';

const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

test('Crypto: two players can exchange chat messages', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    await setupCryptoGameTwoPlayers(cryptoPlayerA, cryptoPlayerB, PK_A, PK_B);

    // ── PlayerA opens chat ──
    await cryptoPlayerA.getByTestId('chat-toggle-btn').click();
    await cryptoPlayerA.getByTestId('chat-input').waitFor({ timeout: 5_000 });

    // ── PlayerB opens chat ──
    await cryptoPlayerB.getByTestId('chat-toggle-btn').click();
    await cryptoPlayerB.getByTestId('chat-input').waitFor({ timeout: 5_000 });

    // ── PlayerB sends a message ──
    await cryptoPlayerB.getByTestId('chat-input').fill('Hello from PlayerB');
    await cryptoPlayerB.getByTestId('chat-send-btn').click();

    // ── Verify message appears on both screens ──
    await expect(
        cryptoPlayerB.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from PlayerB',
        })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
        cryptoPlayerA.locator('[data-testid="chat-message"]', {
            hasText: 'Hello from PlayerB',
        })
    ).toBeVisible({ timeout: 10_000 });

    // ── PlayerA replies ──
    await cryptoPlayerA.getByTestId('chat-input').fill('Reply from PlayerA');
    await cryptoPlayerA.getByTestId('chat-send-btn').click();

    // ── Verify reply appears on both screens ──
    await expect(
        cryptoPlayerA.locator('[data-testid="chat-message"]', {
            hasText: 'Reply from PlayerA',
        })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
        cryptoPlayerB.locator('[data-testid="chat-message"]', {
            hasText: 'Reply from PlayerA',
        })
    ).toBeVisible({ timeout: 10_000 });
});
