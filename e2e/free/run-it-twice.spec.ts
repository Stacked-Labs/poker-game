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
    // Open the raise box by testid. On desktop the footer chip's accessible name
    // carries its hotkey ("r Raise"), so a /^(Raise|Bet)$/ name match never hits.
    await page
        .locator('[data-testid="action-raise"], [data-testid="action-bet"]')
        .first()
        .click();
    // Wait for the box, then max the bet via the All In preset (visible instance only —
    // the box renders portrait + landscape copies).
    await page
        .getByTestId('raise-input')
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 });
    await page
        .locator('button:visible', { hasText: /^All In$/ })
        .first()
        .click();
    // Submit. The confirm chip's real testid is action-raise/action-bet — ActionButton
    // derives it from its label and ignores any passed testid — scoped to the raise
    // action group (same selector the passing raise.spec.ts uses).
    await page
        .locator(
            '.raise-action-buttons-group [data-testid="action-raise"], .raise-action-buttons-group [data-testid="action-bet"]'
        )
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
    // Capture the vote prompt in the real footer before voting (design reference).
    await owner
        .getByTestId('rit-vote-yes')
        .waitFor({ state: 'visible', timeout: 15_000 });
    await owner.screenshot({
        path: 'e2e-artifacts/rit-vote-prompt-footer.png',
        fullPage: false,
    });
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

    // Capture the real table render of the two boards in the live felt — used to
    // evaluate how the dual board fits the tight on-table space.
    await owner.screenshot({
        path: 'e2e-artifacts/rit-two-boards-table.png',
        fullPage: false,
    });

    // The runout concludes and the hand resolves. After a heads-up all-in this is
    // either a fresh hand (both players survived the split) or an idle table (a player
    // busted on the boards) — accept either terminal state, not the in-progress runout.
    await owner
        .locator(
            '[data-testid="game-stage"][data-stage="preflop"], [data-testid="game-stage"][data-stage="waiting"]'
        )
        .first()
        // 'attached', not 'visible' — the idle (busted) felt renders the waiting
        // game-stage element hidden, while a fresh hand renders it visible.
        .waitFor({ state: 'attached', timeout: 60_000 });

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

    // Single-board runout concludes and the hand resolves — a fresh hand (both survived)
    // or an idle table (a player busted on the single board). Accept either.
    await owner
        .locator(
            '[data-testid="game-stage"][data-stage="preflop"], [data-testid="game-stage"][data-stage="waiting"]'
        )
        .first()
        // 'attached', not 'visible' — the idle (busted) felt renders the waiting
        // game-stage element hidden, while a fresh hand renders it visible.
        .waitFor({ state: 'attached', timeout: 60_000 });

    await ctxOwner.close();
    await ctxPlayer.close();
});
