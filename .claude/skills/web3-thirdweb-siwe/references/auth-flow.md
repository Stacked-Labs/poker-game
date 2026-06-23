# Auth flow & session ↔ wallet reconciliation (repo-specific)

## Files

- Client hook (SIWE): `app/hooks/useWalletAuth.ts`
- Auth context (the orchestrator): `app/contexts/AuthContext.tsx`
- Pure reconciliation logic: `app/lib/walletSession.ts` (+ tests `app/lib/walletSession.test.ts`, `npm test`)
- Backend calls: `app/hooks/server_actions.ts`
- Connect UI wrapper: `app/components/WalletButton.tsx`
- Wallet-switch reset (table pages): `app/components/WalletChangeReloader.tsx`
- Backend: `poker-server/transport/http/server.go` (`/auth`, `/auth/verify`, `/isAuth`, `/logout`, WS upgrade)

## SIWE sign-in (unchanged basics)

- Auth runs **once** at the provider level (`AuthProvider` → `useWalletAuth`) to avoid duplicate
  prompts from multiple wallet-UI mounts. `authAttemptRef` dedupes per address.
- Sequence: `getAuthPayload(address)` → sign the **message string** (not the JSON payload) →
  `verifySignedPayload({ payload, signature })`. On success the backend sets the `auth_token`
  JWT cookie (HttpOnly, 24h) + `refresh_token` (7d).
- On signature reject / verify failure: disconnect the wallet + toast (security default).

## The core model: TWO identities, the cookie is the source of truth

The app holds two *independent* notions of "who is this user", and almost every auth UI bug
("Sign in to host" while connected, "wallet connection lost" after a table move, "didn't log
out on switch") comes from confusing them:

| Identity | Where it lives | Survives reload / new tab? |
| --- | --- | --- |
| **Session wallet** | SIWE `auth_token` JWT **cookie** (HttpOnly). What the **WebSocket** authenticates with; what seat-reclaim (`TryReclaimSeat`) keys on. | ✅ yes — it's a cookie |
| **Connected wallet** | thirdweb `useActiveAccount()` — in-memory, rehydrated by `<AutoConnect>` on every cold load; can lag, vanish, or silently switch (Rabby/MetaMask in-extension account change). | ❌ no — re-derived each load |

**Rule: the SIWE cookie is the source of truth for "am I authenticated and as whom."** The
connected wallet is a *separate* signal ("is a wallet currently attached"). Never gate
"authenticated" on `account?.address`.

- `GET /isAuth` returns `{ isAuth, address, sessionType }`. `getAuthStatus()` in
  `server_actions.ts` exposes `address` — the wallet the cookie is bound to. (The old `isAuth()`
  returned only a boolean; discarding `address` is what masked wallet-switch mismatches.)
- `AuthContext.isAuthenticated` is derived from the cookie (`getAuthStatus().isAuth`), polled
  every 5s and refreshed immediately after SIWE — **not** from the connected wallet.
- `AuthContext.lastAuthenticatedAddress` = the **JWT address** (server truth). Consumers that
  ask "is the active wallet the one I'm signed in as" (e.g. `TakeSeatModal`) compare the
  connected wallet against this.

## Reconciliation (`reconcileWalletSession`)

`app/lib/walletSession.ts` is a **pure** function comparing `sessionWallet` (cookie) vs
`connectedWallet` (thirdweb) vs `connectionStatus` on every render — so the decision is
independent of event ordering and AutoConnect hydration timing (the thing injected wallets get
wrong). Addresses are normalized (lowercased, validated as `0x`+40hex; junk/empty → "no
address", so `'' === ''` never reads as a match).

| sessionWallet | connectedWallet | status | decision | action |
| --- | --- | --- | --- | --- |
| X | X | any | `authenticated` | none |
| X | Y (≠X) | any | `mismatch` | **drop session + re-SIWE** |
| X | none | connecting/unknown | `wallet-reconnecting` | **keep session** (wait) |
| X | none | disconnected | `wallet-disconnected` | **keep session** (offer reconnect) |
| none | Y | — | `needs-auth` | SIWE (handled by `useWalletAuth`) |
| none | none | connecting | `connecting` | neutral |
| none | none | disconnected | `unauthenticated` | none |

`AuthContext` acts on `mismatch`: it optimistically clears local auth state (so the WebSocket
downgrades to spectator immediately), `await`s `/logout`, then re-runs SIWE for the new wallet.

## Logout / disconnect policy (be careful here)

A **null** connected wallet is **not** a mismatch — there is no second identity to conflict
with, and a settled `disconnected`+null is indistinguishable from a table-move cold reload
where AutoConnect simply hasn't rehydrated. So we never drop a session just because the address
is null. We drop on the two *real* signals instead:

- **Switch** to a different wallet (`mismatch`) → `AuthContext` drops + re-SIWEs.
- **Deliberate disconnect** ("Disconnect Wallet" in the thirdweb modal) → `ConnectButton.onDisconnect`
  (wired in `WalletButton`) → `AuthContext.logout()` clears local state + cookie. thirdweb fires
  this *only* for the in-modal disconnect, never for AutoConnect failures or transient drops.
- **Transient / cold-start / AutoConnect-failure null** → session is **kept** (player stays
  seated; their WS stays authenticated by the cookie).

`WalletChangeReloader` (table pages) resets table-scoped UI state on a genuine switch: it now
`await`s `logoutUser()` **before** `window.location.reload()` (the original bug was a sync
reload that aborted the in-flight `/logout`, leaving the new wallet riding the old session) and
ignores plain disconnects.

### Known residual gap
An extension-side "disconnect this site" (done inside Rabby/MetaMask, not via our modal)
surfaces as `account → null` **without** firing `onDisconnect`, so it's indistinguishable from
an AutoConnect failure and the session is **kept**. Closing it would need a debounced
"was-connected-this-page then settled-disconnected" heuristic, which risks logging out a seated
player whose wallet merely auto-locked mid-hand — deferred pending a product call.

## Why this shape (the bugs it fixes)

- **"Sign in to host" / logged-out UI while a wallet is connected**, and **"wallet connection
  lost" after table balancing or opening "My table" in a new tab**: caused by gating
  `isAuthenticated` on the connected wallet, which is null during AutoConnect rehydration even
  though the cookie is valid. Fixed by making the cookie the source of truth.
- **"Didn't log out on switch" (Rabby/MetaMask)**: the old code only logged out if it caught
  the X→Y transition *and* `lastAuthenticatedAddress` was already set, and it derived that value
  from the connected wallet (masking the mismatch). Now the mismatch is re-derived continuously
  from server truth, so it can't be missed regardless of event ordering.

## Common bug patterns

- **Signing the wrong payload**: sign the SIWE *message string*, not the JSON payload.
- **Gating auth on `account?.address`**: don't. Use `isAuthenticated` / `sessionWallet` from
  `AuthContext` (cookie-derived). The connected wallet is a separate concern.
- **Dropping the session on a null/disconnected wallet**: don't — it strands table-moved and
  reconnecting players. Drop only on `mismatch` or a deliberate `onDisconnect`.
- **Reloading/navigating before `/logout` resolves**: always `await` the logout first, or the
  cookie survives the navigation.
- **Auth loop**: missing cookie persistence, `isAuth()` returning false unexpectedly, or the
  attempt ref resetting.

## Checklist for changes

- Preserve "the cookie is the source of truth" — never reintroduce `account?.address` gating for
  "authenticated".
- Preserve "disconnect on SIWE failure" (security default) and the mismatch → logout path.
- Keep `reconcileWalletSession` pure and its test suite green (`npm test`); it's the regression
  guard for the whole session model.
- Avoid leaking backend responses or secrets into UI or logs.
