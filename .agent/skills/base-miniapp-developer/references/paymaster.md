# Paymaster & Gasless Transactions

- Paymaster uses ERC-7677 `paymasterService` capability (URL must be HTTPS).
- Configure Paymaster/Bundler in Coinbase Developer Platform and store URL in env vars.
- In OnchainKit `Transaction`, pass `capabilities.paymasterService.url`.
- Only smart wallets are eligible for sponsored transactions.

Example:

```tsx
<Transaction
  capabilities={{
    paymasterService: {
      url: process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT!,
    },
  }}
>
  <TransactionButton text="Send" />
</Transaction>
```
