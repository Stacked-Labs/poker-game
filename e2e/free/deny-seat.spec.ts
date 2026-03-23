import { test, expect } from '@playwright/test';
import { dismissLobbyBanner } from '../helpers/common';

test('Owner denies seat request — requester can re-request', async ({
    browser,
}) => {
    const ctxOwner = await browser.newContext();
    const ctxRequester = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const requester = await ctxRequester.newPage();

    // ── Owner creates free game and sits seat 1 ──
    await owner.goto('/create-game');
    await owner.getByTestId('create-game-btn').click();
    await owner.waitForURL(/\/table\/.+/, { timeout: 30_000 });
    const tableUrl = owner.url();
    await dismissLobbyBanner(owner);

    await owner.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await owner.getByTestId('empty-seat-1').click();
    await owner.getByTestId('username-input').fill('Owner');
    await owner.getByTestId('buy-in-input').clear();
    await owner.getByTestId('buy-in-input').fill('500');
    await owner.getByTestId('join-table-btn').click();
    await owner.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });

    // ── Requester navigates and requests seat 2 ──
    const tablePath = new URL(tableUrl).pathname;
    await requester.goto(tablePath);
    await dismissLobbyBanner(requester);

    await requester.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await requester.getByTestId('empty-seat-2').click();
    await requester.getByTestId('username-input').fill('Player2');
    await requester.getByTestId('buy-in-input').clear();
    await requester.getByTestId('buy-in-input').fill('500');
    await requester.getByTestId('join-table-btn').click();

    // ── Both sides see the request ──
    await expect(
        owner.locator('[data-testid="seat-request-popup"]')
    ).toBeVisible({ timeout: 20_000 });
    await expect(
        owner.locator('[data-testid^="deny-player-"]').first()
    ).toBeVisible();
    await expect(requester.getByTestId('cancel-seat-request')).toBeVisible({
        timeout: 10_000,
    });

    // ── Owner denies the request ──
    await owner.locator('[data-testid^="deny-player-"]').first().click();

    // ── Owner: popup disappears ──
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });

    // ── Requester: cancel badge disappears, seat 2 is available again ──
    await requester
        .getByTestId('cancel-seat-request')
        .waitFor({ state: 'hidden', timeout: 10_000 });
    await requester
        .getByTestId('empty-seat-2')
        .waitFor({ state: 'visible', timeout: 10_000 });

    await ctxOwner.close();
    await ctxRequester.close();
});
