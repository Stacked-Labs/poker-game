# Stacked in the Base App — Product & Engineering Scope

**Date:** 2026-06-12 · Companion to [REVIEW.md](REVIEW.md) (the UI/UX flow review) and the `base-miniapp-developer` skill (the build recipes). This is the *what to build and why* — scoped as PM + engineer, grounded in the critical review + current Base research.

## Vision
Stacked becomes **the poker table you can deal into in one tap, right inside the Base App.** Your USDC is already in your pocket, your Basename is already your seat name, and the table link a friend dropped in chat **is** the invite. Open from the feed → one tap to sign in with your Base wallet (no social-login maze, no download) → land at a live table or a one-tap "host your own" CTA → first hand in ~30 seconds. **Free Play is the frictionless on-ramp** (a true home game, zero risk, instant seat); real-money USDC tables sit one eligibility gate away, with the Host-approval handshake reframed as a feature ("the Host let you in"), not friction. The flywheel: Hosts earn ~1% of every pot → they invite players → every shared link unfurls as a launch card and auto-indexes us in Base search → every big hand and leaderboard climb shares back into the feed.

## North star & funnel
- **North star:** weekly seated players inside the Base App who play **≥1 real hand** (Free Play or USDC). Butts in seats — not installs or page views.
- **Activation:** time from `base_app_context_detected` → `first_hand` (target ~30s for Free Play). This single number is the launch's pass/fail.
- **Acquisition funnel:** `deeplink_arrived → seat_requested → seat_granted → first_hand`; track **Host-approval latency** (`seat_requested→seat_granted`) as a first-class funnel-killer.
- **Virality:** k-factor = (invites/active player) × (invite→`first_hand`). Aim **k>1 on Free Play first** (auto-seat removes the approval drag).
- **Retention:** D1/D7/D30 of seated players; % of returning sessions from a Base notification; **Host repeat-rate** (2nd table within 7 days) = supply-side health.

## Three prerequisites to settle BEFORE growth work (P0)
1. **Compliance gate.** Real-money poker inside a Coinbase surface raises a policy question (Coinbase Prohibited Use bars unsanctioned games of *chance*; poker also carries age/geo/KYC/AML duties). **Decision: launch Free Play first** in the Base App; keep real-money behind an eligibility/geo gate pending a legal skill-vs-chance read. This is the single biggest unscoped risk and every viral loop amplifies it.
2. **Host-approval vs "instant join."** "Send link → play instantly" collides with the rule that every table needs Host approval. **Resolution:** Free Play auto-seats cold traffic; real-money = "one tap = request to sit" + a Host approval push + a Host-side "auto-approve from my invite link." Don't promise instant real-money seating.
3. **Analytics.** There is **no product analytics in the repo** (no PostHog/Amplitude/Segment). Instrument the funnel above *before* building loops — otherwise no viral claim is measurable.

## Onboarding (the hero flow)
**Cold-open:** detect the Base App context — **not** `useIsMiniApp`/`sdk.isInMiniApp()` (returns `false` in the Base App now); detect via Base.dev launch context or an attempted `createBaseAccountSDK().getProvider()` connect. In that context render **app-first**: skip the marketing hero, email capture, and BTC/ETH ticker → go straight to the `/public-games` lobby as a **spectator with zero signature** (Base doctrine: "authenticate when it unlocks value, deliver value in <10s"). Add `env(safe-area-inset-*)` and collapse our own top nav so it doesn't stack under the ~96px Base App header (the verified double-header bug).
**Connect (deferred to "Request a seat"):** one tap → `createBaseAccountSDK().getProvider()` → `EIP1193.fromProvider({ provider, walletId: 'app.base' })` → `await wallet.connect({ client })` → activate → existing `useWalletAuth` SIWE fires unchanged. Suppress the 8-option social list + multi-wallet modal in this context.
**Seated:** Free Play `?join=1` auto-seats instantly (first hand ~30s). Real-money = request-to-sit + Host approval push; reframe the wait as "the Host is letting you in"; lead with the user's USDC balance + Base Pay, surface our onramp only when balance < buy-in. **Prereq:** deploy the Base Account before first login so the undeployed-CBSW EIP-6492 SIWE gap is never hit.

## Viral loops (ranked)
| # | Loop | Effort | Core move |
|---|------|--------|-----------|
| 1 | **Per-table launch card** (the link IS the invite) | M | ENRICH existing static `generateMetadata` (`app/table/[id]/page.tsx:10`) → live table data + per-table `ImageResponse` OG + `fc:miniapp` embed. Shared URL → tappable launch card in Base chat **+ auto-indexes us in Base search**. |
| 2 | **`?join=1` deep-link-to-seat** | M | Add `searchParams`; Free Play auto-seats, real-money = request-to-sit + Host push. Preserve intent across SIWE. |
| 3 | **Host flywheel** | M | After "Create table" the next screen is "invite players / share link" (Slack: invite = setup step). Surface host earnings + Host badge + "your table filled" push. |
| 4 | **Wallet-keyed Base notifications** | L | Behavioral triggers: "your turn to act", "2 seats left", "friend joined", "lost your #1 spot", "your table filled". Channel-abstraction reconciled with tournament-reminders (no double-send). |
| 5 | **Result/brag cards + Seasons** | M | Extend `ShareRankCard` into per-URL OG cards triggered at peak moments; add Seasons to the leaderboard. |
| 6 | **Builder Code (ERC-8021)** | S | Data-suffix on deposit/join/settle → App Leaderboard featuring + Builder Rewards (cold-start discovery). |
| 7 | **Two-sided referral ride-along** | S | Ride the existing referral code on `/table/[id]?join=1&ref=CODE` (unify the two disconnected loops); invitee fee-free first buy-in, inviter points. |

Detail + the existing growth stack to reuse: `.claude/skills/base-miniapp-developer/references/growth-loops.md`.

## Retention
"Your turn to act" push (highest-retention poker signal) · save-app/opt-in prompt at a **win/cash-out** moment · **Seasons** + streaks + friend-presence on the leaderboard · Free Play as the always-seedable substrate · Host repeat loop ("your table filled" + earnings) · Basenames + cheap EAS badges as on-felt identity *and* share bait · **kill the webview-hostile hard reloads** (`WebSocketProvider.tsx:869`, `ConnectionLostToast.tsx:18`, `WalletChangeReloader.tsx:34`) — silent retention leaks inside the webview.

## Roadmap
**MVP (Base App beta, Free Play first)**
- [P0 security] gate `app/dev/base-shell` + `E2EAutoConnect` behind flags *(done in this pass)*.
- [P0] add product analytics + the Base App funnel events.
- [P0] compliance decision: Free Play leads; real-money behind eligibility gate.
- [P0] one-tap Base login: `npm i @base-org/account`, build `BaseAppConnect`, correct bridge signature, suppress social list in-app, defer signature to take-seat, `useIsBaseApp()` detection.
- [P0] app-first landing + safe-area + collapse double header (Base App context); spectate before signature.
- [P0] backend: deploy-before-first-login; add ERC-1271/6492 SIWE tests (zero today).

**V1 (growth on)**
- [P1] per-table dynamic OG + `fc:miniapp` embed on homeUrl (loop #1).
- [P1] `?join=1` deep-link-to-seat with the Free-Play-auto-seat vs real-money split (loop #2).
- [P1] route all share/invite through `ExternalLink`+`window.open`/Web Share.
- [P1] Host create-and-share flow + "auto-approve from my invite link" + approval push (loop #3).
- [P1] re-sign the broken `accountAssociation`; publish the Base.dev game listing (category=games, voice-compliant copy); claim the Builder Code.

**V2 (compounding)**
- [P2] behavioral notifications via the channel-abstraction (reconcile tournament-reminders).
- [P2] unify referral with the join link; two-sided rewards.
- [P2] Seasons + streaks + feed-native brag cards.
- [P2] webview performance pass on the react-three felt (FPS/TTI budget + 2D fallback + reduced-motion).
- [P2] cold-start seeding: always-on/scheduled Free Play tables + a house demo table + Base.dev featuring.
- [P2] copy/brand scrub on player surfaces: `FAQsData.ts` ("Thirdweb", "Banker"), `Footer.tsx`, `CommunitySection.tsx`, `YourTableVaultSection.tsx`; remove the duplicate `base:app_id` (`layout.tsx:39` & `:91`).

## Eng architecture (mapped to the repo)
- **`BaseAppConnect.tsx`** (NEW, sibling to `E2EAutoConnect.tsx`, mounted in `providers.tsx`) — `createBaseAccountSDK().getProvider()` → `EIP1193.fromProvider({provider, walletId})` → `wallet.connect({client})` → activate. Reuse only the activation step from E2EAutoConnect (its `createWalletAdapter` path is different). Suppress the social `AutoConnect`/`ConnectButton` in-context.
- **`useIsBaseApp()`** (NEW predicate) — gates app-first landing, social suppression, onramp/paymaster behavior, notification keying. Not `sdk.isInMiniApp`, not `window.ethereum` sniffing.
- **`app/table/[id]/page.tsx`** — enrich the *existing* `generateMetadata`; add an `ImageResponse` OG route; add `searchParams` for `?join=1`.
- **`TakeSeatModal.tsx`** — the `seatRequested`/approval flow already exists; wire `?join=1` to auto-open + branch Free-Play-auto-seat vs real-money-request; add an intent-preservation helper (stash pre-SIWE, replay post-auth).
- **`ExternalLink.tsx`** — route all outbound/share through it; migrate `LobbyBanner.tsx:52`, `ShareRankCard.tsx`, `useConnectX.ts:34`, `app/tournament/[id]/page.tsx:334`.
- **Paymaster** — keep the USDC ERC-20 paymaster (`thirdwebclient.ts` `BASE_PAYMASTER_URL`, EIP-5792 `wallet_sendCalls`); the Base App does not auto-sponsor app calls. Re-key onramp/paymaster suppression off `useIsBaseApp()`, not the dead `useIsMiniApp()`.
- **poker-server SIWE** (`transport/http/auth/siwe.go`) — deployed CBSW works via ERC-1271; fix undeployed-first-login via deploy-before-login; add ERC-1271/6492 tests; optionally emit the active Base chain instead of `ChainID:1`.
- **Notifications** — a poker-server channel-abstraction dispatcher (Base API for Base App, `sw.js` web-push for plain web), reconciled with `[[project_tournament_reminders]]`.
- **Growth reuse** — `ReferralCodeSection`, `QuestsSection`/`getQuests`/`completeQuest`, `leaderboard`, `ShareRankCard` already ship; wire into Base-native loops; unify the disconnected `/leaderboard?referralCode=` and `/table/[id]` links.
- **Builder Code (ERC-8021)** — data-suffix on existing tx calls, mapped to the Stacked treasury; claim on Base.dev. No redeploy.
- **Manifest** — re-sign `accountAssociation` (broken placeholder); verify `baseBuilder.allowedAddresses` (array) vs repo's `ownerAddress`; remove duplicate `base:app_id`.

## Key risks
1. **Compliance** (biggest) — real-money poker in a Coinbase surface; Base.dev rejection/removal risk. → Free Play first + legal read + geo/age gating.
2. **Host-approval vs virality** — the funnel breaks at its most viral moment for real money. → Free Play auto-seat; real-money = request + push + host auto-approve.
3. **Cold-start / empty lobby** — a viral link landing in a dead lobby kills retention. → seed always-on Free Play + house table + Host incentives + Base.dev featuring.
4. **No analytics** — every k-factor claim unprovable. → PostHog P0.
5. **Backend SIWE gap** — undeployed-CBSW first login fails; zero test coverage; a viral spike of brand-new users is exactly this cohort. → deploy-before-login + tests.
6. **Webview performance** — react-three felt can jank/crash in a mobile in-app browser. → perf budget + 2D fallback.
7. **API/dep correctness** — validated in this pass (bridge signature fixed, `@base-org/account` must be declared, `window.ethereum` injection unconfirmed) — confirm on-device before trusting P0.

## UX inspirations to borrow
Slack (invite = the setup step, viral coeff ~8.5) · Dropbox (two-sided referral) · Base onboarding doctrine (spectate first, sign at take-seat, Base Account default) · SignInWithBase one-tap (no wallet picker) · Yoink loss-aversion pushes ("come take back your #1 spot") · PokerStars Home Games / Zynga (clubs, invite codes, Free Play top-of-funnel) · Basenames + EAS badges as identity + share bait.
