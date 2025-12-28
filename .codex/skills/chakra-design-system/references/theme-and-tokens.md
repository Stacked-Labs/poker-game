# Theme and tokens (repo-specific)

## Where it lives

- Theme entry: `app/theme.ts`
- Providers: `app/providers.tsx` wraps `ChakraProvider` and global toast defaults.

## Token usage rules

- Prefer `semanticTokens` keys like:
  - `text.primary`, `text.secondary`, `bg.navbar`, `chat.border`, `input.lightGray`
- Prefer `colors.brand.*` for brand colors (`brand.navy`, `brand.pink`, `brand.green`, `brand.yellow`).
- Avoid introducing new “legacy” colors unless you’re migrating existing usage.

## Breakpoints and responsive API

Breakpoints are defined in `app/theme.ts`. Use:

- Responsive prop arrays: `px={[2, 4, 6]}`
- Or object syntax: `display={{ base: 'none', md: 'flex' }}`

Only use orientation media queries when the UI truly needs portrait vs landscape behavior.

## Adding a new semantic token

1. Add the token under `semanticTokens.colors` in `app/theme.ts`.
2. Use it in components instead of hardcoded values.
3. Ensure both `default` and `_dark` are set (even if the same).

