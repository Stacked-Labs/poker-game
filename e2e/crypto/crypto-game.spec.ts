import { test, expect } from '../fixtures-wallet';

// Blockchain operations on Base Sepolia can take 1-2 min each.
const CHAIN_TIMEOUT = 120_000; // 2 min per on-chain step
const TEST_BUY_IN = '100'; // 100 chips = 1 USDC
const PK_A = process.env.TEST_CRYPTO_PK_A as string;
const PK_B = process.env.TEST_CRYPTO_PK_B as string;

async function dismissLobbyBanner(page: import('@playwright/test').Page) {
    const closeBtn = page.getByTestId('lobby-banner-close');
    try {
        await closeBtn.waitFor({ state: 'visible', timeout: 8_000 });
        await closeBtn.click();
        await closeBtn.waitFor({ state: 'hidden', timeout: 5_000 });
    } catch {
        // Banner never appeared — continue
    }
}

test('Crypto game: owner and player deposit, owner accepts, game starts, each player sees only their own cards', async ({
    cryptoPlayerA,
    cryptoPlayerB,
}) => {
    // ── playerA: navigate to create-game — pass e2e_pk so E2EAutoConnect fires ──
    await cryptoPlayerA.goto(`/create-game?e2e_pk=${PK_A}`);
    await cryptoPlayerA.getByTestId('play-type-crypto').click();

    // create-game-btn only appears once SIWE auth is complete
    await cryptoPlayerA.getByTestId('create-game-btn').waitFor({ timeout: 60_000 });
    await cryptoPlayerA.getByTestId('create-game-btn').click();

    // Contract deployment via thirdweb Engine takes ~30-60s
    await cryptoPlayerA.waitForURL(/\/table\/.+/, { timeout: 60_000 });
    const tableUrl = cryptoPlayerA.url();
    await dismissLobbyBanner(cryptoPlayerA);

    // ── playerA: deposit to take seat 1 ──
    await cryptoPlayerA.getByTestId('empty-seat-1').waitFor({ timeout: 10_000 });
    await cryptoPlayerA.getByTestId('empty-seat-1').click();
    await cryptoPlayerA.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerA.getByTestId('buy-in-input').clear();
    await cryptoPlayerA.getByTestId('buy-in-input').fill(TEST_BUY_IN);

    // approve() + depositAndJoin() on-chain, then indexer picks up the event
    await cryptoPlayerA.getByTestId('join-table-btn').click();
    await cryptoPlayerA.getByTestId('taken-seat-1').waitFor({ timeout: CHAIN_TIMEOUT });

    // ── playerB: navigate to same table ──
    const tablePath = new URL(tableUrl).pathname;
    await cryptoPlayerB.goto(`${tablePath}?e2e_pk=${PK_B}`);
    await dismissLobbyBanner(cryptoPlayerB);

    // ── playerB: deposit to request seat 2 ──
    await cryptoPlayerB.getByTestId('empty-seat-2').waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('empty-seat-2').click();
    await cryptoPlayerB.getByTestId('buy-in-input').waitFor({ timeout: 5_000 });
    await cryptoPlayerB.getByTestId('buy-in-input').clear();
    await cryptoPlayerB.getByTestId('buy-in-input').fill(TEST_BUY_IN);
    await cryptoPlayerB.getByTestId('join-table-btn').click();

    // ── playerA (owner): sees seat request popup from playerB's deposit ──
    await expect(cryptoPlayerA.locator('[data-testid="seat-request-popup"]')).toBeVisible({
        timeout: CHAIN_TIMEOUT,
    });
    await expect(cryptoPlayerA.locator('[data-testid^="accept-player-"]').first()).toBeVisible();

    // ── playerA: accepts playerB ──
    await cryptoPlayerA.locator('[data-testid^="accept-player-"]').first().click();

    // ── Both screens see both players seated ──
    await cryptoPlayerA.getByTestId('taken-seat-2').waitFor({ timeout: 30_000 });
    await cryptoPlayerB.getByTestId('taken-seat-1').waitFor({ timeout: 30_000 });
    await cryptoPlayerB.getByTestId('taken-seat-2').waitFor({ timeout: 10_000 });

    // ── Wait for seat request popup to fully close before clicking Start ──
    await cryptoPlayerA
        .locator('[data-testid="seat-request-popup"]')
        .waitFor({ state: 'hidden', timeout: 10_000 });

    // ── playerA (owner): starts the game ──
    const startBtn = cryptoPlayerA.getByTestId('start-game-btn-desktop');
    await startBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await cryptoPlayerA.evaluate(() => {
        (
            document.querySelector('[data-testid="start-game-btn-desktop"]') as HTMLElement
        )?.click();
    });
    await startBtn.waitFor({ state: 'hidden', timeout: 15_000 });

    // ── Both players see preflop stage ──
    await cryptoPlayerA
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });
    await cryptoPlayerB
        .locator('[data-testid="game-stage"][data-stage="preflop"]')
        .waitFor({ timeout: 15_000 });

    // ── Both players receive hole cards ──
    await cryptoPlayerA.getByTestId('player-hole-cards-1').waitFor({ timeout: 10_000 });
    await cryptoPlayerB.getByTestId('player-hole-cards-2').waitFor({ timeout: 10_000 });

    // ── playerA sees own cards face-up, opponent's face-down ──
    await expect(cryptoPlayerA.locator('[data-testid="card-1-0"][data-face="up"]')).toBeAttached();
    await expect(cryptoPlayerA.locator('[data-testid="card-1-1"][data-face="up"]')).toBeAttached();
    await expect(cryptoPlayerA.locator('[data-testid="card-2-0"][data-face="down"]')).toBeAttached();
    await expect(cryptoPlayerA.locator('[data-testid="card-2-1"][data-face="down"]')).toBeAttached();

    // ── playerB sees own cards face-up, opponent's face-down ──
    await expect(cryptoPlayerB.locator('[data-testid="card-2-0"][data-face="up"]')).toBeAttached();
    await expect(cryptoPlayerB.locator('[data-testid="card-2-1"][data-face="up"]')).toBeAttached();
    await expect(cryptoPlayerB.locator('[data-testid="card-1-0"][data-face="down"]')).toBeAttached();
    await expect(cryptoPlayerB.locator('[data-testid="card-1-1"][data-face="down"]')).toBeAttached();
});
