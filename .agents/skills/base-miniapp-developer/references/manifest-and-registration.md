# Registration (Base.dev) + the farcaster.json manifest

## Base App = Base.dev registration (Track A)
The Base App discovers/lists/previews apps via **Base.dev** (dashboard.base.org), not the Farcaster manifest. Project metadata: name, icon, tagline, description, screenshots, category (`games`), primary URL (`stackedpoker.io`), builder code.
- `app/layout.tsx` emits `base:app_id` (`697e0df32aafa0bc9ad8a2b7`) → this maps to the Base.dev project. **It's duplicated** — once in `metadata.other` and again as a raw `<meta>` at ~`layout.tsx:91`. Remove the duplicate.
- Notifications + preview both key off the registered project + its API key.
- **Builder Code — LAUNCH scope, not optional.** A Builder Code is an **ERC-721 NFT + code string** (e.g. `abc123`) you **claim on Base.dev** (Settings → Builder Code). You attribute onchain activity to it by appending the **ERC-8021 data-suffix** to transaction calldata — a *separate* standard from the code itself (don't conflate the two), no contract redeploy. ⚠️ **Integration nuance:** Base documents the app-dev path via **wagmi/viem**; we're **thirdweb v5** (no wagmi for txns), so we append the ERC-8021 suffix to the tx `data` field ourselves on the existing deposit/join/settle calls. Payoff (docs.base.org/apps/builder-codes): **Rewards** (attribution → Builder Rewards as the program expands), **Analytics** in Base.dev, and **Visibility** (App Leaderboards, Base App store, ecosystem spotlights) — a free discovery/economics lever that directly helps cold-start. (Builder *Rewards* payout eligibility — Basename / Builder Score / verification — is a separate program; the Builder *Code* itself only needs Base.dev registration. Verify current reward terms at claim time.)

## The farcaster.json manifest: which parts the Base App still uses
`public/.well-known/farcaster.json` is fully populated and signed (FID 512700 / `stackedpoker.io`; `baseBuilder.ownerAddress`; `miniapp` block: games category, `requiredChains` `eip155:8453`+`84532`, `requiredCapabilities ['actions.ready']`, icon/splash/hero/screenshot URLs). It is **not** purely a Farcaster artifact — split it:

- **Still relevant to the Base App (Track A):** the `accountAssociation` proves domain ownership for **Base.dev**, and the **`fc:miniapp` embed metadata on `homeUrl`** is what the Base App reads to render a shared link as a tappable **launch card** and to **index us in Base search**. Base *requires* `homeUrl` to carry embed metadata. Per-table embeds are **Track A growth**, not Farcaster-only.
- **Inert in the Base App runtime:** the Farcaster launch button, splash, `requiredCapabilities`, and FID context.

Fixes (do before Base.dev registration / launch):
- **LAUNCH BLOCKER:** the `accountAssociation.signature` looks like a broken/zero-padded placeholder — it will fail Base.dev domain-ownership validation. **Re-generate it via Base.dev account-association** before registration or notifications will work.
- `baseBuilder.ownerAddress` (singular): **verify against the live Base.dev schema before launch** — current tooling uses `allowedAddresses` (array).
- `requiredCapabilities: ['actions.ready']` is a weak gate (`ready` deprecated) — trim (Farcaster-only anyway).

## Sources
- https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app
- https://dashboard.base.org/register/customize
- https://miniapps.farcaster.xyz/docs/specification
