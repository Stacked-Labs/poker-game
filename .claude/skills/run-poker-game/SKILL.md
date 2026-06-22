---
name: run-poker-game
description: >
  Launch and drive the Stacked poker-game frontend to see UI changes rendered — run, start, build,
  serve, or screenshot its poker mechanics & UX-flow components (the felt/community cards, card faces
  & backs, the bet/raise input, take-seat & buy-in modal, seat status, game-status banner, ante chip,
  session points) in a headless browser. Use when asked to run/launch/preview/screenshot poker-game or
  a component, or to confirm a UI change renders in light AND dark mode without a human opening a window.
  Drives Storybook (:6006) via a Playwright screenshot driver — no chromium-cli, no live backend needed.
---

# Run poker-game (Storybook component driver)

poker-game is a **Next.js 15 + Chakra UI v2 + thirdweb** onchain-poker frontend. The real app
(`next dev`) needs a Go backend, Redis/Postgres, SIWE auth and live WebSockets to show anything
interesting — too heavy to stand up just to look at a component. So this skill drives the app's
**Storybook** workbench instead: every mechanics/UX-flow component has stories, and a small
**Playwright driver** screenshots them in both color modes.

> **Paths below are relative to `poker-game/`** (the repo root). The driver lives at
> `.claude/skills/run-poker-game/driver.mjs`. Run every command from `poker-game/`.

This box is **macOS** (Apple Silicon), not a Linux container — there is **no `xvfb`, no `apt-get`,
and no `chromium-cli`**. The driver uses Playwright's bundled chromium (Playwright is already a
devDependency), which runs headless natively on macOS.

## Prerequisites

- Node 20+ (verified on v23.10). Deps installed (`node_modules/` present). If not: `npm install`.
- Playwright's chromium binary. Already present here (`~/Library/Caches/ms-playwright/chromium-*`).
  If missing: `npx playwright install chromium`.

No other system packages. The driver imports `@playwright/test` (a dep), so it resolves
`node_modules` by walking up from its own location regardless of cwd.

## Run (agent path) — START HERE

**1. Launch Storybook in the background** (nextjs-vite; first boot ~20–40s):

```bash
node_modules/.bin/storybook dev -p 6006 --no-open --ci > /tmp/storybook.log 2>&1 &
```

**2. Wait until it's actually up** (poll the story index; curl's own retry handles the wait —
avoids a foreground `sleep`):

```bash
curl -sf --retry 40 --retry-all-errors --retry-connrefused --retry-delay 3 --retry-max-time 180 \
  http://localhost:6006/index.json -o /tmp/sb-index.json && echo "STORYBOOK UP"
```

`--retry-all-errors` matters: during boot the server may briefly answer `/index.json` with a
transient non-2xx, and plain `--retry-connrefused` won't retry that (only connection-refused).

**3. Drive it.** The driver has three commands:

```bash
# list story ids (optionally filter by substring of id/title)
node .claude/skills/run-poker-game/driver.mjs list felt

# screenshot ONE story, in a chosen color mode
node .claude/skills/run-poker-game/driver.mjs shot felt-communitycards--full-board --theme=dark

# screenshot the whole mechanics/UX-flow gallery in BOTH modes (the usual call)
node .claude/skills/run-poker-game/driver.mjs mechanics --theme=both
```

Screenshots land in **`/tmp/poker-game-sb/`** (override with `OUT_DIR=...`), plus an `index.json`
manifest mapping label → story id → file. `mechanics` covers: community cards, the **pot**, the dual board + **run-it-twice** surfaces, ante
chip, card backs, the full card index, the **bet/raise input**, seat-request badge, away/rejoin
footer, seat status chip, the **take-seat / buy-in modal**, taken-seat button, game-status banner,
and the session-points badge — the surfaces a poker-mechanics or UX-flow PR actually touches. (The
set resolves stories by title substring against the live index, so it self-heals as stories are
added or renamed; a missing one just prints `(no story found for …)` and is skipped.)

**4. Look at the result.** Read the PNGs back (e.g. `/tmp/poker-game-sb/take-seat.light.png`).
A real render shows the component; a blank/error means the story id is wrong (use `list`) or
Storybook isn't up. CLAUDE.md treats **light and dark as both first-class** — always check both.

**5. Stop cleanly:**

```bash
pkill -f "storybook dev -p 6006"
```

### Driving a specific component a PR touches

Find its story id, screenshot both modes, look:

```bash
node .claude/skills/run-poker-game/driver.mjs list raiseinput
node .claude/skills/run-poker-game/driver.mjs shot footer-raiseinputbox--landscape-bb --theme=light
node .claude/skills/run-poker-game/driver.mjs shot footer-raiseinputbox--landscape-bb --theme=dark
```

The driver renders the isolated story iframe (`/iframe.html?id=<id>&viewMode=story&globals=theme:<t>`),
so it works for any of the 500+ stories, not just the mechanics set.

## Run (human path)

```bash
npm run storybook   # storybook dev -p 6006, opens a browser to the manager UI
```

Useful on a desktop with a display; useless headless (it just waits with a window you can't see).
The agent path above is the headless-friendly equivalent.

## Gotchas (battle scars from this session)

- **No `chromium-cli` on this box** — the run-skill examples assume it; here it isn't installed.
  The driver uses Playwright's chromium instead. Don't reach for `chromium-cli`.
- **macOS, not Linux** — no `xvfb-run`, no `apt-get`. Playwright chromium is headless natively.
- **Theme is a Storybook global, not a URL hash.** Color mode is set with `&globals=theme:dark`
  (or `theme:light`). `.storybook/preview.tsx` maps that global → the `chakra-ui-dark` class →
  Chakra color mode via a `ColorModeSync` decorator. The driver does this for you (`--theme=`).
- **Identical light/dark screenshots are expected for some components, not a bug.** Felt pieces,
  the landscape raise bar, the away/rejoin footer and the taken-seat button render the same in
  both modes by design (they carry their own palette). The driver writes both files anyway;
  byte-identical pairs just mean that component is theme-invariant.
- **Some components supply their own light surface over a dark canvas.** The TakeSeat/buy-in modal
  is a white card even in "dark" mode — the iframe *canvas* follows the theme, the modal doesn't.
  That's correct product behavior, not a broken screenshot.
- **AnteChip is not under `Felt/`.** Its story title is `Tournament/InTable/AnteChip` — match the
  substring `antechip`, not the folder. (Several "felt" mechanics live under `Tournament/InTable/`.)
- **Stories render via `iframe.html`, not the manager.** Screenshotting `:6006/` would capture the
  Storybook chrome; the driver hits `iframe.html?viewMode=story` to get just the component.
- **First boot is slow and logs nothing useful until ready.** `/tmp/storybook.log` stays quiet
  during the vite build; poll `index.json` (step 2) rather than grepping the log. (Warm reboots are
  fast — ~1s — because vite caches the optimize step.)
- **Don't kill and relaunch in the same breath, then poll.** `pkill … && storybook dev … & && curl`
  races: the poll can hit the dying/booting server and `curl -sf` bails on the transient non-2xx
  (hence `--retry-all-errors` above). When restarting, let the port free first (`lsof -iTCP:6006`
  shows nothing listening) before relaunching, or just reuse the already-running instance.

## Test

```bash
npm test                # Vitest — pure-logic (*.test.ts, node) + component (*.test.tsx, jsdom)
npm run test:e2e:free   # Playwright e2e, free/non-crypto flows
```

`npm test` (`vitest run`) is the fast, headless sanity check and is what CI runs — no app or
backend needed. The e2e suite is different: it drives the **real** app, so it needs `next dev`
**and** the Go poker-server backend up first (`poker-server` on :8080) — see the workspace memory
on local run + e2e. For "does this component render," the Storybook driver above is the fast path;
reach for e2e only for full flows.

## Troubleshooting

- **`index.json 404` / driver says "is Storybook up?"** — Storybook isn't ready. Re-run step 2;
  check `/tmp/storybook.log` for a vite error.
- **`EADDRINUSE :6006`** — an old Storybook is already running. Easiest: just point the driver at it
  (default `SB_URL=http://localhost:6006`), no relaunch needed. If you must restart,
  `pkill -f "storybook dev -p 6006"`, wait for `lsof -iTCP:6006 -sTCP:LISTEN` to show nothing, *then*
  relaunch — relaunching while the port is still held races the poll.
- **Blank screenshot or an error overlay in the PNG** — the story id is wrong. Run
  `driver.mjs list <substr>` to get the exact id. The driver also prints a warning when Storybook's
  own error overlay is detected.
- **Driver can't find `@playwright/test`** — you're not under `poker-game/`. Run it from the repo
  root (or anywhere inside it); it resolves `node_modules` by walking up from `poker-game/`.
