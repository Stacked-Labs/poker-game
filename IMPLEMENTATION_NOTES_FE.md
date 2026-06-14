# Tournament Rest Breaks — Phase 2 (Frontend) Implementation Notes

Branch: `feat/tournament-rest-breaks`
Worktree: `/Users/kaloyanmitev/StackedPoker/poker-game-restbreaks`
Plan: `/tmp/plan-289-restbreaks.md` §7 (Phase 2 — Frontend & other surfaces)
Backend wire contract: poker-server PR #291 (already shipped).

This is **frontend only**. No backend, no other worktree, not pushed.

---

## Backend wire contract consumed (snake_case, on WS `tournament-clock` AND REST `GET /api/tournaments/{id}/clock`)

- `on_break` (bool)
- `break_remaining_ms` (number, ms)
- `seconds_to_next_break` (number, seconds — the "break coming" countdown)
- `next_break_after_level` (number — level index after which the next break occurs)

Semantics honored: during a break `level_number` stays at N (does not advance until
break exit); the UI shows "Level N+1 next" and does NOT display N+1 blinds until the
break ends. Break countdown is client-side off `break_remaining_ms` using the existing
`receivedAt` tick math.

---

## Per-file summary

### §7.1 Types / contract (done first — everything keys off it)

| File | Change |
|------|--------|
| `app/interfaces.tsx` | `TournamentClock`: added optional `onBreak?`, `breakRemainingMs?`, `secondsToNextBreak?`, `nextBreakAfterLevel?`. Remaining-ms fields so the existing `receivedAt` local-tick math keeps working. |
| `app/hooks/server_actions.ts` | `TournamentClockResponse`: added the four snake_case REST fields (`on_break`, `break_remaining_ms`, `seconds_to_next_break`, `next_break_after_level`). |
| `app/hooks/useTournamentLive.ts` | `mapClock`: maps the new REST fields into `TournamentClock`. This is the **join-time / self-heal** path, so a player joining **mid-break** learns the break from REST (not only WS). |

### §7.2 WS + store

| File | Change |
|------|--------|
| `app/contexts/WebSocketProvider.tsx` | `case 'tournament-clock'`: carries the four break fields into `setTournamentClock`. |
| `app/contexts/AppStoreProvider.tsx` | **No change needed** — `setTournamentClock` already spreads the whole clock object (`clock: action.payload.clock`), and the break fields ride on it. Confirmed per plan §7.2. |

### §7.3 Blind-structure sheet — "BREAK — 5 min" rows

| File | Change |
|------|--------|
| `app/components/PublicGames/blindStructures.ts` | Added the cadence mirror: `breakEveryNLevels(name)` = `round(60 / levelDurationMin)` floored at 1; `breakAfterLevels(name)` = the defined-ladder break positions; `BREAK_DURATION_MIN = 5`. Documented as a mirror of `poker-server/tournament/blind_structures.go`, with a `// assumes uniform level durations; see plan §4.1` note. |
| `app/components/Tournament/StructureSheet.tsx` | Injects a full-width `BreakRow` (`colSpan=3`, `FiCoffee` icon, "Break · 5 min") after each break level, modeled on the existing late-reg merged row. Stable synthetic key `break-after-${level}`. Zebra striping preserved (level rows keep their own `i`-based parity; break rows carry their own neutral wash). New props `onBreak` + `nextBreakAfterLevel` highlight the **live** break row (green wash, "On break · Level N next"). Always draws the full schedule from the local mirror; **prefers the server's `nextBreakAfterLevel`** only to decide which row is the live/imminent one. |
| `app/components/Tournament/TournamentTabPanel.tsx` (StructureSheet render site #2) | Passes `nextBreakAfterLevel={clock?.nextBreakAfterLevel}` and `onBreak={clock?.onBreak}` (in-table live clock). |
| `app/components/Tournament/TournamentDetail.tsx` (StructureSheet render site #1) | Added `onBreak` + `nextBreakAfterLevel` props, threaded into `StructureSheet`. |
| `app/tournament/[id]/page.tsx` | The detail page has no live socket; it already fetches the full clock via `getTournamentClock`. Now also stores `on_break` / `next_break_after_level` from that fetch and passes them to `TournamentDetail`, so the detail-page sheet can highlight a live break. |

The two StructureSheet render sites derive `currentLevel` from different sources
(REST `level_number` on detail vs live `clock.levelNumber` in-table) — verified both
receive the break props.

### §7.4 In-game status banner + surfaces

| File | Change |
|------|--------|
| `app/hooks/useLevelCountdown.ts` | Made break-aware. While `clock.onBreak`, it counts down `breakRemainingMs` (same `receivedAt` anchor) instead of ticking the level to a stuck `0:00`. Added `onBreak` to the returned `LevelCountdown` so consumers switch copy. |
| `app/components/GameStatusBanner.tsx` | Added a `'break'` `BannerMode`. **Precedence** (documented in a comment): settlement states (`settling`/`settlement-recovery`/`settled`/`settlement-failed`) and table `paused`/`pausing` outrank the break; the break outranks the ambient `tournament-clock` and `pending-blinds`. Renders "On break — m:ss · Level N next" (`FiCoffee`, brand.green). In the level **before** a break, when `secondsToNextBreak` marks it imminent (final minute) and the next break follows the current level, the clock banner reads "Break in m:ss" instead of "Blinds up in m:ss". |
| `app/components/Footer/GameConfigWatermark.tsx` | Shows "NLH · ON BREAK" instead of `L{n} · sb/bb` while on break. |
| `app/components/Tournament/TournamentTabPanel.tsx` | The "Level N · sb/bb · m:ss to next" line flips to "On break · m:ss · Level N next" (green) while on break, via `countdown.onBreak`. |

### Phase 2 tests / QA

| File | Change |
|------|--------|
| `app/components/Tournament/StructureSheet.stories.tsx` | Added `RegularWithBreaks` (rows after L3/L6/L9), `HyperWithBreaks` (single break after L12), `RegularLiveBreak` (green live highlight), and **`CadenceMirrorMatchesBackend`** — a Storybook `play` function asserting `breakEveryNLevels` = 12/6/3/2 for Hyper/Turbo/Regular/Deep. If the mirror ever drifts from the backend rule this test fails loudly. |
| `app/components/GameStatusBanner.stories.tsx` | Added `TournamentBreakComing` ("Break in m:ss" in the final minute) and `TournamentOnBreak` ("On break — m:ss · Level 7 next"). |

---

## Quality bar — commands + results

All run from the worktree root.

| Check | Command | Result |
|-------|---------|--------|
| Install | `npm ci` | **PASS** (exit 0) |
| Typecheck | `npx tsc --noEmit` | **PASS** (exit 0, 0 errors) |
| Lint | `npm run lint` | **PASS** (exit 0, 0 errors, 14 warnings — all pre-existing in files this PR did not touch) |
| Build | `npm run build` | **PASS** (exit 0; also runs in the pre-commit hook on every commit — all 4 commits passed it) |
| Storybook build | `npm run storybook:build` | **PASS** (exit 0; new `StructureSheet.stories` + `GameStatusBanner.stories` modules emitted) |
| Story typecheck | `tsc --noEmit` over the two modified story files (temp tsconfig; stories are excluded from the default `tsc`) | **PASS** (exit 0) |
| Cadence arithmetic | Node check of `round(60 / {5,10,20,30})` | **PASS** → Hyper 12, Turbo 6, Regular 3, Deep 2 |

Lint warning note: the project's `tsconfig.json` **excludes** `**/*.stories.tsx` from the
default `tsc --noEmit`, so the story files were typechecked separately via a temp
tsconfig (then removed) to ensure they compile.

### Could NOT run here (and why)

- **Storybook interaction/test runner** (`storybook test` / vitest): the
  `@storybook/addon-vitest` test runner is **not installed** and the task forbids
  adding dependencies. The `CadenceMirrorMatchesBackend` play function is therefore
  not executed by a headless runner in this environment, but: (a) it compiles and
  bundles cleanly via `storybook:build`, (b) it runs in Storybook's interactions panel
  / any CI that has the addon, and (c) the underlying arithmetic is independently
  verified (12/6/3/2 above).
- **`npm run dev` / browser screenshots**: no live backend (`./.env.local` absent —
  the build logs "env file not exists") and no running poker-server, so the live WS /
  REST clock cannot be exercised here. Visual verification is available via the built
  Storybook (`npm run storybook:build` → `storybook-static/`, or `npm run storybook`).

---

## Manual-QA items still needed (per §7 "Phase 2 tests / QA" + §12.D)

Screenshots/checks to attach to the PR (need a running stack or Storybook):

1. **Detail-page structure sheet** with break rows at the correct levels for **Regular**
   (after L3/L6/L9) **and** one other speed (e.g. Hyper after L12). Storybook stories
   `Tournament/Detail/StructureSheet → RegularWithBreaks` / `HyperWithBreaks` cover this.
2. **In-game banner**: "Break in m:ss" pre-break and "On break — m:ss · Level N next"
   during the break. Storybook: `Popups/GameStatusBanner → TournamentBreakComing` /
   `TournamentOnBreak`.
3. **Mid-break join**: a client that joins during a break renders the break from REST
   (`mapClock` path) — verify against a live tournament on a break.
4. **Live break highlight in both StructureSheet render sites** (detail page and in-table
   tab) — they derive `currentLevel` from different sources; confirm the green break-row
   highlight shows in both. Storybook: `RegularLiveBreak`.
5. **Both color modes** (light + dark) for the break row and break banner (repo
   convention: test every UI change in both).

---

## Deviations from the plan

- **Detail-page break state**: §7.3 names the two StructureSheet render sites but the
  detail page (`TournamentDetail`) only had `currentLevel` (REST `level_number`). To make
  the live break-row highlight work there too (a §12.D QA item: "verify the highlight in
  both"), I threaded `onBreak` + `nextBreakAfterLevel` from the existing `/clock` fetch in
  `app/tournament/[id]/page.tsx` down through `TournamentDetail`. This is additive and
  uses data the page already fetched — no new request.
- **`StructureSheet` "prefer server value"**: the plan says "prefer the server's
  `next_break_after_level` over the local recompute." Interpreted as: still draw the full
  static schedule from the mirror (so the whole break schedule is visible), and use the
  server value only to pick **which** drawn break row is the live/imminent one for the
  highlight. Drawing only the single server-reported break would hide the rest of the
  schedule, which contradicts the "static sheet draws breaks before the tournament is
  live" goal.
- **Cadence-mirror test placement**: with no unit-test runner in the repo (empty `test`
  script; only Playwright e2e + Storybook), the cadence-mirror assertion is a Storybook
  `play` function (the repo's interaction-test mechanism) rather than a standalone unit
  test. Arithmetic additionally verified via a one-off Node check.

No other deviations. Player-facing copy follows house convention ("Break", "On break",
"Level N next" — no "rake"/"intermission"); the watermark line stays "NLH · ON BREAK".

---

## Commits (local only, not pushed)

```
ec26614 test(tournament): storybook stories for rest breaks + cadence-mirror guard
144e9e3 feat(tournament): rest-break states in the in-game banner + surfaces
62f2dd1 feat(tournament): draw rest-break rows in the blind structure sheet
a588072 feat(tournament): wire rest-break fields through clock types + WS/REST
```
