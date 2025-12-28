# Router map (detailed)

## If you see these words, routes, or files…

- **“Chakra”, “theme”, “semanticTokens”, “variant”, “toastOptions”, “ColorMode”** → `chakra-design-system`
- **“thirdweb”, “ConnectButton”, “embedded wallet”, “inAppWallet”, “SIWE”, “sign message”, “USDC”, “Base”** → `web3-thirdweb-siwe`
- **“perf”, “a11y”, “Lighthouse”, “CLS/LCP”, “cleanup”, “production polish”** → `frontend-quality-bar`

## Minimal-file-first strategy

1. Identify the UI surface / feature area from the user request.
2. Open only the closest component + its provider/hook.
3. Follow existing patterns in that area; avoid repo-wide refactors unless asked.
4. If patterns are unclear, consult `.cursor/rules/*.mdc` and then the relevant skill.
