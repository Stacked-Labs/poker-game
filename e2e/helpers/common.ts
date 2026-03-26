import type { Page } from '@playwright/test';

/** Dismiss the lobby banner if it appears. */
export async function dismissLobbyBanner(page: Page) {
    const closeBtn = page.getByTestId('lobby-banner-close');
    try {
        await closeBtn.waitFor({ state: 'visible', timeout: 8_000 });
        await closeBtn.click();
        await closeBtn.waitFor({ state: 'hidden', timeout: 5_000 });
    } catch {
        // Banner never appeared — continue
    }
}

/** Click the start-game button using evaluate() to bypass framer-motion. */
export async function startGame(owner: Page) {
    const startBtn = owner.getByTestId('start-game-btn-desktop');
    await startBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await owner.evaluate(() => {
        (
            document.querySelector(
                '[data-testid="start-game-btn-desktop"]'
            ) as HTMLElement
        )?.click();
    });
    await startBtn.waitFor({ state: 'hidden', timeout: 15_000 });
}

/**
 * Read data-queue-mode from the first visible fold button.
 * Returns null (acting — no attribute), "true" (queue mode), or "missing" (not found).
 */
async function getQueueMode(
    page: Page
): Promise<null | 'true' | 'missing'> {
    const fold = page.locator('[data-testid="action-fold"]').first();
    try {
        if (!(await fold.isVisible())) return 'missing';
        const val = await fold.getAttribute('data-queue-mode');
        return val as null | 'true';
    } catch {
        return 'missing';
    }
}

/**
 * Detect which player is the acting player (whose turn it is).
 * Polls both pages until exactly ONE has action buttons without data-queue-mode.
 */
export async function getActingPlayer(
    pageA: Page,
    pageB: Page,
    timeout = 15_000
): Promise<{ actor: Page; opponent: Page }> {
    const deadline = Date.now() + timeout;
    /* needs better implementation */
    await new Promise((resolve) => setTimeout(resolve, 700));

    while (Date.now() < deadline) {
        const [aQueue, bQueue] = await Promise.all([
            getQueueMode(pageA),
            getQueueMode(pageB),
        ]);

        const aIsActing = aQueue === null; // null = attribute absent = my turn
        const bIsActing = bQueue === null;

        if (aIsActing && !bIsActing)
            return { actor: pageA, opponent: pageB };
        if (bIsActing && !aIsActing)
            return { actor: pageB, opponent: pageA };

        // Both acting (state still hydrating) or neither visible yet — retry
        await pageA.waitForTimeout(300);
    }

    throw new Error('Could not determine acting player within timeout');
}

/** Click check if available, otherwise call. Uses .first() for portrait/landscape duplicates. */
export async function clickCheckOrCall(page: Page) {
    const callBtn = page.getByTestId('action-call').first();
    if (await callBtn.isVisible()) {
        await callBtn.click();
    } else {
        await page.getByTestId('action-check').first().click();
    }
}

/**
 * Create a free game with two seated players (owner on seat 1, player on seat 2).
 * Returns the pages and contexts for cleanup.
 */
export async function setupFreeGameTwoPlayers(browser: import('@playwright/test').Browser) {
    const ctxOwner = await browser.newContext();
    const ctxPlayer = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const player = await ctxPlayer.newPage();

    // Owner creates game and sits seat 1
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

    // Player joins and requests seat 2
    const tablePath = new URL(tableUrl).pathname;
    await player.goto(tablePath);
    await dismissLobbyBanner(player);

    await player.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await player.getByTestId('empty-seat-2').click();
    await player.getByTestId('username-input').fill('Player2');
    await player.getByTestId('buy-in-input').clear();
    await player.getByTestId('buy-in-input').fill('500');
    await player.getByTestId('join-table-btn').click();

    // Owner accepts
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await player.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });
    await owner
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });

    return { owner, player, ctxOwner, ctxPlayer };
}

/**
 * Create a crypto game with two seated players (playerA on seat 1, playerB on seat 2).
 * Both players must already be wallet-connected pages from fixtures.
 */
export async function setupCryptoGameTwoPlayers(
    cryptoPlayerA: Page,
    cryptoPlayerB: Page,
    pkA: string,
    pkB: string,
    buyIn = '100',
    chainTimeout = 120_000
) {
    // PlayerA creates crypto game and deposits to seat 1
    await cryptoPlayerA.goto(`/create-game?e2e_pk=${pkA}`);
    await cryptoPlayerA.getByTestId('play-type-crypto').click();
    await cryptoPlayerA
        .getByTestId('create-game-btn')
        .waitFor({ timeout: 60_000 });
    await cryptoPlayerA.getByTestId('create-game-btn').click();
    await cryptoPlayerA.waitForURL(/\/table\/.+/, { timeout: 60_000 });
    const tableUrl = cryptoPlayerA.url();
    await dismissLobbyBanner(cryptoPlayerA);

    await cryptoPlayerA
        .getByTestId('empty-seat-1')
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerA.getByTestId('empty-seat-1').click();
    await cryptoPlayerA
        .getByTestId('buy-in-input')
        .waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('buy-in-input').clear();
    await cryptoPlayerA.getByTestId('buy-in-input').fill(buyIn);
    await cryptoPlayerA.getByTestId('join-table-btn').click();
    await cryptoPlayerA
        .getByTestId('taken-seat-1')
        .waitFor({ timeout: chainTimeout });

    // PlayerB deposits to request seat 2
    const tablePath = new URL(tableUrl).pathname;
    await cryptoPlayerB.goto(`${tablePath}?e2e_pk=${pkB}`);
    await dismissLobbyBanner(cryptoPlayerB);

    await cryptoPlayerB
        .getByTestId('empty-seat-2')
        .waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('empty-seat-2').click();
    await cryptoPlayerB
        .getByTestId('buy-in-input')
        .waitFor({ timeout: 5_000 });
    await cryptoPlayerB.getByTestId('buy-in-input').clear();
    await cryptoPlayerB.getByTestId('buy-in-input').fill(buyIn);
    await cryptoPlayerB.getByTestId('join-table-btn').click();

    // Owner accepts
    await cryptoPlayerA
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'visible', timeout: chainTimeout });
    await cryptoPlayerA
        .locator('[data-testid^="accept-player-"]')
        .first()
        .click();
    await cryptoPlayerA
        .getByTestId('taken-seat-2')
        .waitFor({ timeout: 30_000 });
    await cryptoPlayerB
        .getByTestId('taken-seat-1')
        .waitFor({ timeout: 30_000 });
    await cryptoPlayerA
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });
}

/**
 * Create a free game with three seated players.
 * Returns the pages and contexts for cleanup.
 */
export async function setupFreeGameThreePlayers(browser: import('@playwright/test').Browser) {
    const ctxOwner = await browser.newContext();
    const ctxPlayer2 = await browser.newContext();
    const ctxPlayer3 = await browser.newContext();
    const owner = await ctxOwner.newPage();
    const player2 = await ctxPlayer2.newPage();
    const player3 = await ctxPlayer3.newPage();

    // Owner creates game and sits seat 1
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

    const tablePath = new URL(tableUrl).pathname;

    // Player2 joins and requests seat 2
    await player2.goto(tablePath);
    await dismissLobbyBanner(player2);
    await player2.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await player2.getByTestId('empty-seat-2').click();
    await player2.getByTestId('username-input').fill('Player2');
    await player2.getByTestId('buy-in-input').clear();
    await player2.getByTestId('buy-in-input').fill('500');
    await player2.getByTestId('join-table-btn').click();

    // Owner accepts player 2
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'hidden', timeout: 10_000 });

    // Player3 joins and requests seat 3
    await player3.goto(tablePath);
    await dismissLobbyBanner(player3);
    await player3.getByTestId('empty-seat-3').waitFor({ timeout: 10_000 });
    await player3.getByTestId('empty-seat-3').click();
    await player3.getByTestId('username-input').fill('Player3');
    await player3.getByTestId('buy-in-input').clear();
    await player3.getByTestId('buy-in-input').fill('500');
    await player3.getByTestId('join-table-btn').click();

    // Owner accepts player 3
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ timeout: 20_000 });
    await owner.locator('[data-testid^="accept-player-"]').first().click();
    await owner.getByTestId('taken-seat-3').waitFor({ timeout: 30_000 });
    await owner.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'hidden', timeout: 10_000 });

    return { owner, player2, player3, ctxOwner, ctxPlayer2, ctxPlayer3 };
}

/**
 * Create a crypto game with three seated players.
 */
export async function setupCryptoGameThreePlayers(
    cryptoPlayerA: Page,
    cryptoPlayerB: Page,
    cryptoPlayerC: Page,
    pkA: string,
    pkB: string,
    pkC: string,
    buyIn = '100',
    chainTimeout = 120_000
) {
    // PlayerA creates crypto game and deposits to seat 1
    await cryptoPlayerA.goto(`/create-game?e2e_pk=${pkA}`);
    await cryptoPlayerA.getByTestId('play-type-crypto').click();
    await cryptoPlayerA.getByTestId('create-game-btn').waitFor({ timeout: 60_000 });
    await cryptoPlayerA.getByTestId('create-game-btn').click();
    await cryptoPlayerA.waitForURL(/\/table\/.+/, { timeout: 60_000 });
    const tableUrl = cryptoPlayerA.url();
    await dismissLobbyBanner(cryptoPlayerA);

    await cryptoPlayerA.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await cryptoPlayerA.getByTestId('empty-seat-1').click();
    await cryptoPlayerA.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('buy-in-input').clear();
    await cryptoPlayerA.getByTestId('buy-in-input').fill(buyIn);
    await cryptoPlayerA.getByTestId('join-table-btn').click();
    await cryptoPlayerA.getByTestId('taken-seat-1').waitFor({ timeout: chainTimeout });

    const tablePath = new URL(tableUrl).pathname;

    // PlayerB deposits to seat 2
    await cryptoPlayerB.goto(`${tablePath}?e2e_pk=${pkB}`);
    await dismissLobbyBanner(cryptoPlayerB);
    await cryptoPlayerB.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('empty-seat-2').click();
    await cryptoPlayerB.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerB.getByTestId('buy-in-input').clear();
    await cryptoPlayerB.getByTestId('buy-in-input').fill(buyIn);
    await cryptoPlayerB.getByTestId('join-table-btn').click();

    // Owner accepts player B
    await cryptoPlayerA.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'visible', timeout: chainTimeout });
    await cryptoPlayerA.locator('[data-testid^="accept-player-"]').first().click();
    await cryptoPlayerA.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await cryptoPlayerA.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'hidden', timeout: 10_000 });

    // PlayerC deposits to seat 3
    await cryptoPlayerC.goto(`${tablePath}?e2e_pk=${pkC}`);
    await dismissLobbyBanner(cryptoPlayerC);
    await cryptoPlayerC.getByTestId('empty-seat-3').waitFor({ timeout: 10_000 });
    await cryptoPlayerC.getByTestId('empty-seat-3').click();
    await cryptoPlayerC.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerC.getByTestId('buy-in-input').clear();
    await cryptoPlayerC.getByTestId('buy-in-input').fill(buyIn);
    await cryptoPlayerC.getByTestId('join-table-btn').click();

    // Owner accepts player C
    await cryptoPlayerA.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'visible', timeout: chainTimeout });
    await cryptoPlayerA.locator('[data-testid^="accept-player-"]').first().click();
    await cryptoPlayerA.getByTestId('taken-seat-3').waitFor({ timeout: 30_000 });
    await cryptoPlayerA.locator('[data-testid="seat-request-popup"]').waitFor({ state: 'hidden', timeout: 10_000 });
}

/** Open the Settings modal and switch to a tab by name. */
export async function openSettingsTab(page: Page, tabName: string) {
    await page.getByTestId('settings-btn').click();
    await page.getByRole('tab', { name: tabName }).click();
}

/**
 * End the current hand immediately by folding `foldCount` players in sequence.
 * Polls all pages in order and folds whoever has the active (non-queued) turn.
 * With 3 players and foldCount=2 this ends the hand preflop in two actions.
 */
export async function endHandByFolding(pages: Page[], foldCount = 2) {
    let folds = 0;
    const deadline = Date.now() + 30_000;
    while (folds < foldCount && Date.now() < deadline) {
        for (const page of pages) {
            const fold = page.locator('[data-testid="action-fold"]').first();
            const visible = await fold
                .isVisible({ timeout: 300 })
                .catch(() => false);
            if (!visible) continue;
            const queueMode = await fold
                .getAttribute('data-queue-mode')
                .catch(() => 'missing');
            if (queueMode !== null) continue;
            await fold.click();
            folds++;
            break;
        }
        if (folds < foldCount) await pages[0].waitForTimeout(300);
    }
}

/**
 * Play through one complete hand with 3 players (check/call every street).
 * Polls all three pages and clicks for whichever player has the active turn.
 */
export async function playHandToCompletion3Players(
    pageA: Page,
    pageB: Page,
    pageC: Page
) {
    const pages = [pageA, pageB, pageC];

    async function actNext(streetTimeout = 12_000): Promise<boolean> {
        const deadline = Date.now() + streetTimeout;
        await new Promise((r) => setTimeout(r, 500));
        while (Date.now() < deadline) {
            for (const page of pages) {
                const fold = page.locator('[data-testid="action-fold"]').first();
                try {
                    if (!(await fold.isVisible({ timeout: 200 }))) continue;
                    const queueMode = await fold.getAttribute('data-queue-mode', {
                        timeout: 200,
                    });
                    if (queueMode !== null) continue; // queue mode = not this player's turn
                    await clickCheckOrCall(page);
                    return true;
                } catch {
                    continue;
                }
            }
            await pageA.waitForTimeout(200);
        }
        return false;
    }

    // Preflop: up to 3 acts (UTG → SB → BB check)
    for (let i = 0; i < 3; i++) await actNext();

    await pageA
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    // Flop, turn, river: up to 3 acts each street
    for (let street = 0; street < 3; street++) {
        for (let i = 0; i < 3; i++) {
            const acted = await actNext(8_000);
            if (!acted) break;
        }
    }
}

/** Play through one complete hand (check/call every street). */
export async function playHandToCompletion(pageA: Page, pageB: Page) {
    // Preflop: two actions (SB calls, BB checks)
    let result = await getActingPlayer(pageA, pageB);
    await clickCheckOrCall(result.actor);
    result = await getActingPlayer(pageA, pageB);
    await clickCheckOrCall(result.actor);

    // Postflop (flop/turn/river): two checks each
    await pageA
        .locator('[data-testid="game-stage"][data-stage="postflop"]')
        .waitFor({ timeout: 15_000 });

    for (let street = 0; street < 3; street++) {
        result = await getActingPlayer(pageA, pageB);
        await clickCheckOrCall(result.actor);
        result = await getActingPlayer(pageA, pageB);
        await clickCheckOrCall(result.actor);
    }
}
