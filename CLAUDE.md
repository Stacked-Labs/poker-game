# Stacked Poker — Claude Instructions

Onchain poker app. **Next.js 15 (App Router)** · **React 18** · **Chakra UI v2.8** · **Zustand** · **thirdweb v5** · **SIWE auth** · **Base / USDC** · WebSockets for live game state.

Primary user is a crypto-native player; we also onboard traditional poker players. Onchain settlement is the differentiator.

For full product context: `PRODUCT.md`. For our visual system: `DESIGN.md`. Both live at the repo root.

---

## Working principles

How to approach any task here — bias toward caution over speed. For trivial changes, use judgment. (These are guidelines; the hard gate is *Build & quality* below + CI.)

**Think before coding.** State your assumptions. If the request is ambiguous, ask instead of guessing — name what's unclear. Forks worth a question here: which surface (`/table/[id]` is strict *product*; the lobby and marketing get *brand* room), which color mode, or whether a flow touches USDC/auth. If a simpler approach exists, say so before building the complex one.

**Simplicity first.** Ship the minimum that solves the task — no speculative props, abstractions, or "configurability" nobody asked for. Reach for an existing theme token, Chakra component, or hook before adding anything, and never a new dependency for what Chakra/thirdweb/Zustand already do. If 200 lines could be 50, rewrite it.

**Surgical changes.** Every changed line should trace to the request. Don't reformat, rename, or "improve" adjacent components, and never edit a shared `theme.ts` token to fix one component (see the CHAKRA rule below). Match the surrounding style even if you'd do it differently. Remove only the imports/vars your change orphaned; if you spot unrelated dead code or a wrong token, mention it — don't fix it silently.

**Verify, don't assert.** "Done" is a checkable outcome, not a vibe — meet the bar in *Build & quality* (build passes, lint clean, works in light *and* dark, tested in a browser). A passing type-check doesn't prove a feature works. Fixing a bug? Reproduce it first, then confirm the repro is gone.

---

## Design Context (summary — full version in PRODUCT.md)

**Register:** `brand` (per-task overrides allowed; the table itself leans `product`).

**Audience:** crypto-native poker players, mobile-heavy, USDC-on-Base fluent. Secondary: traditional players being onboarded.

**Personality:** playful, smooth, degen. Cozy not corporate. **A Friday-night penthouse at 3am**, not a Vegas casino floor or a fintech dashboard.

**Design principles:**
1. **Wallet-native, not bank-native** — onchain settlement is a feature; never simulate incumbent room patterns.
2. **Penthouse, not casino floor** — warm dark, intimate, lived-in.
3. **At the table, pixels work. In the lobby, pixels play.** — strict product discipline at `/table/[id]`; brand permission on `/`, `/leaderboard`, marketing.
4. **Talk to players, not converts** — crypto fluency assumed; no jargon-defining, no "Welcome to the future of…".

**Anti-references — do NOT look like:** generic crypto dashboards (Uniswap-clone), corporate poker rooms (PokerStars/WSOP), Web3 hero-page slop (gradient meshes, glassmorphism), AI-generated UI (lavender gradients, "✨", repeating card grids), Chuck-E-Cheese degen (neon-for-neon's-sake).

**Light and dark are both first-class.** Never bias toward dark-by-default. The brand mood (warm, intimate) applies to both modes. Test every UI change in both before declaring done.

**Accessibility:** WCAG 2.1 AA, mobile-first, respect `prefers-reduced-motion`, never color-only state, color-blind-safe suit indicators.

When writing copy or generating UI, read `PRODUCT.md` first. When picking colors, type, or components, read `DESIGN.md` first.

---

## How to work in this repo

### 1. Route through skills first

`.claude/skills/poker-game-router/SKILL.md` is the dispatcher. At the start of most UI/feature tasks, decide which of these skills applies and follow it:

- **chakra-design-system** — Chakra v2 patterns, theme tokens, variants, a11y
- **react-architecture** — Component structure, hooks, Server vs Client
- **web3-thirdweb-siwe** — Wallet connection, SIWE auth, Base/USDC
- **base-miniapp-developer** — MiniKit / Coinbase Wallet Mini App work
- **storybook-testing** — Storybook v9 stories
- **frontend-design** — Building distinctive UI from scratch (auto-activates)
- **frontend-quality-bar** — "Ready to merge" gate (a11y, perf, polish)
- **poker-game-router** — When unsure which to use, start here

Don't reimplement what a skill already documents.

### 2. UI work — read `.claude/CHAKRA.md`

Chakra v2 conventions specific to this repo. The most important rule:

> **Never modify a shared semantic token in `theme.ts` to change one component.** Use `_dark={{}}` or `useColorModeValue()` directly on the component, or add a new token if the pattern repeats.

### 3. Design polish — Impeccable skill

If installed (`.claude/skills/impeccable/`), use these for tasteful adjustments:
- `/critique <file>` — find anti-patterns
- `/polish <file>` — apply tasteful fixes
- `/audit <dir>` — sweep for slop
- `/typeset <file>` — type/spacing pass
- `/animate <file>` — motion pass

Read `PRODUCT.md` and `DESIGN.md` before generating new visuals — they encode our voice and tokens.

---

## Stack landmarks

- `app/theme.ts` — Chakra theme (brand colors, semantic tokens, component variants)
- `app/contexts/` — `AuthContext`, `WebSocketProvider`, `AppStoreProvider`
- `app/hooks/useWalletAuth.ts` — SIWE flow
- `app/hooks/server_actions.ts` — server-side auth verification
- `app/thirdwebclient.ts` — thirdweb client, chain config, USDC addresses (Base + Base Sepolia)
- `app/stores/` — Zustand stores
- `app/lib/` — poker hand evaluation, `takeSeat` logic
- `app/components/` — feature-organized components (HomePage, Felt, NavBar, CreateGame, …)
- `app/components/ExternalLink.tsx` — shared external-link recipe (use for all outbound URLs)
- `app/components/PlayerNameLink.tsx` — in-app handle/identity link (X handles, etc.)
- `app/components/SocialIconButton.tsx` — iconified social CTA chip (Discord/Telegram/X)
- `app/table/[id]/` — live poker table (the game surface)
- `app/contracts/` — poker table ABI

---

## Build & quality

```
npm run dev            # local dev
npm run lint           # eslint --fix
npm run build          # production build (run before merging)
npm run format         # prettier
npm test               # Vitest — unit + component tests (run before merging; CI runs this)
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright — full suite (incl. crypto flows)
npm run test:e2e:free  # Playwright — free/non-crypto only, fast iteration
npm run storybook      # component workbench (port 6006)
```

Before declaring UI work done: build passes, lint clean, feature tested in a browser (use Claude-in-Chrome MCP if available) in **both light and dark mode**. Type-checks alone don't validate features. Perf-sensitive work: `npm run lighthouse:desktop` / `:mobile`.

### Vitest unit & component tests

`npm test` (config: `vitest.config.ts`) runs two flavours, colocated with the code as `*.test.ts(x)`:

- **Pure-logic** — `*.test.ts`, run on the `node` environment. Default to this: extract timing/event-ordering or branching decisions into a pure function and table-test it (see `app/lib/walletSession.ts` + `app/lib/wsReconnect.ts` and their tests). This is the cheap, high-signal layer and the right home for "this class of bug must never come back".
- **Component** — `*.test.tsx`, run on `jsdom` via `@vitejs/plugin-react` + React Testing Library, with jest-dom matchers from `vitest.setup.ts`. Use only when you must assert what actually renders (e.g. `app/components/Footer/index.test.tsx` proves the action footer's visibility gate). Mock heavy children/contexts to keep the test on the unit under test, not its whole dependency tree.

Storybook (`*.stories.tsx`) is for visual review and is separate from Vitest — see the `storybook-testing` skill.

---

## Conventions that bite if you forget

- **Chakra v2, not v3.** Don't use `createSystem` / `defineConfig` / `data-theme`.
- **Server vs Client.** Server Components by default; add `'use client'` only for interactivity, hooks, or browser APIs — the most-violated App Router boundary.
- **Toasts** go through `useToastHelper`, not `useToast` directly.
- **Auth state** comes from `AuthContext` — don't read wallet state directly when you need authenticated identity.
- **Game state** flows through the WebSocket provider + Zustand stores. Do not fetch game state via REST.
- **Spectator trust boundary.** WebSocket game state is owner-scoped — never surface opponents' hole cards or owner-gated ledger/pending data to an unauthenticated or spectator client. Confirm `AuthContext` before any game mutation.
- **USDC** is per-chain — read from `app/thirdwebclient.ts`, never hardcode.
- **Chips vs USDC.** Buy-ins are chips; `CHIPS_PER_USDC = 100` (`app/components/TakeSeatModal.tsx`). For external (EOA) wallets, check Base native-gas sufficiency before a deposit/seat tx; in-app sponsored wallets skip this.
- **Analytics never throws.** Go through `app/lib/analytics.ts` (safe no-op until `initAnalytics()`); tracking must never break gameplay.
- **CSP whitelist.** Vendor domains (thirdweb / WalletConnect / Coinbase / PostHog) are allowed in `next.config.js`; update it when adding an SDK or embed, or requests get blocked.
- **Comments**: default to none. Identifiers should carry meaning. Only comment hidden constraints.
- **No backwards-compat shims** for code we own. Delete dead code; don't leave `// removed` markers.

---

## What "good" looks like here

A change that:
1. Fits an existing skill's guidance (or makes one update if guidance is wrong)
2. Reuses theme tokens / variants instead of inline styles
3. Works in light *and* dark mode
4. Has a focus state, mobile layout, loading/empty/error states
5. Doesn't introduce a new dependency to do what Chakra/thirdweb/Zustand already do
6. Reads in 30 seconds without a comment to explain it
