import type { Page } from '@playwright/test';

/**
 * Wait until the game stage indicator appears on the page.
 */
export async function waitForGameStage(
    page: Page,
    timeout = 30_000
): Promise<void> {
    await page.getByTestId('game-stage').waitFor({ timeout });
}

/**
 * Wait until a specific seat is occupied (TakenSeatButton rendered).
 */
export async function waitForSeat(
    page: Page,
    seatId: number,
    timeout = 60_000
): Promise<void> {
    await page.getByTestId(`taken-seat-${seatId}`).waitFor({ timeout });
}

/**
 * Wait until it's the player's turn (an action button becomes visible).
 */
export async function waitForAction(
    page: Page,
    timeout = 30_000
): Promise<void> {
    // Wait for any of the action buttons to appear
    await page
        .locator(
            '[data-testid="action-fold"], [data-testid="action-check"], [data-testid="action-call"], [data-testid="action-raise"]'
        )
        .first()
        .waitFor({ timeout });
}

/**
 * Wait for the settlement status banner to show a specific text.
 */
export async function waitForSettlement(
    page: Page,
    status: 'success' | 'failed' = 'success',
    timeout = 30_000
): Promise<void> {
    const text = status === 'success' ? 'Settled' : 'Settlement Failed';
    await page
        .getByTestId('game-status-banner')
        .filter({ hasText: text })
        .waitFor({ timeout });
}
