import { test, expect } from '@playwright/test';

test('Create a free game and see empty seats on table', async ({ page }) => {
    await page.goto('/create-game');

    // Free is the default — click create directly
    await page.getByTestId('create-game-btn').click();

    await page.waitForURL(/\/table\/.+/, { timeout: 30_000 });

    await expect(page.getByTestId('empty-seat-1')).toBeVisible({ timeout: 10_000 });
});
