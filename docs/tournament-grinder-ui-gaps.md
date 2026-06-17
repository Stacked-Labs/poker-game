# Tournament UI — Grinder Gap Analysis

**What this is:** a triangulation of (1) what a serious MTT grinder expects across the best poker sites, (2) what the Stacked backend actually exposes (`poker-server/docs/tournaments-spec/09-frontend-feature-guide.md`), and (3) what the current `poker-game` UI renders today. Every gap is tagged with backend availability, current coverage, a concrete placement, and a priority.

**Legend**
- Backend: `available-now` (data is there, we just don't show it) · `client-derivable` (compute from data we already have) · `partial` · `backend-gap` (worth building, backend doesn't expose it yet) · `not-in-v1` (spec §12 — do **not** build)
- Priority: **P0** load-bearing / correctness · **P1** high grinder value · **P2** nice-to-have

---

## Headline finding

The *components* are built and tasteful (lobby card, detail page, create form, register/refund/emergency flows, host panel). What's missing is the **information density a grinder reads to make decisions** — and most of it is data we already have or can derive.

Three things stand out:

1. **The live in-tournament surface barely exists.** When seated at `/table/tournament-*`, there is **no tournament HUD at all**. Worse, the backend *pushes* `tournament-clock` and `tournament-player-count` over the websocket, but `WebSocketProvider` has **no handler** for them — they fall through to `default: "Unhandled action type"` and are dropped. Eliminations/wins are handled only as 5–8s toasts.
2. **The blind structure sheet — your explicit example — is entirely absent.** The detail page shows only a `"turbo"` label and a bare `Level N`. No per-level SB/BB/ante anywhere.
3. **No payout ladder.** The Payouts panel shows only settlement status after completion. The places-paid / prize-distribution table — the artifact grinders study before registering — doesn't exist, even though §8 fully specifies it and it's client-derivable.

---

## Session log — decisions locked (2026-06-06)

Brainstorming the live-tournament cluster (F1) first. Locked so far:

- **No in-table tournament strip and no depth drawer.** Distribute tournament context into existing surfaces + event overlays instead.
- **`GameConfigWatermark` (Footer)** becomes tournament-aware → `NLH · LVL n · sb/bb (ante a)` plus players-left/total on **its own line** (replaces "Max Buy-In"); host = the tournament Host.
- **`GameStatusBanner` (center pill under the community cards)** gets a new lowest-priority state = **next-level countdown, ambient-always** (quiet all level; escalate amber + pulse in the last 60s; ~2s "Blinds up · new blinds" flash at rollover); yields to settlement/pause states.
- **No stack-in-BB anywhere at the table** — a poker player knows their stack.
- **Depth lives on the detail page `/tournament/[id]`** (a second browser tab is acceptable) **plus a new conditional "Tournament" tab in `SettingsModal`** showing the **full** standings + payout ladder + prize pool/overlay + distance-to-money + recent busts. (Make the modal's hardcoded `onchainTabIndex` dynamic when inserting the tab.)
- **Bust card overlay** = finish place / of field + winnings (USDC, $0 if none) + re-enter prompt with late-reg countdown if eligible; replaces the elimination toast. **Win card** + **table-move transition** kept as proposed.
- **F1 verified buildable with zero backend changes**; **F2 locked as a client-side mirror of the four backend ladders**; **F3 locked as a client-side mirror of `payout.go`** (no projected-payout endpoint exists). All three foundations are now locked — ready to build the live cluster. (Details in the foundations section below.)
- **Full build spec written** → see **"Build Spec — Live Tournament Cluster (LOCKED, build-ready)"** at the end of this doc. Every component's file, trigger, data source, layout, tokens, copy, states, responsive/motion/a11y rules, and acceptance criteria are pinned for autonomous start-to-finish execution.
- **BUILT (2026-06-06).** The whole live cluster is implemented: F2 `blindStructures.ts`, F3 `payouts.ts`, F1 state slice + WS handlers + `useTournamentLive`/`useLevelCountdown`, tournament-aware `GameConfigWatermark`, `GameStatusBanner` clock state, result/win/table-move overlays, `StructureSheet` + `PayoutLadder`, and the Settings **Tournament** tab — plus a Storybook story for every presentational piece (no unit runner exists in this repo; Storybook is the review surface). `tsc`, `next lint`, and `next build` all green. Ran a 25-agent adversarial self-review; fixed all confirmed findings: **(HIGH)** meta now refreshes on a 15s poll (field/pool/clock no longer go stale during late reg, clock self-heals); **(HIGH)** table cell borders overridden so they aren't near-black in light mode; **(MED)** payout tiers now key on unique players (leaderboard rows) not bullet entries; plus low-sev fixes (reduced-motion entrance, banner yields to the result card, Free Play pill in the tab, watermark contrast). **Deferred (low):** SettingsModal still uses path-based tournament detection (the panel renders a graceful empty state when no live data); a one-render stale-`tournamentLive` flash is possible during tournament→cash navigation (cleanup clears it immediately). Awaiting the owner's final review.

---

## What's already solid (not relitigating)

- USDC base-unit formatting (`formatUsdc`, ÷1e6) is centralized and correct everywhere.
- Real-money vs Free Play visual signature (USDC logo + blue vs neutral/green) on lobby + detail.
- State machine badges (Registering / Live / Final / Cancelled / Not open yet / Refunds open) + pulsing live dot.
- On-chain custody trust surfaces: "Held by the table contract" + Basescan links, settlement receipt (tx hash), 24h emergency-refund panel with countdown.
- Register / unregister / late-reg / re-enter actions wired end-to-end on-chain (approve→register stepper, "Syncing…" indexer state).
- Host go-live: fund-guarantee → open-registration two-step; post-game rake claim.
- Standings table: rank, identity (X/wallet/avatar), live chips, table link, bullets, final prize.

---

## The 3 foundations that unlock most of the list

These are force-multipliers — build them first because many gaps below are just "render a number these produce."

### F1 — Live tournament store + WS handlers (unlocks the entire live HUD)
Add `tournament-clock` and `tournament-player-count` cases in `WebSocketProvider.tsx` (currently dropped) writing to a new tournament slice in the Zustand store; accumulate `tournament-elimination` instead of only toasting it. Seed from the one-shot `getTournamentClock`/`getTournamentLeaderboard` on mount + reconnect (1006), with explicit loading/stale states. This is the single highest-leverage piece.

✅ **VERIFIED (2026-06-06) — no backend change needed.** The WS `tournament-clock` payload is complete: `level`, `level_number`, `small`, `big`, `ante`, `remaining_ms`, `total_ms` (`poker-server/transport/ws/tournament_messages.go:25`). The REST `/clock` endpoint returns the *same* full snapshot (`tournament_handler.go:847` `handleGetClock` → `clockResponse`) — the old "only `level_number`" note is stale. `tournament-player-count` carries `active` (players remaining; total entries comes from the tournament object / leaderboard, not this event). Caveat: `handleJoinTournament` only subscribes — it does **not** push a current snapshot — and the clock is only broadcast on level *advance* (`BroadcastBlindAdvance`). So the client **must** seed from `getTournamentClock()` on mount/reconnect (which works, since REST returns the full snapshot), then keep current via the WS push, ticking `remaining_ms` down locally between pushes.

### F2 — `BLIND_TEMPLATES` constant (unlocks structure sheet, late-reg depth, next-level, host preview)
Spec §12 is templates-only and §6 fixes exactly 4 structures (Hyper/Turbo/Regular/Deep) — so the full level ladder is deterministic and can live as a frontend constant keyed on `metadata.blind_structure` / `template_id`. Once this exists, the structure sheet, late-reg-BB-at-close, next-level preview, and host structure preview are all client-derivable.

✅ **LOCKED (2026-06-06) — mirror the backend ladders as a client constant.** Confirmed exact in `poker-server/tournament/blind_structures.go`: four `BlindStructure` vars with explicit `{level, small, big, ante, duration}` per level — Hyper (5-min, 15 lvls), Turbo (10-min, 15 lvls), Regular (20-min, 18 lvls), Deep (30-min, 18 lvls). BBA confirmed: L1 ante=0; antes start L2 for Turbo/Regular/Hyper, **Deep delays to L3** (L2 ante=0). All four start 25/50, so a 10,000 stack = 200 BB. `StructureByName(name)`: `regular|deep|hyper`, default `turbo`. **Decision:** port these four tables verbatim into a TS constant (`app/components/PublicGames/blindStructures.ts` or extend `tournamentFormat.ts`), keyed by `metadata.blind_structure`/`template_id`, with a header comment naming `blind_structures.go` as the source of truth. **Scope:** mirror the *defined* levels only (15–18); the backend's `ExtendStructure` doubles blinds past the last level up to 100 — represent that as a trailing "blinds keep rising" note rather than porting the doubling (real tournaments rarely reach it, and the live clock always supplies the true blinds anyway). Live blinds come from the WS/REST clock (F1); this constant is for *forward-looking* display (structure sheet, next-level, late-reg depth) and pre-start (no coordinator/clock exists before start). A future backend `GET /structure` endpoint is the cleaner long-term source — optional, not needed for v1. Helpers to expose: `getStructure(name)`, `levelAt(name,n)`, `nextLevel(name,n)`, `startingBigBlinds(stack,name)`, `bbAtLateRegClose(stack,name,lateRegLevels)`.

### F3 — `payoutStructure(fieldSize)` helper (unlocks payout ladder, ITM, pay-jumps, locked min-cash)
Encode the §8 ladder as a shared helper. Feed it `registered_count` + live `prize_pool_usdc` (floored at guarantee). This is **not** the §12-excluded ICM — it's the allowed payout ladder. Powers: projected payout table + ITM threshold (detail), payout-shape preview (card), next-pay-jump / distance-to-money / locked-min-cash (HUD), host payout preview (create).

✅ **LOCKED (2026-06-06) — mirror `tournament/payout.go` client-side; no endpoint exists.** Confirmed exact (`DefaultPayouts(entrants)`), with the bigger-field percentages the spec left vague now pinned down:

| Field | Places paid | Percentages (per position) |
|---|---|---|
| ≤2 | 1 | 100 |
| ≤6 | 2 | 70 · 30 |
| ≤9 | 3 | 50 · 30 · 20 |
| ≤18 | 4 | 45 · 28 · 17 · 10 |
| ≤27 | 6 | 40 · 25 · 15 · 10 · 7 · 3 |
| ≤54 | 9 | 34 · 20 · 13 · 9 · 7 · 5 · **4 · 4 · 4** (pos 7–9) |
| 55+ | 18 | 30 · 18 · 12 · 8 · 6 · 5 · **4·4·4** (7–9) · **1×9** (10–18) |

**Two rules to replicate exactly so projected/your-prize numbers match the on-chain payout:** (1) a tier's percent is **per-position, not split** — `{7,9,4}` means positions 7, 8, 9 *each* get 4%; `{10,18,1}` means positions 10–18 *each* get 1%. (2) `CalculatePayouts` floors each position's micro-USDC amount and dumps the **rounding residual on 1st place** so the pool is fully conserved. **No projected-payout endpoint exists** (routes are list/detail/results/leaderboard/clock/registrations/register/unregister/open-registration/create); per-finisher prizes only appear post-completion in `/results`. So mirror both functions in a TS helper (`app/components/PublicGames/payouts.ts` or extend `tournamentFormat.ts`), comment-sourced to `payout.go`. **Inputs:** field size = `registered_count` (the precise backend input is total entrants incl. re-entries — `registered_count` is our best available proxy; see backend ask on entries-vs-uniques); pool = `prize_pool_usdc` (already guarantee-floored). **Lifecycle:** the backend finalizes the structure on the actual field size when play starts; show ours as **"Projected"** during registration (recompute as the field grows) and **lock it visually once running** (spec §8). **Helpers:** `defaultPayouts(entrants)`, `calculatePayouts(tiers, poolMicro)`, `placesPaid(entrants)`, `percentForPosition(pos, entrants)`, plus grinder reads `minCash(entrants, pool)`, `nextPayJump(rank, entrants, pool)`, `distanceToMoney(playersLeft, entrants)`.

---

## Gaps by surface

### A. In-tournament live HUD (`/table/tournament-*`) — biggest gap
*Today: no tournament overlay exists; Table.tsx only uses `isTournamentTable` to hide Away/Leave.*

| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Tournament clock** — level + exact SB/BB/ante | available-now (F1) | P0 | New `TournamentHUD` in `Felt/` (top strip), reads tournament store |
| **Time remaining in level** + "blinds up" warning (last ~60s) | available-now (F1) | P0 | Same HUD; reuse `useCountdown`, respect reduced-motion |
| **Your stack in BB** (not just chips) | client-derivable (F1) | P0 | HUD "your status"; `localPlayer.stack / clock.bb`; optionally on `TakenSeatButton` |
| **Players remaining** (persistent, not toast) | available-now (F1) | P0 | HUD chip "47 / 120 left" |
| **Table-move / re-seat redirect** (you were balanced) | partial | P0 | Detect `table_index` change → route to new table + transition notice. Correctness: no sit-out (§6), so a grinder left behind blinds off. Confirm if backend emits a move event |
| **Bust/win result card** (place /of field + exact USDC + re-enter CTA) | available-now | P0 | New `TournamentResultModal` from the elimination/complete handlers, replacing toasts |
| **Real-time refresh** (no manual reload) | partial | P0 | Clock/player-count = push (F1); leaderboard = poll 10–30s (fetch-only) or request a leaderboard push |
| **In-bust re-entry prompt** (cost + resulting BB + bullets left + late-reg countdown) | partial | P0 | `ReentryPrompt` modal on local-player elimination; reuse `useRegisterForTournament.reenter` |
| **Live leaderboard/standings drawer** on the table | available-now | P1 | `TournamentStandingsDrawer` reusing detail's `Standings` |
| **Your rank** / place out of remaining | available-now | P1 | HUD "your status"; sort leaderboard |
| **Average stack** (chips + BB) | client-derivable | P1 | HUD field block |
| **Distance-to-money / bubble** + ITM beat | client-derivable (F3) | P1 | HUD "3 from the money"; ITM toast when remaining crosses places-paid. **No** hand-for-hand stall (§12) |
| **Prize at current position + next pay jump** | client-derivable (F3) | P1 | HUD "Next jump +$X"; drawer Payouts tab |
| **Persistent elimination feed** | available-now | P1 | Accumulate eliminations; drawer "Feed" tab |
| **Late-reg / re-entry status on table** (open? bullets? cost?) | partial | P1 | HUD late-reg countdown chip |
| **Free Play / real-money tag at the table** | available-now | P1 | Persistent mode tag in HUD (never-blur, §1/§9) |
| **Locked min-cash** (once ITM) | client-derivable (F3) | P2 | HUD "Locked $X" after ITM |
| **Live prize pool + overlay** on running surface | available-now | P2 | Drawer/HUD header |
| **Chip leader / big stacks** | available-now | P2 | Drawer header |
| **M-ratio / Harrington zone** (opt-in, subtle) | client-derivable | P2 | HUD derived stat; explicitly *not* ICM, so allowed |
| **Effective stack vs each opponent** (who covers you) | client-derivable | P2 | Overlay on each `TakenSeatButton` from `game.players[].stack` |
| **Numeric action-timer** (not just border) | partial | P2 | Number on existing timer; **no** time-bank (§6 has none) |
| **Connection / settlement health** indicator | partial | P2 | Status dot in NavBar on tournament tables + self-withdraw link |
| **Final-table emphasis** (remaining ≤ table_size) | client-derivable | P2 | HUD/standings beat |
| **Rail other tables** (bubble / leader's table) | available-now | P2 | Drawer entry reusing existing `table_index` spectate routing |
| **Multi-table "action required" aggregator** | client-derivable | P2 | Cross-table badge from per-table `actionDeadline`; matters more here (no sit-out, Away hidden) |

### B. Detail page — structure, payouts, prize pool
*File: `app/components/Tournament/TournamentDetail.tsx`*

| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Full blind level schedule table** (Level / SB / BB / Ante / Duration) | partial (F2) | P0 | New `StructureSheet`, collapsible section above Host panel (~line 416); highlight current level |
| **Starting stack + starting BBs** | available-now | P0 | Two `Stat` blocks in hero Flex (~270–319). `starting_stack`/`starting_stack_bb` are fetched but never shown |
| **Projected payout distribution table** | client-derivable (F3) | P0 | New `PayoutStructure`/`PayoutLadder` card above Standings; "Projected" until complete |
| **Late-reg stack depth in BB at close** | client-derivable (F2) | P0 | Append "· ~Nbb at close" to late-reg line (~331–341); mark the row in StructureSheet |
| **ITM threshold** ("Top 9 paid · ~17% of field") | client-derivable (F3) | P1 | Top of PayoutStructure |
| **Overlay indicator** (pool short of GTD = added money) | client-derivable | P1 | Green "Overlay $X" pill in `MoneyHero` (player-gain framing, distinct from host exposure) |
| **Buy-in breakdown** (to-pool vs fee + effective rake %) | available-now | P1 | Augment Buy-in `Stat` (~287–308); `fee_bps/100` |
| **Rules summary** (re-entry economics, worst-case spend, table size, 24h net) | available-now | P1 | New Rules accordion after primary panel; "re-entry" not "rebuy/add-on" (§12) |
| **Average stack + chips in play** (live) | client-derivable | P1 | Summary strip in Standings header |
| **Pre-start registrant list** | backend-gap | P1 | Extend Standings to render during `registration` once a roster endpoint exists |
| **Chip leader / your rank summary** | client-derivable | P2 | Standings header strip |
| **Estimated duration / advertised end** | partial | P2 | Hero `Stat` from `advertised_end_at` |
| **Description / host notes + "Hosted by"** | available-now | P2 | Under title; `description` & `host_wallet` exist, never rendered |
| **Break schedule** | backend-gap | P2 | In StructureSheet once it exists — **confirm v1 even runs breaks** |

### C. Lobby & discovery
*Files: `TournamentsList.tsx`, `TournamentLobbyCard.tsx`, `tournamentFormat.ts`*

| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Filter / sort / search bar** (state tabs, mode toggle, buy-in, speed, table size, public/private) | available-now | P0 | New `TournamentFilterBar` above the grid (the empty "Filter Tab" stub ~line 608) |
| **Hard real-money vs Free Play filter** | client-derivable | P0 | Segmented control in the bar; reuse `FilterValue` from cash lobby `types.ts`. Enforces never-blur |
| **"My Tournaments" registered view/tab** | available-now | P1 | Tab in FilterBar using `getMyTournamentRegistrations` (already fetched) |
| **Fee / effective rake on card** | available-now | P1 | Meta row; `fee_bps` only shows in legacy `TournamentCard` today |
| **Payout-shape preview** ("Top 18 · ~50% to 1st") | client-derivable (F3) | P1 | Card money/meta area |
| **Overlay indicator** on card | client-derivable | P1 | Money section when projected entries < guarantee |
| **Sort controls** (start / buy-in / GTD / field) | available-now | P1 | Dropdown in FilterBar; parameterize `compareLobbyTournaments` |
| **Search by name / ID** | available-now | P1 | Input in FilterBar |
| **Blind speed as level duration + est. length** | client-derivable | P1 | Append "· 10-min levels"; **fix the hardcoded `"turbo"` fallback** |
| **Late-reg as "closes after level N"** | client-derivable | P2 | Extend late-reg line |
| **Table size on card** | available-now | P2 | Append to subtitle ("Turbo · NLH · 9-max") |
| **Host identity** (handle/wallet) | partial | P2 | "Hosted by …" via `PlayerNameLink` |
| **"Full" badge + fill %** | available-now | P2 | Action row when `registered_count >= max_entries` |
| **On-chain custody line** on real-money cards | available-now | P2 | Tooltip near ChainBadge |

### D. Registration / late-reg / re-entry
| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Itemized buy-in breakdown on register modal** (to-pool vs fee) | client-derivable | P0 | `CryptoRegisterModal` buy-in block (~812–825) |
| **In-bust re-entry prompt** | partial | P0 | *(see Live HUD — same item)* |
| **Re-entry policy + worst-case spend** stated up front | client-derivable | P1 | Register modal + detail Rules |
| **Late-reg shown 3 ways** (level + clock + live countdown) | partial | P1 | Lobby card + detail late-reg block |
| **"Full" / capacity state** | available-now | P1 | Card + detail PrimaryActions |
| **Registration-closed states with reason** | available-now | P1 | PrimaryActions fallback (~897–930) |
| **Free Play unmistakable at commit** | available-now | P1 | Password modal header + "no real value, no rake" |
| **Cancellation/refund policy at commit** (min-entries, overlay honored, 24h net) | available-now | P1 | Register modal trust line |
| **Unregister deadline visible** | available-now | P2 | Near Unregister button + modal |
| **Personal bullet tracker** ("Entry 2 of 3") | available-now | P2 | Reentry prompt + eliminated fallback. *Note: backend review flagged a `bullet=1` hardcode — verify before trusting counts* |
| **Insufficient-USDC pre-check + deposit path** | backend-gap | P2 | Pre-submit check in register modal |
| **Per-entry receipt** (timestamp, amount, bullet, tx) | backend-gap | P2 | Persist tx beyond the 5-min localStorage TTL; entry-history view |
| **Re-entry seat transparency** (fresh balanced seat, full stack, current level) | available-now | P2 | Reentry prompt copy |

### E. Results / post-game / history
| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Bust/win result card** | available-now | P0 | *(see Live HUD — same item)* |
| **Full payout ladder table** (place → prize) | available-now (F3) | P0 | New `PayoutLadder` above Standings; PayoutsPanel keeps only the settlement receipt |
| **Per-event recap / scorecard** (your finish, cash, net P/L incl. fee + all bullets) | available-now | P0 | New `MyResultCard` at top of detail for completed events with `myPlayer` |
| **ITM moment + cashed-vs-bubbled marker** | partial (F3) | P1 | ITM beat; badge on recap/standings. **No** bubble-stall (§12) |
| **Net transparency** (buy-in vs fee + effective rake %) | available-now | P1 | In MyResultCard |
| **Multi-bullet net accounting** within one event | available-now | P1 | MyResultCard (`bullets × buy_in`) |
| **Lifetime results archive / "My Tournaments" history** | partial | P1 | New `app/tournaments/history` route; assemblable now via `getMyTournamentRegistrations` + per-event fetch (N+1 — a history endpoint would be cleaner) |
| **Aggregate stats** (ROI, ITM%, profit, avg buy-in, volume, biggest score) | client-derivable | P1 | Stats header on history page |
| **Session / daily P&L roll-up** | client-derivable | P2 | Strip on history page |
| **Exportable results (CSV)** | client-derivable | P2 | Button on history page |
| **Key context on recap** (structure, starting stack, duration, overlay) | available-now | P2 | Footer row in MyResultCard |
| **Sharable finish card** (with on-chain proof) | client-derivable | P2 | "Share result" on MyResultCard |
| **Per-player payout tx receipt** | backend-gap | P2 | Link viewer's own Standings row to their payout tx |
| **Bust-hand replay / hand history** | backend-gap | P2 | Future; no replay endpoint today |

### F. Host / organizer tooling
| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Fee/rake economics at creation** (rate, fee/entry, your 25% take ~0.75% of winnings) | available-now | P0 | `CreateTournamentForm` Stakes section + projected-earnings Stat in HostPanel. *The form's own stories reference a "~0.75%" copy it never renders* |
| **Live fill-vs-GTD + running overlay exposure** | available-now | P0 | HostPanel: use live `prize_pool_usdc` (not `count × buy_in`); keep visible through `running` until late-reg close; add "entries to clear GTD" |
| **Blind-structure preview at creation** | backend-gap (F2) | P1 | Expandable level table under template tiles (reuse player StructureSheet) |
| **Description field in create wizard** | available-now | P1 | Basics section; thread through `handleCreateTournament` (currently dropped) + render on detail |
| **Projected payout preview for host** | available-now (F3) | P1 | Shared `PayoutTable` in create + HostPanel |
| **Standalone host dashboard / "My hosted"** | available-now | P1 | New `/host` route; cards filtered by `host_wallet` + per-event funding/earnings/exposure |
| **Live control console** (pause/resume, manual start) | partial | P2 | HostPanel `running` branch; `startTournament` exists but is wired nowhere — confirm tournament-wide pause with backend |
| **Cancel / refund-management** | backend-gap | P2 | Host "Cancel & refund" (needs endpoint) |
| **Free Play zeroing explicit on host surface** | available-now | P2 | HostPanel "Free Play — you earn nothing, no rake" |
| **Host reputation / track record** | backend-gap | P2 | Future `HostProfile`; near-term render host handle |
| **Shareable invite link / series tooling** | backend-gap | P2 | "Share invite" deep link now; series later |

### G. Cross-cutting
| Gap | Backend | Pri | Placement |
|---|---|---|---|
| **Freeroll mis-tagged as Free Play** | client-derivable | P0 | `isFreePlay()` = `buy_in===0` only — a real-money freeroll (buy-in 0 + guarantee + contract) shows as play money. Add `isFreeroll()`; require absence of chain/contract for Free Play. **Correctness/trust defect** |
| **Effective rake % missing on primary path** | available-now | P0 | Lobby card + detail hero + register modal |
| **Free Play tag on running table** | available-now | P1 | Persistent HUD tag |
| **24h self-withdraw at the decision moment** | available-now | P1 | Custody footer + register modal (today only shows while `running`) |
| **Host identity (handle/X) not on primary path** | partial | P1 | "Hosted by" on card + detail; host X-handle is a backend-gap on the tournament payload |
| **Notifications/alerts** (late-reg closing, starting soon, near-money) | available-now | P1 | In-app layer off `scheduled_start_at`/`late_reg_close_at`/pushed player-count |
| **Variant driven by data, not hardcoded "NLH"** | available-now | P2 | Card + detail; silent bug the moment variants expand |
| **Free Play results labeled (no value/no rake)** | client-derivable | P2 | Explicit badge vs current suppression-by-absence |

---

## Explicitly NOT building (spec §12 — listed so we don't relitigate)

ICM / chip-EV / deal-making / chip-chop · hand-for-hand bubble stall · color-up / chip race · bounties / KO / PKO / Mystery · satellites / Spin & Go · rebuy / add-on (re-entry only) · waitlist / alternates · tickets / satellite-seat redemption · custom Host-built blind structures (template **preview** only) · per-player Host-approval queue for tournaments (gate is public-vs-private) · observer hole-card reveal.

*Note: a plain payout-ladder "next pay jump +$X" is **not** ICM and **is** allowed; M-ratio is client-derivable and not named in §12. Only equity/deal math is excluded.*

---

## Backend asks (flag to backend)

1. ~~Confirm the `tournament-clock` WS payload carries SB/BB/ante + time-remaining.~~ ✅ **RESOLVED** — WS *and* REST `/clock` return the full snapshot. No change needed. (Nice-to-have, non-blocking: have `handleJoinTournament` push a current clock snapshot on join so clients don't depend on the REST seed.)
2. ~~Per-template blind level ladders endpoint.~~ ✅ **DECIDED** — mirror client-side for v1 (F2). Optional future `GET /tournaments/{id}/structure` for a single source of truth.
3. **Leaderboard X-identity** (`x_username`, `x_profile_image_url`) — already flagged; needed for HUD/detail avatars.
4. **Leaderboard push** (currently fetch-only) for live standings without polling.
5. **Table-move event** — confirm whether one is emitted, else client detects via `table_index`.
6. **Pre-start registrant roster** endpoint.
7. **Host X-handle / display name** on the tournament payload.
8. **Per-player payout tx receipt** on results/leaderboard.
9. **Host controls**: tournament-wide pause/resume; host-initiated cancel-and-refund.
10. **Break schedule** — confirm v1 even runs breaks before designing for them.
11. **Total entries vs unique players** on the list payload.
12. **Verify the `bullet=1` hardcode** (from the tournament code review) before trusting bullet counts.

---

## Recommended build order

1. **F1 + the live HUD core** (clock, time-left, players-left, your-BB, result card, table-move redirect) — the surface that's most absent and most load-bearing.
2. **F2 + structure sheet + starting stack/BBs + late-reg depth** — your example; the pre-register study artifact.
3. **F3 + payout ladder + ITM + recap/scorecard** — turns abstract EV into concrete numbers, pre- and post-game.
4. **Freeroll mis-tag + fee transparency** — small, but correctness/trust (never-blur).
5. **Lobby filter/sort + "My Tournaments"** — makes the lobby usable at grinder speed.
6. **Host economics + live overlay + host dashboard** — the marketplace supply side.

---

# Build Spec — Live Tournament Cluster (LOCKED, build-ready)

> Self-contained spec for autonomous execution. Covers F1/F2/F3 + the in-table surfaces + the detail-page structure/payout components. Build order at the end. All money is micro-USDC (÷1e6 via `formatUsdc`); chips use `toLocaleString('en-US')`. Every visual must work in **light and dark** (tokens / `useColorModeValue`, never hard-coded white/black) and respect `usePrefersReducedMotion`. Route UI work through the `frontend-design` skill while building and `impeccable` for a polish pass.

## 0. Shared conventions

- **Tournament detection at the table:** `pathname.includes('/table/tournament-')`; parse id with `/^tournament-(\d+)-table-(\d+)$/` (table number = group 2). The WS provider already sends `join-tournament` on connect.
- **Tokens:** `brand.green #36A37B`, `brand.yellow #FDC51D` / `brand.yellowDark #B78900`, `brand.pink #EB0B5C`, `USDC_BLUE #2775CA` + `USDC_LOGO` (from `PublicGames/types`), `text.primary|secondary|muted`, `card.darkNavy`, `card.lightGray`, shadow `card.lift`. Buttons: `tactilePrimary` (green), `tactileOutline`, `tactileDestructive` (pink).
- **Reuse:** `formatUsdc`, `formatTournamentStart`, `useCountdown`, `isFreePlay` (`PublicGames/tournamentFormat`); `PlayerAvatar`, `PlayerNameLink`, `ExternalLink`, `ChainBadge`, `FreeTag`.
- **Free Play never-blur:** real-money = USDC blue + coin; Free Play = neutral/green + a `FREE PLAY` tag, no rake, no fee. Applies to every surface below.

## 1. F2 — `app/components/PublicGames/blindStructures.ts`

Pure data + helpers. Header comment: *source of truth = `poker-server/tournament/blind_structures.go`; mirror exactly.*

```ts
export type TemplateName = 'hyper' | 'turbo' | 'regular' | 'deep';
export interface BlindLevel { level: number; sb: number; bb: number; ante: number; durationMin: number; }
```

Port these verbatim (`{level, sb, bb, ante}`, durationMin = 5/10/20/30):

- **hyper** (5-min ×15): 25/50/0 · 50/100/100 · 100/200/200 · 150/300/300 · 200/400/400 · 300/600/600 · 500/1000/1000 · 700/1400/1400 · 1000/2000/2000 · 1500/3000/3000 · 2000/4000/4000 · 3000/6000/6000 · 5000/10000/10000 · 7500/15000/15000 · 10000/20000/20000
- **turbo** (10-min ×15): 25/50/0 · 50/100/100 · 75/150/150 · 100/200/200 · 150/300/300 · 200/400/400 · 300/600/600 · 400/800/800 · 600/1200/1200 · 800/1600/1600 · 1000/2000/2000 · 1500/3000/3000 · 2000/4000/4000 · 3000/6000/6000 · 4000/8000/8000
- **regular** (20-min ×18): turbo's first 15 then 6000/12000/12000 · 8000/16000/16000 · 10000/20000/20000
- **deep** (30-min ×18): 25/50/0 · 50/100/**0** · 75/150/150 · 100/200/200 · 150/300/300 · 200/400/400 · 300/600/600 · 500/1000/1000 · 700/1400/1400 · 1000/2000/2000 · 1500/3000/3000 · 2000/4000/4000 · 3000/6000/6000 · 4000/8000/8000 · 6000/12000/12000 · 8000/16000/16000 · 10000/20000/20000 · 15000/30000/30000

Note `deep` L2 ante = 0 (ante starts L3); all others ante starts L2; all L1 ante = 0.

Helpers: `getStructure(name?: string): BlindLevel[]` (default `turbo` for unknown — matches `StructureByName`); `levelAt(name, n)`; `nextLevel(name, n)` (null past the last defined level); `startingBigBlinds(stack, name) = Math.floor(stack / getStructure(name)[0].bb)` (= stack/50); `bbAtLateRegClose(stack, name, lateRegLevels) = Math.floor(stack / levelAt(name, Math.max(1, lateRegLevels)).bb)`. Export `BLINDS_KEEP_RISING_NOTE` for display past the defined levels (don't port `ExtendStructure`'s doubling). **Tests:** every structure starts 25/50, L1 ante 0, `deep` L2 ante 0, monotonic blinds, `getStructure('xxx') === turbo`.

## 2. F3 — `app/components/PublicGames/payouts.ts`

Pure logic mirroring `poker-server/tournament/payout.go` (header comment to that effect).

```ts
export interface PayoutTier { min: number; max: number; percent: number; } // percent is PER-POSITION
```

`defaultPayouts(entrants)` returns exactly:
- ≤2 → `[{1,1,100}]`
- ≤6 → `[{1,1,70},{2,2,30}]`
- ≤9 → `[{1,1,50},{2,2,30},{3,3,20}]`
- ≤18 → `[{1,1,45},{2,2,28},{3,3,17},{4,4,10}]`
- ≤27 → `[{1,1,40},{2,2,25},{3,3,15},{4,4,10},{5,5,7},{6,6,3}]`
- ≤54 → `[{1,1,34},{2,2,20},{3,3,13},{4,4,9},{5,5,7},{6,6,5},{7,9,4}]`
- else → `[{1,1,30},{2,2,18},{3,3,12},{4,4,8},{5,5,6},{6,6,5},{7,9,4},{10,18,1}]`

`calculatePayouts(entrants, poolMicro): Map<number, number>` — **replicate exactly:** for each tier, each position `min..max` gets `Math.floor(poolMicro * percent / 100)`; sum them; add the residual `poolMicro - allocated` to position 1. Return empty if pool ≤ 0.

Derived: `placesPaid(entrants)` (= last tier's `max`); `percentForPosition(pos, entrants)`; `minCash(entrants, poolMicro)` (payout at `placesPaid`); `isInTheMoney(rank, entrants)`; `distanceToMoney(playersLeft, entrants) = Math.max(0, playersLeft - placesPaid(entrants))`; `nextPayJump(rank, entrants, poolMicro)` → next position above `rank` whose payout strictly increases (for unpaid ranks, target = `placesPaid`); return `{ targetPos, gainMicro, placesAway }`. **Tests:** each structure sums to 100% of pool (residual conserves the pool exactly); per-position expansion (120 entries → positions 7,8,9 each 4%, 10–18 each 1%); `placesPaid` thresholds.

**Inputs everywhere:** field size = `registered_count` (proxy for total entries; flag entries-vs-uniques backend ask); pool = `prize_pool_usdc` (already guarantee-floored). Show "Projected" while `status === registration`; lock visually once running/completed.

## 3. F1 — live tournament state + WS handlers

**State (extend `AppState` in `interfaces.tsx`, reducer in `AppStoreProvider.tsx` — same idiom as `settlementStatus`):**

```ts
interface TournamentClock { level: number; levelNumber: number; sb: number; bb: number; ante: number; remainingMs: number; totalMs: number; receivedAt: number; }
interface TournamentElim { playerUuid: string; position: number; remaining: number; }
interface TournamentLive {
  tournamentId: number;
  meta: { name: string; registeredCount: number; maxEntries: number; prizePoolUsdc: number; guaranteeUsdc: number;
          buyInUsdc: number; feeBps: number; startingStack: number; blindStructure: string; lateRegLevels: number;
          reentryAllowed: boolean; reentryMax: number; chain?: string; isFreePlay: boolean; hostWallet: string; } | null;
  clock: TournamentClock | null;
  playersActive: number | null;
  feed: TournamentElim[];      // newest-first, capped ~50
  leaderboard: LeaderboardPlayer[]; // from poll
  completed: { winnerUuid: string } | null;
  status: 'connecting' | 'live' | 'stale';
}
```

Add `tournamentLive: TournamentLive | null` to `AppState`. Actions: `setTournamentSeed` (bulk: meta+clock+leaderboard+playersActive), `setTournamentClock`, `setTournamentPlayerCount`, `addTournamentElimination` (unshift + cap + set playersActive=remaining), `setTournamentLeaderboard`, `setTournamentComplete`, `setTournamentStatus`, `resetTournamentLive`.

**WS handlers (`WebSocketProvider.tsx` `onmessage` switch):** add `case 'tournament-clock'` → `setTournamentClock` with `receivedAt: Date.now()` + `setTournamentStatus('live')`; add `case 'tournament-player-count'` → `setTournamentPlayerCount(active)`; extend the existing `tournament-elimination` case to also `addTournamentElimination` (keep the local-player trigger — now opens the result modal, §6) and `tournament-complete` to `setTournamentComplete` (+ result modal). Remove the elimination/complete *toasts* (replaced by the result card).

**Seed/poll hook `app/hooks/useTournamentLive.ts`:** when `isTournamentTable`, on mount fetch `getTournament(id)` + `getTournamentClock(id)` + `getTournamentLeaderboard(id)` → `setTournamentSeed`; poll `getTournamentLeaderboard` every **15s** (refresh `leaderboard` + recompute table-move, §6); re-run the seed on WS reconnect (the provider already tracks reconnect). **Staleness:** mark `status:'stale'` and re-fetch `/clock` if `Date.now() > clock.receivedAt + clock.remainingMs + 5000` (we expected a level advance that didn't arrive). `getTournamentClock` 404s pre-start — fine (we only mount this at a running table). **Type** `getTournamentClock`'s return as `TournamentClock` shape (`{level, level_number, small, big, ante, remaining_ms, total_ms}` → map to camelCase).

**Live tick:** a `useLevelCountdown(clock)` hook → `displayMs = Math.max(0, clock.remainingMs - (Date.now() - clock.receivedAt))` on a 1s interval; returns `mm:ss` + `displayMs`.

## 4. Watermark — `app/components/Footer/GameConfigWatermark.tsx` (tournament-aware)

When `isTournamentTable` and `tournamentLive`, replace the cash config text with tournament text; otherwise unchanged.

```
NLH · LVL 7 · 400/800 (800a)        ← line 1 (uppercase, text.primary, same type as today)
47 / 120 LEFT                       ← line 2, own line (text.muted)  [active / meta.registeredCount]
⬡ Base   👤 Host @phil_h            ← chain badge (real-money) + Host (PlayerNameLink/shortAddr)
```

Rules: ante shown as `(Na)` only when ante>0 (hide on L1 / deep L2). Blinds from `clock` (fall back to `levelAt(blindStructure, levelNumber)` if clock briefly null). Drop "Max Buy-In". Free Play: append a small `FREE PLAY` tag, no chain badge. Keep `pointerEvents="none"` + existing positioning. Acceptance: reads correctly in both modes, both color schemes, single-line truncation safe.

## 5. Banner countdown — `app/components/GameStatusBanner.tsx` (new state)

Add `'tournament-clock'` to `BannerMode` as the **lowest priority**: assign it only when no other mode is active, `isTournamentTable`, and `tournamentLive?.clock`. (It effectively replaces the cash `pending-blinds` state for MTTs.) Render in the existing pill style (`blackAlpha.200`, `backdropFilter blur`, `borderRadius full`, `whiteAlpha` text).

- **Ambient (default):** `⏱ Level {levelNumber+1} in {mm:ss}` (or `⏱ Final level` when `nextLevel` is null), muted `whiteAlpha.700`.
- **Last 60s (`displayMs < 60000`):** text → amber (`brand.yellow`); add the existing `pulse` keyframe (skip if reduced-motion). Copy → `Blinds up in {0:ss}`.
- **Rollover flash:** detect `levelNumber` increment (useEffect on levelNumber) → show `▲ Blinds up · {sb}/{bb}` (amber, brief scale-in) for **2000ms**, then back to ambient.
- A11y: `role="status"`; never color-only (the `↑`/`▲` glyphs + copy carry meaning). Acceptance: ticks smoothly between pushes, yields to settling/paused, both modes.

## 6. Result & transition overlays — `app/components/Tournament/TournamentResultModal.tsx` (+ table-move)

Triggered from the WS handlers for the **local** player. Chakra `Modal`, centered, light+dark, dismissible (except table-move).

- **Bust card (neutral):** title `You finished {ordinal(position)} of {meta.registeredCount}`. Winnings: `prize = calculatePayouts(registeredCount, prizePoolUsdc).get(position) ?? 0` → if >0 `+${formatUsdc(prize)} USDC` (USDC blue) with `In the money` note; else `+$0.00` (muted) + context `{placesPaid} paid` / `{distanceToMoney+? } off the money`. Re-entry block **iff** eligible (late-reg open via `late_reg_close_at`+`useCountdown`, `reentryAllowed`, bullets remaining): `Re-entry open · ⏱ {countdown}` + `tactilePrimary` button `Re-enter — ${formatUsdc(buyInUsdc)}` (reuse `useRegisterForTournament.reenter`) + secondary `View standings` (opens the Tournament tab) / `Exit`. Prefer the actual `prize_usdc` from the final results/leaderboard once present; F3 is the immediate-bust estimate.
- **Win card (celebrate — the one warm moment):** gold (`brand.yellow`) accent + 🏆; `You won {meta.name}` · `1st of {registeredCount}` · `+${formatUsdc(prize)} USDC` · `settling on-chain ~30s`; `View payout tx` (links `settlement_tx_hash` when present, else "settling…").
- **Table-move transition:** in the leaderboard poll, compare the local player's `table_index` to the current URL's table number; on change show a brief (~2.5s) overlay `Moving you to a new table · Table {old} → Table {new+1}` then `router.push('/table/tournament-{id}-table-{new+1}')`. Correctness item — must fire reliably (no sit-out). Acceptance: bust/win fire once each; re-entry only when truly eligible; move always redirects.

## 7. Settings modal — `SettingsModal.tsx` new "Tournament" tab

Refactor the hardcoded indices (`onchainTabIndex = 3`) into a derived `tabs` config array so insertion is safe. Add a conditional `TabItem` (only `isTournamentTable`), icon `FiAward` (or `LuTrophy`), tone `green`, placed **first** (most-used at an MTT). New panel `app/components/Tournament/TournamentTabPanel.tsx` (full-screen scroll), reading `tournamentLive`:

```
Nightly $50 GTD      ● Level 7 · 400/800 (800a) · ⏱ 08:42
Prize pool $5,840    GTD $5,000 · +$840 overlay        [FREE PLAY tag if free]
47 of 120 left · 18 paid · 29 from the money
── PAYOUTS ───────────────────────────────  [Projected | Locked]
  full ladder via F3 (place · % · $), min-cash marked, next-jump line
── STANDINGS ─────────────────────────────  [sort: chips ▾]
  shared <Standings> (chips · BBs · table link · bullets · X identity · "you")
── RECENT BUSTS ──────────────────────────
  tournamentLive.feed → "@x busted 23rd · 47 left"
Open full tournament page ↗ (/tournament/{id}, new tab)
```

Reuse the **shared** `Standings` and `PayoutLadder` components (§8). Acceptance: tab only on MTT tables, indices correct, scrolls, both modes.

## 8. Detail page — `StructureSheet` + `PayoutLadder` (shared)

Extract shared, prop-driven components used by **both** `TournamentDetail.tsx` and the Tournament tab (§7).

- **`app/components/Tournament/StructureSheet.tsx`:** collapsible card; inserted in `TournamentDetail` before the Host panel (~line 416). Header `{TEMPLATE} · {durationMin}-min levels · start {startingStack} ({startingBigBlinds} BB)`. Table `Level | Blinds | Ante | Duration` from `getStructure(blind_structure)`; **highlight current level** (live `clock.levelNumber` / `blindLevel` prop); **mark late-reg-close level** (`late_reg_levels`) with `◀ late reg closes (~{bbAtLateRegClose} BB)`; trailing `BLINDS_KEEP_RISING_NOTE`. Default collapsed on mobile / expanded on desktop. `tabular-nums`.
- **`app/components/Tournament/PayoutLadder.tsx`:** card above `Standings` in `TournamentDetail`. Rows place → `%` + `${formatUsdc(amount)}` from `calculatePayouts(registered_count, prize_pool_usdc)`; collapse multi-position tiers as `7–9 · 4% · $234 ea`; mark min-cash; header ITM line `Top {placesPaid} paid · ~{round(placesPaid/registeredCount*100)}% of field`; `Projected` badge while registration, locked once running/completed. For completed events, per-finisher actuals still show in `Standings`; the ladder shows the structure. Free Play: render notional/no-USDC.

## Build order & QA

**Phase 1 (logic, no visuals):** (1) `blindStructures.ts` + tests · (2) `payouts.ts` + tests · (3) F1 state slice + WS cases + `useTournamentLive` + `useLevelCountdown` (verify the store fills from a live/seeded clock before touching any surface).

**Phase 2 (surfaces, `frontend-design` + `impeccable`, light+dark, mobile+desktop):** (4) Watermark · (5) Banner countdown · (6) Result/table-move overlays · (7) Settings Tournament tab · (8) `StructureSheet` + `PayoutLadder` (then wire into the tab).

**Per-component done = ** light + dark verified · portrait + landscape · loading/empty/stale/reconnect states · reduced-motion · never color-only · `npm run lint` + `npm run build` clean · Storybook story for each new presentational component.

**Known caveats to honor:** `registered_count` is a proxy for total entries (entries-vs-uniques is a flagged backend ask); the leaderboard doesn't yet return X identity (avatars fall back to blockie/initials — already handled by `PlayerAvatar`); a backend `bullet=1` hardcode may make bullet counts unreliable (display defensively); `getTournamentClock` 404s pre-start.
