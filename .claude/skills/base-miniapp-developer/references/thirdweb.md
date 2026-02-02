# thirdweb Integration Notes (Mini App)

Keep thirdweb as the primary wallet, onboarding, and payment layer.

Guidelines:
- Keep the existing thirdweb provider and hooks; avoid ripping out established flow.
- Do not assume `window.ethereum` is available in the Coinbase Wallet WebView.
- Prefer thirdweb connectors that do not require an injected provider.
- Ensure chain configuration targets Base (e.g., `base` / `8453`).
- When adding gasless flows, align thirdweb account abstraction or paymaster settings with the Mini App constraints.

If conflicts arise:
- Avoid double wallet UIs. Choose thirdweb for wallet UX and keep OnchainKit for Mini App context.
- If a library requires EIP-1193 injection, replace with a connector compatible with embedded/WebView contexts.
