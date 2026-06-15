# Growth & virality loops (Base App)

The plan's hard part isn't the wallet bridge — it's distribution. The repo **already ships a growth stack** the rest of the skill ignored; wire it into Base-native loops rather than rebuilding.

## Reuse what's already here (don't rebuild)
- `app/components/Leaderboard/ReferralCodeSection.tsx` — referral codes + multiplier tiers (1.0→1.1 at 5 referrals). **Problem: it points at `/leaderboard?referralCode=` while the table loop points at `/table/[id]` — the two loops are disconnected.** Unify: ride the code on the join link → `/table/[id]?join=1&ref=CODE`, and make it two-sided (invitee's first buy-in fee-free, inviter earns points — Dropbox model).
- `app/components/Leaderboard/QuestsSection.tsx` + `getQuests`/`completeQuest` — a `create_table` quest already exists. Add Base App quests (connect, first hand, invite a friend, host a table).
- `app/leaderboard/` + `PointsActivityFeed` — add **Seasons** (reset + reward at close) so the board has recurring, loss-averse stakes. Add streaks + friend-presence ("3 of your follows played today").
- `app/components/.../ShareRankCard.tsx` — already renders a share image via `navigator.share`/X/Telegram. Extend it into a **feed-native per-URL OG card** (big-pot win, tournament cash, rank change) instead of `window.open` to X.

## Prerequisite: instrument first (no analytics in repo today)
There is **no PostHog/Amplitude/Segment** in the repo. Add one + the Base App funnel before claiming any loop works: `base_app_context_detected → connect_shown → connect_tapped → siwe_success → deeplink_arrived → seat_requested → seat_granted → first_hand → share_initiated → share_link_opened`. North star: **weekly seated players who play ≥1 hand**. k-factor = invites/active × invite→first_hand.

## The loops, ranked (effort)
1. **[M] Per-table launch card — the link IS the invite.** ENRICH the existing static `generateMetadata` (`app/table/[id]/page.tsx:10`) with live table data + a per-table `ImageResponse` OG (3:2 PNG ≤10MB) + the `fc:miniapp` embed. Sharing the URL → tappable launch card in Base App chat **and** auto-indexes us in Base search (~10 min). Highest leverage. See `navigation-share-notify.md`.
2. **[M] `?join=1` deep-link-to-seat** at the most viral moment. Free Play auto-seats (instant play for cold traffic); real-money = request-to-sit + Host approval push (the Host-approval rule makes "instant" impossible for money — don't fight it). Preserve intent across SIWE.
3. **[M] Host flywheel.** Hosts are the scarce supply side and already earn ~1% of pot — over-reward supply first. After "Create table", the **next screen is "invite players / share link"** (Slack: the invite IS the setup step, viral-coefficient ~8.5). Surface host earnings, a Host badge on the basename, and a "your table filled" push.
4. **[L] Wallet-keyed Base notifications** as the re-engagement engine — behavioral triggers, not just "tournament starting": **"your turn to act"** (highest-retention poker push), "2 seats left" (FOMO), "a friend joined", "you lost your #1 spot" (loss aversion ≈2× gain), "your table filled" (Host). Server-side channel-abstraction so a "table starting" event fans out to the Base API (Base App users) **and** `sw.js` web-push (plain web) with **no double-send** — reconcile with `[[project_tournament_reminders]]`.
5. **[M] Shareable result/brag cards + Seasons leaderboard ritual.** Trigger the share at **peak moments** (win, cash, rank change). Don't auto-tag users (reads spammy) — use the OS share sheet + the embed URL.
6. **[S] Builder Code + Base.dev game listing.** Claim the Builder Code (an ERC-721 code) on Base.dev; attribute txns by appending the **ERC-8021 data-suffix** to deposit/join/settle calldata (thirdweb: append to tx `data` ourselves — no wagmi) → App Leaderboard / Base App store visibility + Builder Rewards (helps cold-start discovery). See `manifest-and-registration.md`.
7. **[S] Two-sided referral ride-along** on the join link (loop #2 + the existing referral stack).

## Cold-start (the empty-lobby killer)
A viral link that lands in a dead lobby kills retention worse than any UX bug (the dev lobby had **no live games** during review). Seed **always-on / scheduled Free Play tables**, a "house" demo table, and a "be the first to host" CTA so a shared link never lands empty.

## UX inspirations to borrow
Slack (invite = setup step) · Dropbox (two-sided referral) · Base onboarding doctrine (authenticate only when it unlocks value; spectate first, sign at take-seat) · SignInWithBase one-tap (no wallet picker) · Yoink-style loss-aversion pushes · PokerStars Home Games / Zynga (clubs, invite codes, Free Play as top-of-funnel) · Basenames + cheap EAS badges as on-felt identity *and* share bait.

## Hard constraint
**No programmatic compose-to-feed on Track A** — `composeCast` is inert in the Base App. "Share to Base" = native share sheet + the embed-bearing URL. Distribution is earned via shareable links + notifications + discovery, not auto-posting.

## Sources
- https://docs.base.org/mini-apps/core-concepts/embeds-and-previews
- https://docs.base.org/mini-apps/troubleshooting/how-search-works
- https://docs.base.org/mini-apps/core-concepts/notifications
