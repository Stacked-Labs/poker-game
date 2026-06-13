---
name: base-miniapp-developer
description: Run Stacked Poker inside the Coinbase Base App as a standard web app with one-tap Base-wallet login. Covers Base.dev registration, bridging the Base Account into thirdweb v5 + SIWE, in-webview navigation/sharing/deep-links, and Base notifications. Use for any Base App / Mini App / Base Account / farcaster.json work. thirdweb stays the primary wallet layer.
---

# Base App Developer (Stacked Poker)

## ⚠️ Read this first — the model changed (verified 2026-06)

**The Base App (formerly Coinbase Wallet) stopped running Farcaster Mini Apps on April 9, 2026. It now treats every app as a _standard web app_.** Inside the Base App, the Farcaster Mini App SDK actions — `sdk.actions.ready/signIn/openUrl/composeCast/addMiniApp/viewProfile` — and the FID context **no longer fire**. Source: https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app and https://docs.base.org/mini-apps/troubleshooting/base-app-compatibility.

So poker-game's current Mini App surface (`sdk.actions.ready()` in `app/providers.tsx`, `app/hooks/useIsMiniApp.ts`, `public/.well-known/farcaster.json`, the `fc:miniapp` embed in `app/layout.tsx`) **is inert inside the Base App**. It only does anything in Warpcast/Farcaster.

## Decision record — do NOT adopt MiniKit / OnchainKit (and why)

This skill previously prescribed MiniKit + `@coinbase/onchainkit`. **That is wrong on two counts and must not be re-introduced:**
1. The code never adopted it — poker-game is thirdweb v5 + Chakra v2 + React 18, with no wagmi.
2. OnchainKit 1.1.x hard-requires **React 19 + wagmi ^2.16 + viem ^2.27 + a Tailwind v4 style layer** as peers, and MiniKit is itself a wrapper over the Farcaster spec the Base App just dropped. Adopting it = a large rewrite for zero capability we can't already get from the raw SDK + thirdweb.

**Locked strategy (user-confirmed 2026-06-12):** Base App **first**; keep thirdweb **primary** and **bridge** the Base wallet (no wagmi migration); the Farcaster surface stays **dormant/isolated**. See `[[project_base_app_miniapp_pivot]]` in Claude memory.

## Prerequisites — settle these BEFORE building growth (P0)
1. **Compliance gate.** Real-money poker inside a Coinbase surface raises a policy question (Coinbase Prohibited Use bars unsanctioned games of *chance*; poker also carries age/geo/KYC/AML duties). **Launch Free Play first** in the Base App (play-money is not gambling and is the natural frictionless on-ramp); keep real-money behind an eligibility/geo gate pending a legal skill-vs-chance read.
2. **Host-approval vs "instant join".** Every table needs Host approval before a seat (even public ones), which collides with "send link → play instantly". Resolution: **Free Play auto-seats** cold/viral traffic; **real-money** reframes the tap as "request to sit" + a Host approval push, with a Host-side "auto-approve from my invite link". Don't promise instant real-money seating.
3. **Analytics first.** There is **no product analytics in the repo** (no PostHog/Amplitude/Segment). Every viral claim is unmeasurable until instrumented. Add one tool + the Base App funnel events (`base_app_context_detected → connect_shown → connect_tapped → siwe_success → deeplink_arrived → seat_requested → seat_granted → first_hand → share_initiated → share_link_opened`) before building loops.

See `references/growth-loops.md` for the full plan and the existing growth stack we should reuse.

## Two tracks

### Track A — Base App = standard web app (THE build target)
- **Register / manage** the app on **Base.dev** (dashboard.base.org). `base:app_id` in `app/layout.tsx` maps to the Base.dev project (`697e0df32aafa0bc9ad8a2b7`).
- **Login = one-tap Base wallet, bridged into thirdweb.** Get the provider via `@base-org/account` `createBaseAccountSDK().getProvider()` (run `npm i @base-org/account` first — it's only transitive today; **do not** sniff `window.ethereum`, unconfirmed), wrap with thirdweb `EIP1193.fromProvider({ provider, walletId: 'app.base' })`, then `const account = await wallet.connect({ client })`. ⚠️ **`client` goes to `connect()`, not `fromProvider`.** Activate via `useConnect().connect(async () => wallet)` (reuse only that step from `E2EAutoConnect.tsx`), and the existing `useWalletAuth` SIWE flow fires unchanged. **Not** `sdk.wallet.getEthereumProvider()` (Track B). → `references/base-app-integration.md`
- **External links:** `window.open(url)` is correct inside the Base App in-app browser. Route through one `app/components/ExternalLink.tsx` chokepoint. (`sdk.actions.openUrl` is deprecated here.)
- **Share / join fast (highest-leverage growth):** **ENRICH** the *existing* static `generateMetadata` in `app/table/[id]/page.tsx:10` with live per-table data (name, stakes, Free-Play/USDC tag, host basename, seats open) + a per-table OG image, **and** carry the `fc:miniapp` embed on `homeUrl` + the table route — Base **requires** homeUrl embed metadata to render the launch card, and sharing the URL is what triggers Base.dev search indexing. Add a `?join=1` deep-link (TablePage reads no `searchParams` today). → `references/navigation-share-notify.md` · `references/growth-loops.md`
- **Notifications** ("your table is starting", "your turn to act"): **Base Dashboard Notifications API**, wallet-address keyed — `POST https://dashboard.base.org/api/v1/notifications/send`. Not Farcaster FID tokens. → `references/navigation-share-notify.md`

> **The `fc:miniapp` embed + signed `accountAssociation` are Track A (Base App), not dormant Farcaster artifacts** — the Base App reads the embed to render shared links as launch cards and to index us in search. Only the *Farcaster runtime* (launch button, splash, FID context, `requiredCapabilities`) is inert in the Base App.

### Track B — Farcaster / Warpcast (DORMANT — only if we ship there)
Raw `@farcaster/miniapp-sdk` (`ready`, `sdk.wallet.getEthereumProvider()`, `composeCast`, `openUrl`) behind a **real Farcaster-host check**. Keep isolated so it can't run (and break) inside the Base App. (The `farcaster.json` manifest + `fc:miniapp` embed themselves are shared infra — see the Track A note above.) → `references/farcaster-track-b.md`

## Guardrails
- thirdweb stays the primary wallet/onboarding/payment layer. No wagmi/OnchainKit migration unless explicitly chosen.
- Wallet connection is the session — no email/password auth.
- Inside the Base App, **do not** rely on `sdk.actions.*` / FID context. Detect "am I in a wallet webview" via injected-provider / Base Account presence, not `sdk.isInMiniApp()`.
- Key all owner-match / `gameCreator` / predicted-address logic off the **live connected address** — in the Base App that's the Coinbase Smart Wallet, NOT the thirdweb-pinned factory account (`0x85e2…DF00`).
- Keep the app's USDC ERC-20 paymaster (`BASE_PAYMASTER_URL`, EIP-5792 `wallet_sendCalls`) — the Base App does NOT auto-sponsor arbitrary app contract calls. → `references/paymaster.md`
- Manifest must be reachable at `https://stackedpoker.io/.well-known/farcaster.json` over HTTPS — its `accountAssociation` proves domain ownership for **Base.dev** (re-sign it; the current signature looks like a broken placeholder).

## Backend (poker-server) — mostly already done
- SIWE (`transport/http/auth/siwe.go`) already verifies **deployed** Coinbase Smart Wallets (ERC-1271, factory-agnostic). `gameCreator`/owner-match is normalized-address comparison — wallet-type agnostic. So a deployed Base Account works **today** with no contract change.
- **Gap:** an **undeployed** Coinbase Smart Wallet on first-ever login (EIP-6492 Path 2b) is hard-pinned to thirdweb's `Account.sol` scheme and will NOT recover. Fix = deploy-before-first-login (simplest) or add a Coinbase 6492 branch + the Coinbase factory to `SIWE_ALLOWED_FACTORIES`. Smart-account SIWE paths have **zero test coverage** — add ERC-1271/6492 tests. → `references/base-app-integration.md`

## Testing & simulation
The in-repo **dev shell** (`app/dev/base-shell`, gated by `NEXT_PUBLIC_ENABLE_DEV_TOOLS`) is a **visual chrome/safe-area harness** — it frames the app in a mock Base App device frame to spot double-header / safe-area collisions. It does **not** inject a Base Account provider or exercise the `EIP1193.fromProvider` bridge (cross-origin provider injection is impossible from the parent). Verify the real one-tap-login → SIWE → `wallet_sendCalls` path in a **Playwright** harness (wallet-mock), then **Base.dev Preview** via `cloudflared`, then an **on-device** pass with explicit pass/fail criteria. → `references/testing-simulation.md`

## Optional: Base's official skill
Base publishes an upstream playbook skill (`build-on-base`) via `npx skills add base/skills` (github.com/base/skills). Useful as a reference for contracts/payments/attribution/migrations. Install deliberately (it pulls external code); this repo skill encodes OUR specific decisions and file landmarks, which the generic one does not.

## References
- `references/base-app-integration.md` — Track A: Base wallet → thirdweb bridge, SIWE wiring, backend smart-account paths, address-keying gotchas.
- `references/navigation-share-notify.md` — `window.open` chokepoint, per-table OpenGraph + `?join=1` deep-link, Base Notifications API.
- `references/manifest-and-registration.md` — Base.dev registration + `base:app_id`; the `accountAssociation` (launch blocker — re-sign) + the `fc:miniapp` embed (Track A growth primitive).
- `references/paymaster.md` — USDC ERC-20 paymaster via EIP-5792 inside the Base App; what Base does/doesn't sponsor.
- `references/testing-simulation.md` — the dev shell (visual chrome harness) + Base.dev Preview + cloudflared + on-device QA.
- `references/farcaster-track-b.md` — the dormant Warpcast/Farcaster path with raw `@farcaster/miniapp-sdk`.
- `references/growth-loops.md` — the viral loops + the existing growth stack to reuse (referral/quests/points/leaderboard/ShareRankCard) + Builder Code.

## Provenance — last verified against
@farcaster/miniapp-sdk 0.3.0 (Apr 2026; repo pins ^0.2.2/0.2.3) · thirdweb ^5.120.0 (`EIP1193.fromProvider({provider, walletId})` — `client` goes to `connect()`) · @coinbase/onchainkit 1.1.2 (React 19/wagmi peers — rejected) · @base-org/account `createBaseAccountSDK().getProvider()` (bare EIP-1193 provider; `baseAccount()` is the wagmi form we are NOT using; package is transitive-only — declare it) · Next 15 / React 18 / Chakra v2 · **Base App standard-web-app model as of 2026-04-09**. Re-verify SDK/API names at implementation time.
