# Track B — Farcaster / Warpcast (DORMANT)

Only relevant if we decide to also ship to Warpcast/Farcaster. The Farcaster Mini App SDK still works **there** (it just no longer works inside the Base App). Keep this surface **isolated behind a real Farcaster-host check** so it can never run inside the Base App and break.

## SDK
- `@farcaster/miniapp-sdk` — repo pins `^0.2.2` (installed 0.2.3); current latest is **0.3.0** (Apr 2026). Bump after a changelog check if Track B is revived.
- `sdk.actions.ready()` — REQUIRED in a Farcaster host to dismiss the splash ("if you don't call ready(), users see an infinite loading screen"). Call it **after** first meaningful content mounts, `await`ed + try/caught, and pass `{ disableNativeGestures: true }` (the drag-heavy table + react-three canvas collide with host gestures). Today it's called unconditionally on mount in `app/providers.tsx:26` — guard it behind a Farcaster-host check.
- Host detection: `sdk.isInMiniApp()` (1s race — host must resolve context fast). This is `app/hooks/useIsMiniApp.ts`.
- Wallet in a Farcaster host: `sdk.wallet.getEthereumProvider()` → bridge via thirdweb `EIP1193.fromProvider` (same bridge as Track A, different provider source). `@farcaster/miniapp-wagmi-connector` (latest 2.0.0) is the wagmi route — not used here since we're thirdweb-primary.
- Social actions available in a Farcaster host (NOT in Base App): `sdk.actions.composeCast({ text, embeds })` for share/invite, `sdk.actions.openUrl`, `sdk.actions.viewProfile`, `sdk.actions.addMiniApp` (+ notification tokens via webhook).

## Isolation rule
Every `@farcaster/miniapp-sdk` import must sit behind a genuine Farcaster-host check, never run on the standalone web build or in the Base App. Don't let `ready()`/`isInMiniApp()` gate core UX globally (today `useIsMiniApp` suppresses onramp/paymaster — that logic must move to a Base-App-aware check; see `base-app-integration.md`).

## Sources
- https://miniapps.farcaster.xyz/docs/getting-started
- https://miniapps.farcaster.xyz/docs/guides/wallets
- https://registry.npmjs.org/@farcaster/miniapp-sdk
