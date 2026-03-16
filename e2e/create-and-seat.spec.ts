import { test, expect } from './fixtures';

test('Player A creates crypto game, deposits, and gets seated', async ({
    playerA,
}) => {
    // 1. Navigate to create game
    await playerA.goto('/create-game');

    // 2. Select Crypto play mode
    await playerA.getByTestId('play-type-crypto').click();

    // Wait for wallet to be connected and authenticated (SIWE auto-signs with privateKeyAccount)
    await playerA.waitForSelector('[data-testid="wallet-connected"]', {
        state: 'attached',
        timeout: 30_000,
    });

    // 3. Create the game (default blinds 5/10 are set automatically for crypto)
    await playerA.getByTestId('create-game-btn').click();

    // 4. Wait for redirect to /table/[id]
    await playerA.waitForURL(/\/table\/.+/, { timeout: 30_000 });
    const tableId = playerA.url().split('/table/')[1];
    expect(tableId).toBeTruthy();

    // 5. Click an empty seat
    await playerA.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await playerA.getByTestId('empty-seat-1').click();

    // 6. Enter buy-in amount (in USDC for crypto game — default input is USDC)
    const buyInInput = playerA.getByTestId('buy-in-input');
    await buyInInput.waitFor({ timeout: 5_000 });
    await buyInInput.clear();
    await buyInInput.fill('2'); // 2 USDC = 200 chips

    // 7. Click Join — triggers USDC approve + depositAndJoin on-chain
    await playerA.getByTestId('join-table-btn').click();

    // 8. Wait for deposit to complete and player to be seated (up to 60s for chain confirmation)
    await playerA.getByTestId('taken-seat-1').waitFor({ timeout: 60_000 });

    // 9. Verify player is seated with correct stack
    const stackEl = playerA.getByTestId('player-stack-1');
    await expect(stackEl).toBeVisible();
    // Stack should show 200 (chips) since 2 USDC = 200 chips at 100 chips/USDC
    await expect(stackEl).toContainText('200');
});
