# Smart Accounts + USDC Paymaster

Reference for the EIP-7702 smart account + Base USDC ERC-20 paymaster
integration. Goal: users never need ETH for gas. They sign in with
Google/email/passkey or connect MetaMask/Coinbase Wallet, and every
transaction pays gas in USDC at the same address.

## Wiring overview

| Concern | File |
|---|---|
| Client + wallets + paymaster URL constant | `app/thirdwebclient.ts` |
| `accountAbstraction` on `ConnectButton` | `app/components/WalletButton.tsx` |
| Mini App detection | `app/hooks/useIsMiniApp.ts` |
| Transaction routing (the only place transactions are sent) | `app/hooks/useStackedTransaction.ts` |
| Inline BuyWidget at-table | `app/components/TakeSeatModal.tsx` (red-banner branch) |
| Standalone Buy entry | `app/components/TopUp/TopUpButton.tsx` |
| Backend ERC-1271 verifier | `poker-server/transport/http/auth/siwe.go` |
| Bridge `purchase.complete` webhook | `poker-server/engine/bridge_webhook.go` |

## Transaction routing — the contract

`useStackedTransaction` takes `PreparedTransaction[]` and returns
`{ transactionHashes }`. Three branches, **decided in this exact order**:

1. **Mini App host** (`useIsMiniApp() === true`): serial submit via
   `sendAndConfirmTransaction`. The host wallet (Coinbase Wallet, Farcaster
   client) handles gas. We do **not** attach our paymaster — risk of
   double-pay or conflict.
2. **Everyone else**: `sendAndConfirmCalls` with
   `capabilities.paymasterService.url = BASE_PAYMASTER_URL`. inApp 7702
   smart accounts and external EOAs that support EIP-5792 both follow this
   branch.

If `sendAndConfirmCalls` throws — wallet doesn't support EIP-5792, or our
paymaster/bundler is down — the hook re-throws. **Emergency-exit hooks** opt
into a serial-with-user-eth fallback via `useStackedTransaction({
emergencyFallback: true })`. This is intentional: we'd rather a user
evacuate paying ETH than be locked out of their funds during an outage.

## Batching

When you have multiple txs (approve + contract call), pass them as one
array to `sendStackedTx([a, b])`. The bundle is atomic on the EIP-5792
path, so:
- No allowance polling needed (the deposit can't observe a stale allowance).
- One paymaster fee for the bundle, not one per tx.
- Single signature prompt for the user.

See `useDepositAndJoin.ts` for the canonical example.

## SIWE / ERC-1271

inAppWallet users sign through their smart-account contract. Plain
`ecrecover` recovers the internal signer key, not the smart-account address
— so the address comparison fails. The backend falls back to calling
`isValidSignature(bytes32,bytes)` (EIP-1271, selector `0x1626ba7e`) on the
claimed address via `SIWE_SMART_ACCOUNT_RPC_URL`. If that env var is unset,
ERC-1271 is skipped and smart-account users will fail auth.

## CSP

`next.config.js` `frame-src` must include `https://*.thirdweb.com` (covers
embedded wallet, pay, bridge widgets). `connect-src` is already permissive
(`https://*`) so the bundler URL resolves. If thirdweb's Bridge starts
framing a third-party onramp provider on a non-thirdweb host (Stripe,
Coinbase, Transak, Kado), discover the host in DevTools and add it
explicitly.

## Env vars

- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` — public.
- `NEXT_PUBLIC_THIRDWEB_BUNDLER_URL` — `https://8453.bundler.thirdweb.com/{clientId}` for Base mainnet, `https://84532.bundler.thirdweb.com/{clientId}` for Sepolia.
- Server: `SIWE_SMART_ACCOUNT_RPC_URL` — a Base RPC URL for ERC-1271 eth_call.
- Server: `THIRDWEB_WEBHOOK_SECRET_BRIDGE` — HMAC secret for `/api/webhooks/bridge`.

## Mini App caveat

When `useIsMiniApp()` is true:
- `TopUpButton` renders `null` (host has its own onramp).
- `useStackedTransaction` uses the host wallet's serial submit path.

Don't blanket-disable smart accounts for Mini App — the host wallet is
already a smart wallet most of the time. Just don't stack ours on top.

## Pricing note

thirdweb adds a ~10% premium on top of the network gas fee, deducted from
the user's USDC. At current Base gas, that's pennies. Document the line in
deposit toasts if it ever becomes user-visible.
