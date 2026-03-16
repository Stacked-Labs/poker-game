import { test, expect } from './fixtures';
import { waitForSeat, waitForSettlement } from './helpers/wait-for-game';

test('Two players go all-in and hand settles', async ({
    playerA,
    playerB,
}) => {
    // ── Setup: Player A creates crypto game ──
    await playerA.goto('/create-game');
    await playerA.getByTestId('play-type-crypto').click();
    await playerA.waitForSelector('[data-testid="wallet-connected"]', {
        state: 'attached',
        timeout: 30_000,
    });
    await playerA.getByTestId('create-game-btn').click();
    await playerA.waitForURL(/\/table\/.+/, { timeout: 30_000 });
    const tableUrl = playerA.url();

    // ── Player A sits down + deposits ──
    await playerA.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await playerA.getByTestId('empty-seat-1').click();
    const buyInA = playerA.getByTestId('buy-in-input');
    await buyInA.waitFor({ timeout: 5_000 });
    await buyInA.clear();
    await buyInA.fill('5'); // 5 USDC = 500 chips
    await playerA.getByTestId('join-table-btn').click();
    await waitForSeat(playerA, 1, 60_000);

    // ── Player B joins same table ──
    // Extract table path to navigate with B's wallet key
    const tablePath = new URL(tableUrl).pathname;
    const bKey = new URL(playerB.url()).searchParams.get('e2e_pk');
    await playerB.goto(`${tablePath}?e2e_pk=${bKey}`);

    // Wait for B's wallet to be connected
    await playerB.waitForSelector('[data-testid="wallet-connected"]', {
        state: 'attached',
        timeout: 30_000,
    });

    // B clicks an empty seat
    await playerB.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await playerB.getByTestId('empty-seat-2').click();
    const buyInB = playerB.getByTestId('buy-in-input');
    await buyInB.waitFor({ timeout: 5_000 });
    await buyInB.clear();
    await buyInB.fill('5'); // 5 USDC = 500 chips
    await playerB.getByTestId('join-table-btn').click();

    // ── Player A accepts seat request ──
    // The accept button has testid accept-player-{uuid} — click the first one
    const acceptBtn = playerA.locator('[data-testid^="accept-player-"]').first();
    await acceptBtn.waitFor({ timeout: 30_000 });
    await acceptBtn.click();

    // Wait for B to be seated
    await waitForSeat(playerA, 2, 60_000);

    // ── Both players ready, owner starts game ──
    // Click start game (either mobile or desktop button)
    const startBtn = playerA.locator(
        '[data-testid="start-game-btn"], [data-testid="start-game-btn-desktop"]'
    );
    await startBtn.first().waitFor({ timeout: 10_000 });
    await startBtn.first().click();

    // Wait for cards dealt (game stage indicator appears with running state)
    await playerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── All-in sequence ──
    // Determine who acts first
    const raiseBtn = playerA.getByTestId('action-raise').or(
        playerA.getByTestId('action-bet')
    );

    if (await raiseBtn.first().isVisible({ timeout: 5_000 })) {
        // Player A has action — go all-in
        await raiseBtn.first().click();
        const raiseInput = playerA.getByTestId('raise-input');
        await raiseInput.waitFor({ timeout: 5_000 });
        await raiseInput.clear();
        await raiseInput.fill('500');
        // Click the raise/bet confirm button (it's the action-raise or action-bet button in raise mode)
        await playerA.getByTestId('action-raise').or(
            playerA.getByTestId('action-bet')
        ).first().click();

        // Player B calls all-in
        await playerB.getByTestId('action-call').waitFor({ timeout: 15_000 });
        await playerB.getByTestId('action-call').click();
    } else {
        // Player B has action first
        const raiseBtnB = playerB.getByTestId('action-raise').or(
            playerB.getByTestId('action-bet')
        );
        await raiseBtnB.first().waitFor({ timeout: 15_000 });
        await raiseBtnB.first().click();
        const raiseInputB = playerB.getByTestId('raise-input');
        await raiseInputB.waitFor({ timeout: 5_000 });
        await raiseInputB.clear();
        await raiseInputB.fill('500');
        await playerB.getByTestId('action-raise').or(
            playerB.getByTestId('action-bet')
        ).first().click();

        // Player A calls all-in
        await playerA.getByTestId('action-call').waitFor({ timeout: 15_000 });
        await playerA.getByTestId('action-call').click();
    }

    // ── Wait for hand to complete (showdown + settlement) ──
    await waitForSettlement(playerA, 'success', 45_000);

    // ── Verify: one player has ~1000 chips, other has 0 ──
    // After settlement, check stack values
    const stackA = await playerA.getByTestId('player-stack-1').textContent();
    const stackB = await playerA.getByTestId('player-stack-2').textContent();

    // Parse stack values (may have formatting like commas)
    const parseStack = (text: string | null) =>
        parseInt((text || '0').replace(/[^0-9]/g, ''), 10) || 0;

    const valA = parseStack(stackA);
    const valB = parseStack(stackB);

    // One player should have ~1000 (minus rake), other should have 0
    const total = valA + valB;
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(1000);
    expect(Math.min(valA, valB)).toBe(0);
});
