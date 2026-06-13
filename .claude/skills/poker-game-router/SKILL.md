---
name: poker-game-router
description: Route requests for the Stacked Poker Next.js frontend repo to the right repo skill (Chakra UI/theme, thirdweb/SIWE auth, WebSockets/game state, chat/media, poker hand eval, QA/release). Use at the start of most tasks in this repo to decide which skill(s) to apply.
---

# Poker Game Router

Use this skill as a lightweight dispatcher. Keep context small: decide which skill(s) to use, then load only the chosen skill(s) and relevant files.

## Repo landmarks

- App Router entry: `app/layout.tsx`, `app/page.tsx`, `app/providers.tsx`
- Theme system: `app/theme.ts`
- Web3/thirdweb client: `app/thirdwebclient.ts`, `app/components/WalletButton.tsx`
- SIWE auth: `app/hooks/useWalletAuth.ts`, `app/contexts/AuthContext.tsx`, `app/hooks/server_actions.ts`
- WebSocket/game state: `app/contexts/WebSocketProvider.tsx`, `app/contexts/AppStoreProvider.tsx`, `app/hooks/server_actions.ts`
- Chat/media: `app/components/NavBar/Chat/`, `app/hooks/useTenor.ts`, `app/api/tenor/route.ts`
- Poker hand eval: `app/lib/poker/pokerHandEval.ts`
- Build hygiene: `package.json` scripts, `.eslintrc.json`, `.prettierrc`, `.husky/pre-commit`

## Skill selection (decision tree)

Pick the minimal set; multiple can apply.

### UI, layout, theme, Chakra components

Use `chakra-design-system` when:
- Editing `app/theme.ts` or Chakra tokens/variants
- Adding/modifying UI components under `app/components/`
- Fixing responsive layout, spacing, typography, color, dark/light mode
- Improving a11y for Chakra components (focus, aria, keyboard)

### Web3, wallets, thirdweb, embedded wallet, SIWE

Use `web3-thirdweb-siwe` when:
- Touching wallet connect flows, account state, auth cookies/session
- Working with `thirdweb/react` hooks (`useActiveAccount`, `useActiveWallet`, etc)
- Debugging auth loops, signature issues, disconnect behavior, or CSP issues
- Updating `next.config.js` CSP headers related to thirdweb embedded wallet
- Sending on-chain transactions (hooks use `useSendAndConfirmTransaction` directly; the shared `useStackedTransaction` wrapper was tried and pulled — see `web3-thirdweb-siwe`)
- Adding onramp / top-up / "buy USDC" UI (BuyWidget, TopUpModal/TopUpButton)
- ERC-1271 / smart account signature verification questions

### Base App / Mini App / Base Account

Use `base-miniapp-developer` when:
- Making Stacked run inside the Coinbase **Base App** (standard web app + Base Account, thirdweb-primary)
- One-tap "log in with your Base wallet" (bridge the Base Account into thirdweb + SIWE)
- `farcaster.json` / `fc:miniapp` / Base.dev registration, in-webview links/sharing/deep-links, Base notifications
- NOTE: the Base App dropped Farcaster Mini Apps (Apr 9 2026) — do NOT use MiniKit/OnchainKit or assume `sdk.actions.*` work there

### Storybook / component visualization

Use `storybook-testing` when:
- Writing or updating `.stories.tsx` files
- Doing a visual review pass of new components
- Needing to see a component in multiple states without a running backend
- Checking how a component looks in dark vs light mode

### React architecture, hooks, state, TypeScript

Use `react-architecture` when:
- Deciding Server Component vs Client Component
- Designing custom hooks, state management, or context structure
- TypeScript typing questions (props, events, refs, generics)
- Form handling patterns, error boundaries, data fetching strategy
- File/folder organization, component composition patterns

### Frontend design / visual identity

Use `frontend-design` when:
- Building a new page, modal, or standalone UI piece from scratch
- The user asks for UI that should feel “premium”, “polished”, or “distinctive”
- Creating prototypes, landing pages, or standalone artifacts (inside or outside the repo)
- Adding motion/animation to components (see `references/motion-patterns.md`)
- When the task is about the overall visual direction, not just wiring up Chakra tokens

Note: for in-repo work, `frontend-design` defers to the brand identity system and works alongside `chakra-design-system`. For standalone/external work, it operates with full creative freedom.

### “Quality bar” / production readiness

Use `frontend-quality-bar` when:
- Doing UI polish passes, UX consistency, performance, accessibility
- Adding new components/features that should meet a consistent standard
- Preparing a PR/merge, or doing broad refactors

## Use project rules and MCP

- Read `.cursor/rules/frontend-guidelines.mdc` for the repo’s frontend expectations.
- Read `.cursor/rules/thirdweb.mdc` for thirdweb rules and documentation pointers.
- See `.cursor/mcp.json` for MCP servers that can fetch thirdweb/Chakra documentation on demand.

