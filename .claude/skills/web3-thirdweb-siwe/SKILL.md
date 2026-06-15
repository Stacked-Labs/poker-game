---
name: web3-thirdweb-siwe
description: Implement and debug wallet connection and authentication in this repo using thirdweb v5 and the SIWE-style flow in `app/hooks/useWalletAuth.ts` and `app/hooks/server_actions.ts`. Use for ConnectButton setup, account state, signature/auth verification, Base/USDC config, and CSP issues with embedded wallet.
---

# Web3 (thirdweb v5) + SIWE Auth (Stacked Poker)

## Repo entry points

- thirdweb client + wallets: `app/thirdwebclient.ts`
- Provider wiring: `app/providers.tsx`
- Connect UI: `app/components/WalletButton.tsx`
- Auth orchestration: `app/hooks/useWalletAuth.ts`, `app/contexts/AuthContext.tsx`
- Backend calls: `app/hooks/server_actions.ts`
- Security headers / embedded wallet frames: `next.config.js`

## Documentation sources (don’t paste full docs)

- thirdweb LLM docs (per repo rules): https://portal.thirdweb.com/llms.txt
- thirdweb full LLM docs: https://portal.thirdweb.com/llms-full.txt
- thirdweb API docs: https://api.thirdweb.com/llms.txt
- Use the `thirdweb-api` MCP server (see `.cursor/mcp.json`) for up-to-date references.

## Debug workflow (common issues)

1. Confirm env is set:
   - `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_WS_URL`
2. Confirm CSP allows thirdweb embedded wallet frames and network:
   - `frame-src` includes `https://embedded-wallet.thirdweb.com`
   - `connect-src` allows required hosts
3. Trace auth flow:
   - `getAuthPayload(address)` → returns `{ payload, message }`
   - `account.signMessage({ message })` (sign the *message string*)
   - `verifySignedPayload({ payload, signature })`
   - On failure, disconnect wallet and clear attempt ref

## Base App notes (read `base-miniapp-developer` first)
- **The Base App is now a standard web-app host** (it dropped Farcaster Mini Apps Apr 9 2026). Inside it, the user's Base Account (Coinbase Smart Wallet) is a standard injected EIP-1193 provider — `sdk.actions.*`/FID context do NOT work there. See `[[project_base_app_miniapp_pivot]]`.
- **One-tap Base login = bridge, don't replace.** Get the provider via `@base-org/account` `createBaseAccountSDK().getProvider()` (run `npm i @base-org/account` first — it's only transitive today), wrap with thirdweb `EIP1193.fromProvider({ provider, walletId: 'com.coinbase.wallet' })`, then `const account = await wallet.connect({ client })`. ⚠️ `client` goes to `connect()`, **not** to `fromProvider` (which takes `{ provider, walletId? }`). Set active via the `useConnect().connect(async () => wallet)` activation step (reuse only that step from `E2EAutoConnect.tsx` — its `createWalletAdapter`/private-key construction is a different path). The existing `useWalletAuth` SIWE flow then fires unchanged off `useActiveAccount()`. NO wagmi/OnchainKit migration.
- In the Base App context, suppress the social-login `AutoConnect`/`ConnectButton` so it doesn't race the injected provider.
- Key owner-match/`gameCreator`/predicted-address off the **live connected address** — in the Base App that's the Coinbase Smart Wallet, not the thirdweb factory account `0x85e2…DF00`.
- Backend SIWE already verifies deployed Coinbase Smart Wallets (ERC-1271); undeployed-first-login (EIP-6492) is thirdweb-pinned and needs work. Smart-account SIWE paths are untested.
- WebViews have no extensions — don't rely on EIP-6963 auto-detection; configure explicitly.

## Smart accounts (in-app social-login users)

- `inAppWallet` is wrapped with `smartAccount: { chain: defaultChain, sponsorGas: true }` in `app/thirdwebclient.ts`. Social-login users (Google/email/passkey) get an ERC-4337 smart account whose gas is sponsored by thirdweb (configured in the dashboard under Sponsored Transactions).
- External wallets (MetaMask, Coinbase, WalletConnect) remain plain EOAs — they pay their own gas in the chain's native token.
- All transaction hooks (`useDepositAndJoin`, `useWithdraw`, `useEmergencyWithdraw{,All}`, `useHostRake`) use `useSendAndConfirmTransaction` directly. There is no shared routing wrapper — that abstraction (`useStackedTransaction`) was tried and pulled because EIP-5792 paymaster support varies by wallet/version and made deposits fail.
- If you re-introduce paymaster routing or EIP-7702 in the future, gate it behind a feature flag and test against every supported wallet first.

## Universal Bridge (BridgeWidget)

- `BridgeWidget` (tabbed Swap | Buy) is mounted via:
  - `app/components/TopUp/TopUpModal.tsx` — themed Chakra modal hosting the widget. Hard-pinned to Base mainnet via `MAINNET_CHAIN` / `MAINNET_USDC_ADDRESS` because thirdweb Bridge only routes through mainnets (testnet token lists come back empty and crash the widget). Buy tab pre-fills the USDC target + amount; Swap tab pre-fills the buy-side token (USDC on Base) and leaves the sell source open.
  - `app/components/TopUp/TopUpButton.tsx` — drop-in button. Returns `null` when `isTestnetOnly` (the app is configured for Sepolia only) or `useIsMiniApp()` is true.
  - Inline fallback inside `TakeSeatModal.tsx` when balance < buy-in.
- The existing `ConnectButton.detailsModal.payOptions.prefillBuy` exposes Buy from the wallet menu — the global post-connect entry.
- Hosted onramp providers load through `frame-src https://*.thirdweb.com` in `next.config.js`. If thirdweb starts framing a third-party host directly (Stripe/Coinbase/Transak/Kado), discover it in DevTools and add it explicitly.
- Decision: `BridgeWidget` over `BuyWidget` so power users can swap from any chain in one click without needing fiat. The card flow is still available on the Buy tab.

## What to load next

- For the repo’s exact auth sequence and edge cases: read `references/auth-flow.md`.
- For CSP gotchas (embedded wallet / Turnstile / Tenor): read `references/csp-and-headers.md`.
- To quickly sanity-check env vars: run `scripts/check-web3-env.sh`.
