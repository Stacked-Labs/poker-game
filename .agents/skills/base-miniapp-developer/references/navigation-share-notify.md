# Navigation, sharing, deep-links & notifications (Base App)

Standard-web-app model: the Farcaster `sdk.actions.*` are inert in the Base App. Use plain web primitives.

## External links
- **`window.open(url)`** is the correct primitive inside the Base App in-app browser (the deprecation table maps `openUrl`/`openMiniApp` → `window.open`).
- Route ALL outbound links through one chokepoint: `app/components/ExternalLink.tsx`. Today these bypass it and are webview-hostile — audit/fix:
  - `app/components/LobbyBanner.tsx:52` (copies `window.location.href`)
  - `app/components/.../ShareRankCard.tsx` (`window.open` to X/Telegram), `app/hooks/useConnectX.ts:34`, `app/tournament/[id]/page.tsx:334`
- **Kill hard reloads** — they tear down the in-app session and re-trigger splash. Convert to Next.js client navigation / state refresh:
  - `app/contexts/WebSocketProvider.tsx:869` (`window.location.href` on tournament table move)
  - `app/components/.../ConnectionLostToast.tsx:18`, `WalletChangeReloader.tsx:34` (`window.location.reload()`)

## Share a table + join fast (the core "chat and join games fast" goal)
1. **Per-table OpenGraph — ENRICH, don't create.** `generateMetadata` **already exists** at `app/table/[id]/page.tsx:10`, but it's **static/generic** (same title + `table_preview.png` for every table, reads only `params`). Enrich it to fetch live per-table fields (name, stakes, Free-Play-vs-USDC tag, host basename, seats open) and render a **per-table OG image** (Next `ImageResponse`, 3:2 PNG, ≤10MB). Also emit the `fc:miniapp` embed so the link unfurls as a **tappable launch card** in Base App chat — and sharing the URL is what **auto-indexes us in Base search** (~10 min, no review). This is the single highest-leverage build.
2. **`?join=1` deep-link.** `TablePage` Props is only `{ params }` today — it reads no `searchParams`. Add a `searchParams` read so `/table/[id]?join=1` auto-opens `TakeSeatModal` on arrival. ⚠️ **This collides with the rule that every table needs Host approval.** Resolve explicitly: **Free Play tables auto-seat** (no money → cold traffic gets instant play); **real-money** links = "one tap = request to sit + the Host gets an approval push", plus a Host-side "auto-approve from my invite link". The join intent must **survive the SIWE round-trip** (stash intent → replay after auth).
3. Build invite/share UI around the per-table URL via `window.open` / the Web Share API (the OS share sheet). **Note: there is NO programmatic compose-to-feed on Track A** — `composeCast` is inert in the Base App. "Share to Base" = native share sheet + the embed-bearing URL.

## Notifications ("your table is starting")
- Use the **Base Dashboard Notifications API**, keyed by **wallet address** (we already have it from SIWE):
  - `POST https://dashboard.base.org/api/v1/notifications/send`
  - Headers: `x-api-key: <key>`, `Content-Type: application/json`
  - Body: `{ app_url, wallet_addresses: [...≤1000], title (≤30), message (≤200), target_path: "/table/<id>" }`
  - Rate limit ~20 req/min/IP. Opt-ins: `GET https://dashboard.base.org/api/v1/notifications/app/users?notification_enabled=true`.
  - **Best triggers are behavioral, not just "tournament starting":** "your turn to act" (highest-retention poker push), "2 seats left" (FOMO), "a friend joined a table", "you lost your #1 spot", "your table filled" (Host). See `references/growth-loops.md`.
- **Reconcile with the in-flight tournament-reminders work** (`[[project_tournament_reminders]]`): for Base App users the push channel must be this API, NOT Farcaster `addMiniApp` FID tokens (a dead channel here). The existing web-push (`sw.js`) remains a separate channel for plain-web users.

## Profiles
`viewProfile` → deeplink `https://base.app/profile/<WALLET_ADDRESS>` (open with `window.open`).

## Sources
- https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app
- https://docs.base.org/apps/technical-guides/base-notifications
- https://docs.base.org/mini-apps/core-concepts/notifications
