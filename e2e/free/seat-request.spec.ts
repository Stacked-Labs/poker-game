import { test, expect } from '@playwright/test';

async function dismissLobbyBanner(page: import('@playwright/test').Page) {
    const closeBtn = page.getByTestId('lobby-banner-close');
    try {
        await closeBtn.waitFor({ state: 'visible', timeout: 8_000 });
        await closeBtn.click();
        await closeBtn.waitFor({ state: 'hidden', timeout: 5_000 });
    } catch {
        // Banner never appeared, continue
    }
}

test('Seat request shows on both screens, owner accepts, game starts, each player sees only their own cards', async ({ browser }) => {
    const ctxOwner = await browser.newContext();
    const ctxRequester = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const requester = await ctxRequester.newPage();

    // ── Owner creates free game ──
    await owner.goto('/create-game');
    await owner.getByTestId('create-game-btn').click();
    await owner.waitForURL(/\/table\/.+/, { timeout: 30_000 });
    const tableUrl = owner.url();
    await dismissLobbyBanner(owner);

    // ── Owner sits in seat 1 ──
    await owner.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await owner.getByTestId('empty-seat-1').click();
    await owner.getByTestId('username-input').waitFor({ timeout: 5_000 });
    await owner.getByTestId('username-input').fill('Owner');
    await owner.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await owner.getByTestId('buy-in-input').clear();
    await owner.getByTestId('buy-in-input').fill('500');
    await owner.getByTestId('join-table-btn').click();
    await owner.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });

    // ── Requester navigates to same table ──
    const tablePath = new URL(tableUrl).pathname;
    await requester.goto(tablePath);
    await dismissLobbyBanner(requester);

    // ── Requester requests seat 2 with a random chip amount (1–1000) ──
    const chips = Math.floor(Math.random() * 1000) + 1;
    await requester.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await requester.getByTestId('empty-seat-2').click();
    await requester.getByTestId('username-input').waitFor({ timeout: 5_000 });
    await requester.getByTestId('username-input').fill('Player2');
    await requester.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await requester.getByTestId('buy-in-input').clear();
    await requester.getByTestId('buy-in-input').fill(String(chips));
    await requester.getByTestId('join-table-btn').click();

    // ── Owner sees seat request popup ──
    await expect(owner.locator('[data-testid="seat-request-popup"]')).toBeVisible({ timeout: 20_000 });
    await expect(owner.locator('[data-testid^="accept-player-"]').first()).toBeVisible();

    // ── Requester sees cancel request button ──
    await expect(requester.getByTestId('cancel-seat-request')).toBeVisible({ timeout: 10_000 });

    // ── Owner accepts the seat request ──
    await owner.locator('[data-testid^="accept-player-"]').first().click();

    // ── Both screens see both players seated ──
    await owner.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await requester.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });
    await requester.getByTestId('taken-seat-2').waitFor({ timeout: 10_000 });

    // ── Wait for seat request popup to fully close before clicking Start ──
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'hidden', timeout: 10_000 });

    // ── Owner starts the game ──
    // force: true — the Start button has an infinite CSS pulse animation which
    // prevents Playwright's stability check from ever passing.
    const startBtn = owner.getByRole('button', { name: /start/i });
    await startBtn.click({ force: true });

    // Verify the game actually started (Start button disappears when game.running = true)
    await startBtn.waitFor({ state: 'hidden', timeout: 15_000 });


    // ── Both players see preflop stage ──
    await owner.locator('[data-testid="game-stage"][data-stage="preflop"]').waitFor({ timeout: 15_000 });
    await requester.locator('[data-testid="game-stage"][data-stage="preflop"]').waitFor({ timeout: 15_000 });

    // ── Both players receive hole cards ──
    await owner.getByTestId('player-hole-cards-1').waitFor({ timeout: 10_000 });
    await requester.getByTestId('player-hole-cards-2').waitFor({ timeout: 10_000 });

    // ── Owner sees their own cards face-up, opponent's face-down ──
    await expect(owner.locator('[data-testid="card-1-0"][data-face="up"]')).toBeAttached();
    await expect(owner.locator('[data-testid="card-1-1"][data-face="up"]')).toBeAttached();
    await expect(owner.locator('[data-testid="card-2-0"][data-face="down"]')).toBeAttached();
    await expect(owner.locator('[data-testid="card-2-1"][data-face="down"]')).toBeAttached();

    // ── Requester sees their own cards face-up, opponent's face-down ──
    await expect(requester.locator('[data-testid="card-2-0"][data-face="up"]')).toBeAttached();
    await expect(requester.locator('[data-testid="card-2-1"][data-face="up"]')).toBeAttached();
    await expect(requester.locator('[data-testid="card-1-0"][data-face="down"]')).toBeAttached();
    await expect(requester.locator('[data-testid="card-1-1"][data-face="down"]')).toBeAttached();

    await ctxOwner.close();
    await ctxRequester.close();
});
