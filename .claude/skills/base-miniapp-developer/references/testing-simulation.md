# Testing & simulation (Base App)

Three layers, increasing fidelity. Build the first two; finish on real hardware.

## 1. In-repo dev shell — a VISUAL chrome/safe-area harness (NOT a wallet sim)
`app/dev/base-shell/page.tsx` frames the app inside a mock Base App device frame (status bar + ~96px app header + home indicator) at a phone viewport. **Scope honestly:**
- It is a **visual** harness for spotting double-header / safe-area collisions and reviewing layout in Base App chrome. It does **NOT** inject a Base Account EIP-1193 provider and does **NOT** exercise the `EIP1193.fromProvider` bridge or `wallet_sendCalls`. (Cross-origin provider injection from the parent into a dev/prod iframe is fundamentally impossible.)
- It optionally appends `?e2e_pk=` to drive the **existing** `E2EAutoConnect` (`createWalletAdapter` + `privateKeyToAccount`) path — a *different* path from the real Base bridge.
- **Gating is REQUIRED:** the route is behind `NEXT_PUBLIC_ENABLE_DEV_TOOLS` (NOT `NODE_ENV` — `.env.local` forces `NODE_ENV=production` even under `next dev`). `E2EAutoConnect` is likewise gated behind `NEXT_PUBLIC_E2E` so `?e2e_pk=` can't auto-connect a wallet in prod.
- Remote targets (`dev`/`prod`) are **CSP-blocked** by the global `frame-src 'self'`; the shell frames the **same-origin local** app by default.

**The real Base-path verification (one-tap login → SIWE → sponsored `wallet_sendCalls`) belongs in a Playwright harness** where `@johanneskares/wallet-mock` injects a mock provider per-page — not in this route.

## 2. Base.dev Preview via tunnel (real-target fidelity)
- The authoritative hosted surface now that the Base App is a standard-web-app host. Consumes a **public https URL** (cannot hit localhost), shows Base-App context + logs, and validates the Base.dev project metadata.
- Tunnel localhost: `cloudflared tunnel --url http://localhost:3000` (`brew install cloudflared`, no account). Gotcha: open the fresh tunnel URL once in a normal browser before pasting it into the preview tool. (`ngrok http 3000` is a fallback.) Add an npm script.
- Needs the **registered Base.dev project** (`base:app_id 697e0df32aafa0bc9ad8a2b7`) + API key.

## 3. On-device final gate (necessary, not optional)
Deploy a preview build (or use the tunnel), open it inside the **real Base App in-app browser**, and drop the link in a Base App DM/chat. **Explicit pass/fail criteria:**
- One-tap login completes with **no social-login prompt** in < ~5s, SIWE succeeds against the smart account.
- A table buy-in settles via `wallet_sendCalls` with **USDC-paymaster gas** (user holds no ETH).
- A shared `/table/<id>` link **unfurls as a per-table launch card** in a Base App DM and taps through to the table.
- A **Base Dashboard notification** arrives after opt-in and deep-links to `target_path`.
- **No double-header / safe-area collision**, no hard-reload splash flash.

The shell/preview can't replicate the real Base App's wallet UX, onramp, or notification opt-in — this gate is the source of truth.

## (Track B only) Farcaster host simulation
If the Warpcast path is revived: Farcaster ships `@farcaster/miniapp-host` (`exposeToIframe({ iframe, sdk, ethProvider, miniAppOrigin })`). Because `@farcaster/miniapp-sdk` talks to its host over Comlink/postMessage, a parent route can frame the app and expose a mock `MiniAppHost` (fake FID/user, `ready`/`openUrl`/`signIn` handlers, `ethProvider` backed by thirdweb, `getChains → ['eip155:8453','eip155:84532']`). The mock host must resolve `context()` within ~1s or `isInMiniApp()` (a 1s race) returns false. Also: Farcaster dev tools at `farcaster.xyz/~/developers/mini-apps/preview|embed|manifest` (behind Developer Mode).

## Sources
- https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app
- https://www.npmjs.com/package/@farcaster/miniapp-host
- https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/
