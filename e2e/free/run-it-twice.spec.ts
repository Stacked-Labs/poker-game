import { test, expect, type Page } from '@playwright/test';
import {
    setupFreeGameTwoPlayers,
    openSettingsTab,
    startGame,
    getActingPlayer,
    clickCheckOrCall,
} from '../helpers/common';

// Run It Twice is a cash-game feature that defaults ON. These tests pin two things:
// (1) the owner-only settings toggle and its default state, and (2) the full all-in
// runout — both players agree, two boards are dealt, and the hand concludes.

test('RIT toggle defaults ON for a cash game and is owner-only', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // Owner sees the toggle, and it is checked by default for a new cash game.
    await openSettingsTab(owner, 'Settings');
    const ownerToggle = owner.getByTestId('run-it-twice-toggle');
    await ownerToggle.waitFor({ timeout: 5_000 });
    await expect(ownerToggle).toBeChecked();

    // Owner can turn it off and back on.
    await ownerToggle.click();
    await expect(ownerToggle).not.toBeChecked();
    await ownerToggle.click();
    await expect(ownerToggle).toBeChecked();
    await owner.getByTestId('settings-close-btn').click();

    // A non-owner who opens settings must not be able to flip it (disabled).
    await openSettingsTab(player, 'Settings');
    const playerToggle = player.getByTestId('run-it-twice-toggle');
    await playerToggle.waitFor({ timeout: 5_000 });
    await expect(playerToggle).toBeDisabled();
    await player.getByTestId('settings-close-btn').click();

    await ctxOwner.close();
    await ctxPlayer.close();
});

// Drive whoever is acting all-in via the raise box → "All In" preset → confirm.
async function goAllIn(page: Page) {
    await page
        .getByRole('button', { name: /^(Raise|Bet)$/ })
        .first()
        .click();
    await page.getByRole('button', { name: 'All In' }).click();
    await page
        .getByTestId('raise-action-button-mobile')
        .first()
        .click();
}

test('All-in preflop → both vote yes → two boards run and hand completes', async ({
    browser,
}) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    // RIT is on by default; start the hand.
    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // First actor shoves all-in; the other calls → preflop all-in runout spot.
    const first = await getActingPlayer(owner, player);
    await goAllIn(first.actor);
    const second = await getActingPlayer(owner, player);
    await clickCheckOrCall(second.actor); // call the all-in

    // Both all-in players are prompted to run it twice — both agree.
    for (const p of [owner, player]) {
        const yes = p.getByTestId('rit-vote-yes');
        await yes.waitFor({ state: 'visible', timeout: 15_000 });
        await yes.click();
    }

    // Two boards are dealt and revealed.
    await expect(owner.getByTestId('dual-board-community')).toBeVisible({
        timeout: 20_000,
    });
    await expect(owner.getByTestId('rit-board-1')).toBeVisible();
    await expect(owner.getByTestId('rit-board-2')).toBeVisible();

    // The hand concludes and a fresh hand begins.
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 45_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});

test('Vote NO falls back to a single board', async ({ browser }) => {
    const { owner, player, ctxOwner, ctxPlayer } =
        await setupFreeGameTwoPlayers(browser);

    await startGame(owner);
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    const first = await getActingPlayer(owner, player);
    await goAllIn(first.actor);
    const second = await getActingPlayer(owner, player);
    await clickCheckOrCall(second.actor);

    // One "no" ends the vote immediately → normal single-board runout (no dual board).
    const ownerNo = owner.getByTestId('rit-vote-no');
    await ownerNo.waitFor({ state: 'visible', timeout: 15_000 });
    await ownerNo.click();

    await expect(owner.getByTestId('dual-board-community')).toHaveCount(0);

    // Hand still completes and a new hand starts.
    await owner
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 45_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
