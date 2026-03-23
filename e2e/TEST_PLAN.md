# E2E Test Plan

## Overview

End-to-end tests for StackedPoker covering free [F] and crypto [C] game flows.
Tests run against a live stack (poker-server, poker-indexer, Next.js frontend).

---

## Running Tests Automatically (Nightly CI)

Tests are scheduled to run **once every 24 hours** via GitHub Actions.
On failure, a **Discord webhook** fires an alert.

### Prerequisites

The CI job needs:
- **poker-server** running (Go binary or Docker)
- **poker-indexer** running and syncing Base Sepolia
- **Next.js dev server** (or built app) on the expected port
- **Redis** for server + indexer
- **Base Sepolia RPC** access

### CI Secrets Required

| Secret                  | Description                              |
|-------------------------|------------------------------------------|
| `TEST_CRYPTO_PK_A`     | Funded Base Sepolia private key (owner)   |
| `TEST_CRYPTO_PK_B`     | Funded Base Sepolia private key (player)  |
| `DISCORD_WEBHOOK_URL`  | Discord channel webhook for alerts        |
| `BASE_SEPOLIA_RPC_URL` | RPC endpoint for Base Sepolia             |

### GitHub Actions Workflow

Create `.github/workflows/e2e-nightly.yml`:

```yaml
name: E2E Tests (Nightly)

on:
  schedule:
    # Every day at 03:00 UTC
    - cron: '0 3 * * *'
  workflow_dispatch: # Manual trigger

env:
  TEST_CRYPTO_PK_A: ${{ secrets.TEST_CRYPTO_PK_A }}
  TEST_CRYPTO_PK_B: ${{ secrets.TEST_CRYPTO_PK_B }}
  BASE_URL: http://localhost:3000

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      # ── Start infrastructure ──
      # Option A: docker-compose (recommended)
      #   Create a docker-compose.e2e.yml that starts:
      #     - poker-server (port 8080)
      #     - poker-indexer (Base Sepolia)
      #     - redis
      #     - postgres (if needed)
      #   Then:
      #     docker compose -f docker-compose.e2e.yml up -d
      #     # wait for healthy
      #     docker compose -f docker-compose.e2e.yml exec poker-server curl -sf http://localhost:8080/health
      #
      # Option B: Run processes directly (lighter, no Docker)
      #   Start each service as a background process.

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: poker-game/package-lock.json

      - name: Install dependencies
        working-directory: poker-game
        run: npm ci

      - name: Install Playwright browsers
        working-directory: poker-game
        run: npx playwright install --with-deps chromium

      - name: Start Next.js
        working-directory: poker-game
        run: npm run dev &
        # Or: npm run build && npm start &

      - name: Wait for frontend
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run all E2E tests
        working-directory: poker-game
        run: npx playwright test

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: poker-game/playwright-report/
          retention-days: 7

      # ── Discord alert on failure ──
      - name: Discord notification on failure
        if: failure()
        env:
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
        run: |
          curl -H "Content-Type: application/json" \
            -d "{\"content\": \"**E2E Tests Failed** :red_circle:\nBranch: \`${{ github.ref_name }}\`\nRun: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}\nTime: $(date -u '+%Y-%m-%d %H:%M UTC')\"}" \
            "$DISCORD_WEBHOOK_URL"
```

### Adding New Tests

1. Create a spec file in the appropriate directory:
   - `e2e/free/` for free game tests
   - `e2e/crypto/` for crypto game tests
2. Use existing fixtures from `e2e/fixtures-wallet.ts`:
   - Free tests: use `browser` to create contexts manually
   - Crypto tests: use `cryptoPlayerA` / `cryptoPlayerB` fixtures
3. Use shared helpers from `e2e/helpers/common.ts`
4. The nightly CI picks up all `*.spec.ts` files automatically — no config changes needed.

### Running Locally

```bash
cd poker-game

# Free tests only (no chain dependency)
npx playwright test --project=free

# Crypto tests (needs .env.test with funded keys + running indexer)
npx playwright test --project=crypto

# All tests
npx playwright test

# Specific test
npx playwright test e2e/free/raise.spec.ts
```

---

## Test Tiers

### Tier 1 — Core Game Integrity
*Must work or the game is broken.*

| #  | Test                  | Types | Status |
|----|-----------------------|-------|--------|
| 1  | Deny seat request     | F+C   | Done   |
| 2  | Cancel seat request   | F+C   | Done   |
| 3  | Play a full hand      | F+C   | Done   |
| 4  | Fold                  | F+C   | Done   |
| 5  | Raise                 | F+C   | Done   |

**1. Deny seat request [F+C]**
Owner creates game, sits. Player B requests seat. Owner clicks `deny-player-{uuid}`. Verify: player B sees their request dismissed (cancel badge disappears), player B can request another seat after denial. Owner's popup clears.

**2. Cancel seat request [F+C]**
Owner creates game, sits. Player B requests seat. Player B clicks `cancel-seat-request` before owner acts. Verify: owner's seat-request popup clears, player B can re-request a different seat.

**3. Play a full hand [F+C]**
Two players seated, game started. Check/call through preflop, flop, turn, river. Verify: community cards appear, hand resolves, new hand auto-starts with fresh hole cards.

**4. Fold [F+C]**
Two players, game started. Acting player clicks `action-fold`. Verify: hand ends immediately, next hand begins.

**5. Raise [F+C]**
Two players, preflop. Acting player opens raise input, submits with default amount. Verify: opponent sees call button, opponent calls, pot = 40 on postflop.

---

### Tier 2 — Table Management
*Owner controls.*

| #  | Test                          | Types | Status  |
|----|-------------------------------|-------|---------|
| 6  | Kick player                   | F+C   | Done    |
| 7  | Kick player mid-game          | F+C   | Done    |
| 8  | Leave table between hands     | F+C   | Done    |
| 9  | Leave table mid-hand          | F+C   | Done    |

**6. Kick player [F+C]**
Two players seated (game NOT running). Owner opens Settings > Player List > kicks player B. Verify: player B removed, seat becomes empty on both screens.

**7. Kick player mid-game [F+C]**
Two players, hand in progress. Owner kicks player B. Verify: current hand resolves (player B auto-folds), player B removed after hand.

**8. Leave table between hands [F+C]**
Two players, between hands. Player B clicks Leave. Verify: immediately removed, seat empty on owner's screen. Crypto: chips remain in contract.

**9. Leave table mid-hand [F+C]**
Two players, hand in progress. Player B clicks Leave. Verify: button toggles to "Cancel leave request". Hand plays out. After hand, player B removed. Can cancel leave before hand ends.

---

### Tier 3 — Chat & Social

| #  | Test             | Types | Status  |
|----|------------------|-------|---------|
| 10 | Send chat message | F+C   | Done    |
| 11 | Spectator chat    | F     | Done    |

**10. Send a chat message [F+C]**
Two players seated. Player B sends a message via ChatBox. Verify on both screens: message appears with correct username.

**11. Spectator chat [F]**
Third context opens table without sitting. Spectator sends message. Verify: shows with spectator-style username, seated players see it.

---

### Tier 4 — Crypto-Specific Flows

| #  | Test                              | Types | Status  |
|----|-----------------------------------|-------|---------|
| 12 | Withdraw after leaving            | C     | Done    |
| 13 | Withdraw disabled while seated    | C     | Done    |
| 14 | Emergency withdraw                | C     | Done    |
| 15 | Host rake withdraw                | C     | Done    |

**12. Withdraw after leaving [C]**
Player deposits, is accepted, leaves table, clicks Withdraw. Verify: modal shows balance, transaction completes.

**13. Withdraw disabled while seated [C]**
Seated player tries Withdraw. Verify: error "Leave the table before withdrawing".

**14. Emergency withdraw [C]**
Owner triggers `emergencyWithdrawAll`. Verify: all funds returned, contract balance zero.

**15. Host rake withdraw [C]**
After a hand with rake, owner withdraws rake. Verify: correct amount, transaction completes.

---

### Tier 5 — Sit Out / Away

| #  | Test                | Types | Status  |
|----|---------------------|-------|---------|
| 16 | Sit out next hand   | F+C   | Done    |
| 17 | Cancel sit out      | F+C   | Done    |

**16. Sit out next hand [F+C]**
Player B clicks "Sit out next hand". Next hand: player B marked away, not dealt. Clicks "I'm Back" → rejoins.

**17. Cancel sit out [F+C]**
Player B clicks "Cancel sit out" before hand ends. Verify: stays active next hand.

---

### Tier 6 — Edge Cases & Reconnection

| #  | Test                              | Types | Status  |
|----|-----------------------------------|-------|---------|
| 18 | Multiple seat requests queued     | F+C   | Done    |
| 19 | Wallet switch while pending       | C     | Skip    |
| 20 | Disconnect/reconnect mid-hand     | F+C   | Done    |
| 21 | Pause and resume game             | F+C   | Done    |
| 22 | Update blinds between hands       | F+C   | Done    |

---

### Tier 7 — UI Polish & Minor Flows

| #  | Test                       | Types | Status  |
|----|----------------------------|-------|---------|
| 23 | Blind obligations          | F+C   | Don't do it for now |
| 24 | Show/reveal cards          | F+C   | Done    |
| 25 | Spectator view             | F+C   | Done    |
