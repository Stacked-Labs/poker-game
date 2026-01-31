# Mini App Readiness Review (Stacked Poker)

Date: 2026-01-30

## Grand tree view (selected)

```
.
├─ app/
│  ├─ api/
│  ├─ components/
│  ├─ contexts/
│  ├─ hooks/
│  ├─ lib/
│  ├─ stores/
│  ├─ table/[id]/
│  ├─ utils/
│  └─ well-known/route.ts
├─ public/
├─ docs/
├─ next.config.js
├─ package.json
├─ app/layout.tsx
├─ app/providers.tsx
└─ app/thirdwebclient.ts
```

## What’s already in place (good signals)

- **Mini App SDK ready hook**: `app/providers.tsx` calls `sdk.actions.ready()` on mount, so the app signals readiness in a Mini App context.
- **Manifest endpoint exists**: `public/.well-known/farcaster.json` is served statically.
- **Mini App meta tag**: `app/layout.tsx` sets an `fc:miniapp` meta value via `generateMetadata()` (now aligned to production URLs).
- **Thirdweb v5 integration**: `thirdwebclient.ts` defines Base as the chain, `inAppWallet()` is configured, and `WalletButton` uses `ConnectButton` with explicit wallets.
- **CSP already allows thirdweb embedded wallet**: `next.config.js` includes `https://embedded-wallet.thirdweb.com` in `frame-src`.

## Decisions captured

- Keep **all current wallet/login options** (thirdweb + in-app wallet + existing wallets).
- **Ignore Coinbase Paymaster** for now.
- **Do not build Farcaster-specific social features**; focus on Base Mini App requirements only.
- **Reuse the full site layout** (no Mini App-only UI mode).
- Serve the manifest from `public/.well-known/farcaster.json`.

## Gaps & risks for Mini App compatibility

### 1) Manifest correctness and routing
- Manifest is served from `public/.well-known/farcaster.json`.
- The manifest still has **placeholders**: `accountAssociation` (header/payload/signature) and `baseBuilder.ownerAddress`.
- The manifest now includes **both Base mainnet + Base Sepolia** in `requiredChains`.

### 2) Mini App metadata alignment
- The `fc:miniapp` metadata in `app/layout.tsx` also uses placeholders (ngrok + pexels). The metadata and manifest should **match the same domain, images, and branding**.

### 3) External navigation in a WebView
- The app uses many external links (Discord, X, docs, Warpcast) via normal anchors.
- You confirmed external navigation is **fine** and should leave the Mini App, so the current anchor links are acceptable.
- `app/components/LobbyBanner.tsx` uses `window.location.href` for the share URL (fine for copying), but `app/components/Toasts/ConnectionLostToast.tsx` uses `window.location.reload()`, which may be undesirable in Mini Apps.

### 4) thirdweb wallet UX in Mini App
- You plan to **keep all wallet options**, which is fine, but be aware some options may not be usable inside the Coinbase Wallet WebView.
- `inAppWallet()` is configured, which is good for embedded/webview flows.
- Ensure you **don’t rely on injected wallets** (no `window.ethereum` usage found, good).

### 5) Missing Mini App-specific UX handling
- No use of Mini App navigation helpers or safe areas (e.g., `SafeArea`) for the wallet UI environment.
- No Mini App-specific “open in Coinbase Wallet” fallback if opened in a normal browser.

### 6) Gasless/paymaster flows
- There is no Paymaster config in the current code. You decided to **ignore Coinbase Paymaster** for now.

## Suggested next steps (prioritized)

1) **Finalize the Base Mini App manifest**
   - Replace placeholders in `public/.well-known/farcaster.json` with real `accountAssociation` signatures and your Base builder address.
   - Confirm all image URLs exist and match size constraints.
   - Validate `https://<domain>/.well-known/farcaster.json` publicly.

2) **Align Mini App metadata**
   - Update `app/layout.tsx` `fc:miniapp` meta to match the manifest domain and assets.

3) **External links (no Mini App interception)**
   - Keep external anchors as-is; ensure `target="_blank"` and `rel="noopener noreferrer"` where appropriate.
   - Only revisit if Coinbase Wallet starts blocking external navigation.

4) **Mini App wallet experience**
   - Keep the full wallet list, but confirm your `ConnectButton` works inside Coinbase Wallet WebView; if needed, use `ConnectEmbed` for a more compact experience.
   - Optional: Add messaging in the UI when a wallet option isn’t available in the WebView.

5) **Guard Mini App SDK usage**
   - Wrap `sdk.actions.ready()` in a try/catch or guard to avoid errors when running outside the Mini App environment.

6) **Optional: add Mini App UX helpers**
   - Use safe-area padding when inside the wallet WebView.
   - Provide a clear fallback CTA when not in Coinbase Wallet (open in wallet).

## Quick win checklist

- [ ] Replace `accountAssociation` and `baseBuilder.ownerAddress`, then re-sign
- [ ] Verify `/.well-known/farcaster.json` resolves in production
- [ ] Update `fc:miniapp` meta to match manifest
- [ ] Confirm external links behave as desired in Coinbase Wallet
- [ ] Keep full wallet list but verify WebView compatibility
- [ ] Add Mini App ready guard + fallback

## Manifest status (current)

`public/.well-known/farcaster.json` looks correct structurally, but the following fields still require real values:

- `accountAssociation.header` → **REPLACE_ME**
- `accountAssociation.payload` → **REPLACE_ME**
- `accountAssociation.signature` → **REPLACE_ME**
- `baseBuilder.ownerAddress` → **REPLACE_ME**

Other fields appear set to production values and are consistent with the homepage copy/branding:
- `name`: Stacked Poker
- `description`: “The easiest way to play poker with friends—free or with crypto. No downloads, no sign-up.”
- `tagline`: “Play in seconds. Just send the link.”
- `homeUrl`: https://stackedpoker.io/
- `iconUrl`: https://stackedpoker.io/IconMain.png
- `splashImageUrl`: https://stackedpoker.io/previews/home_preview.png
- `heroImageUrl`: https://stackedpoker.io/previews/table_preview.png
- `requiredChains`: Base mainnet + Base Sepolia

**Image constraints reminder (per Base Mini App spec):**
- `iconUrl`: 1024×1024 PNG (no alpha)
- `splashImageUrl`: 200×200
- `screenshotUrls`: up to 3 images, 1284×2778 portrait

## Open questions (optional)

1) Do you want the **Mini App manifest** served via `public/.well-known/farcaster.json` instead of the current rewrite approach?
2) Should we add a **WebView-only banner** explaining that some wallet options may not be available inside Coinbase Wallet?
