# Paymaster & gas (Base App)

**The Base App does NOT auto-sponsor arbitrary app contract calls.** Sponsoring our table/settlement calls is the app's job — keep the existing setup.

## Two sponsorship paths already in the repo (both stay)
1. **Social-login users (plain web):** `inAppWallet` is wrapped with `smartAccount: { chain: defaultChain, sponsorGas: true, factoryAddress: 0x85e2…DF00 }` in `app/thirdwebclient.ts`. thirdweb sponsors gas (dashboard → Sponsored Transactions).
2. **Base wallet / external wallets (incl. inside the Base App):** the user's USDC pays gas via the **Base USDC ERC-20 paymaster**, passed as `capabilities.paymasterService.url` (ERC-7677) in **EIP-5792 `wallet_sendCalls`**. URL: `BASE_PAYMASTER_URL` (`NEXT_PUBLIC_THIRDWEB_BUNDLER_URL`, format `https://{chainId}.bundler.thirdweb.com/{clientId}`). Users never need ETH.

The Base Account host provider supports `wallet_sendCalls`, so per-hand settlement sponsorship is unaffected inside the Base App. **Keep the paymaster active there** — do not assume the host pays.

## Caveat to fix
`app/hooks/useIsMiniApp.ts` comments that "the host wallet handles gas" and suppresses our onramp/`BuyWidget` on that assumption. That's over-optimistic AND `isInMiniApp()` is false inside the Base App now, so the gate won't even engage. Re-validate gas/onramp behavior on a real device and correct the comment.

## Verify
On a physical Base App install, confirm a table buy-in/settlement call is actually sponsored (USDC-paymaster gas) before changing anything. Transaction hooks (`useDepositAndJoin`, `useWithdraw`, `useEmergencyWithdraw*`, `useHostRake`) use `useSendAndConfirmTransaction` directly — see the `web3-thirdweb-siwe` skill for why the shared `useStackedTransaction` wrapper was pulled.

## Sources
- https://docs.base.org/base-account/improve-ux/sponsor-gas/paymasters
- https://docs.base.org/smart-wallet/guides/paymasters
