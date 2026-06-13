# Track A — Base wallet → thirdweb bridge + SIWE (Base App)

Goal: a user already in the Base App taps once and is logged in with **their Base wallet** (Coinbase Smart Wallet), with **no social-login detour**, reusing the existing SIWE backend. thirdweb stays the wallet layer.

## The mechanism (standard web app model)
Inside the Base App in-app browser the Base Account is a **standard injected EIP-1193 provider** — the same shape a normal dapp browser exposes. We do NOT use the Farcaster SDK here. The flow:

**Prerequisite:** `npm i @base-org/account` first. It is currently only a *transitive* dep (via thirdweb, v2.5.0); importing it directly without declaring it will break on a thirdweb bump.

1. **Get the provider — `@base-org/account` is the PRIMARY path** (confirmed present in 2.5.0):
   ```ts
   import { createBaseAccountSDK } from '@base-org/account';
   const provider = createBaseAccountSDK({ appName: 'Stacked Poker' }).getProvider();
   ```
   This returns a bare EIP-1193 provider (no wagmi). The wagmi form `baseAccount({ appName })` is the connector — we are NOT using it. Do **not** rely on a bare injected `window.ethereum` in the Base App webview: that injection is **unconfirmed by Base docs** and must be validated on-device before being used as a fallback.

2. **Bridge into thirdweb** with the adapter already shipped in our installed thirdweb (currently unused). ⚠️ `fromProvider` takes `{ provider, walletId? }` — **`client` goes to `connect()`, NOT to `fromProvider`** (verified against the installed type `from-eip1193.d.ts`):
   ```ts
   import { EIP1193 } from 'thirdweb/wallets';
   const wallet = EIP1193.fromProvider({ provider, walletId: 'app.base' });
   const account = await wallet.connect({ client }); // client goes HERE
   ```

3. **Set it active** — reuse **only the activation pattern** from `app/components/E2EAutoConnect.tsx` (its `useConnect().connect(async () => wallet)` step). Do **not** mirror its wallet construction: E2EAutoConnect uses `createWalletAdapter` around an already-built `privateKeyToAccount` Account — a *different* adapter for a different input. For the Base wallet, build the wallet net-new with `EIP1193.fromProvider` (step 2), then:
   ```ts
   const { connect } = useConnect();
   connect(async () => {
       const wallet = EIP1193.fromProvider({ provider, walletId: 'app.base' });
       await wallet.connect({ client });
       return wallet;
   });
   ```

4. **SIWE fires unchanged.** Once active, `useActiveAccount()` returns the Base address and the existing `app/hooks/useWalletAuth.ts` effect runs: `getAuthPayload(address)` → `account.signMessage({ message })` → `verifySignedPayload`. **No change to the SIWE flow itself.**

## New component: `BaseAppConnect`
Add a client component sibling to `E2EAutoConnect.tsx`, rendered in `app/providers.tsx`:
- On mount, detect the Base App context. **Do not** use `useIsMiniApp`/`sdk.isInMiniApp()` (returns `false` in the Base App now) and **do not** sniff `window.ethereum` (unconfirmed). Detect via the Base.dev launch context or an attempted `createBaseAccountSDK().getProvider()` connect, or surface an explicit "Continue with Base" affordance. Factor this into a `useIsBaseApp()` predicate — it also gates the app-first landing, onramp/paymaster behavior, and notification keying.
- If present: build + connect the bridged Base wallet (silent auto-connect, or behind a single "Continue with your Base wallet" button).
- **Suppress the thirdweb social-login path in that context:** don't run the social `AutoConnect` list and don't surface the multi-wallet `ConnectButton` modal (it's mounted ~9 sites via `WalletButton.tsx`) — otherwise it races the host injection / opens a redundant connect modal.
- Outside the Base App (plain web/PWA), keep the existing thirdweb social + MetaMask/Coinbase/WalletConnect flow exactly as-is.

## Backend (poker-server) implications
- **Deployed Coinbase Smart Wallet → works today.** `transport/http/auth/siwe.go` verifies via ERC-1271 (`verifyERC1271`, factory-agnostic). `gameCreator`/owner-match (`crypto_gating.go`, `owner_gating.go`) is normalized-address comparison — wallet-type agnostic. No contract or authz change.
- **Undeployed Coinbase Smart Wallet (first-ever signature) → fails.** Path 2b (`recoverThirdwebAccountAdmin`, ~siwe.go:481-551) is hard-pinned to thirdweb's `Account.sol` EIP-712 `AccountMessage`. Options: (a) ensure the host smart account is deployed before first login (simplest), or (b) add a Coinbase-specific EIP-6492 branch (Coinbase replay-safe hash + `CoinbaseSmartWalletFactory.createAccount(bytes[] owners, uint256 nonce)` calldata) and add the Coinbase factory to `SIWE_ALLOWED_FACTORIES` on **both** Base + Base Sepolia (confirm the CREATE2 same-address property first).
- **Tests:** the smart-account SIWE paths have **no coverage** (`siwe_test.go` passes nil `smartAccountChecks`). Add ERC-1271 + EIP-6492 cases — this is the biggest backend risk.
- **Minor:** `siwe.go` emits a hardcoded SIWE payload `ChainID: 1`; emit the active Base chain (8453/84532) for strict SIWE clients (tolerated today; fix with a regression test).

## Client gotchas
- In the Base App the active address is the **Coinbase Smart Wallet**, not the thirdweb counterfactual `0x85e2…DF00`. Re-audit any client logic that assumes the thirdweb factory address (predicted-address, owner-match) to key off `useActiveAccount().address`.
- `useIsMiniApp()` returns **false** inside the Base App now (it's `sdk.isInMiniApp()`), so the onramp/paymaster suppression it drives won't engage there. Replace its consumers with a Base-App/injected-provider detection and re-validate those decisions. The "host handles gas" comment is wrong — keep the paymaster (see `paymaster.md`).

## Sources
- https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app
- https://docs.base.org/mini-apps/core-concepts/authentication
- https://portal.thirdweb.com/typescript/v5/eip1193/fromProvider
- https://github.com/thirdweb-example/farcaster-starter
- https://www.npmjs.com/package/@base-org/account
