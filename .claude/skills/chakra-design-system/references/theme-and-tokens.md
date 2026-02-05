# Theme and tokens (repo-specific)

## Where it lives

- Theme entry: `app/theme.ts`
- Providers: `app/providers.tsx` wraps `ChakraProvider` and global toast defaults.

## Token usage rules

- Prefer `semanticTokens` keys like:
  - `text.primary`, `text.secondary`, `bg.navbar`, `chat.border`, `input.lightGray`
- Prefer `colors.brand.*` for brand colors (`brand.navy`, `brand.pink`, `brand.green`, `brand.yellow`).
- Avoid introducing new "legacy" colors unless you're migrating existing usage.

## CRITICAL: Never modify a shared token for a component-specific change

When a specific component needs a different color in dark mode (or any mode), **do NOT change the semantic token value in `theme.ts`**. Semantic tokens are shared across the entire app — changing one will affect every component that uses it.

Instead, override the color **directly on the component** using Chakra's `_dark` pseudo-prop or `useColorModeValue`:

```tsx
// WRONG — changes color for ALL components using text.muted
// (in theme.ts) 'text.muted': { default: 'gray.500', _dark: 'orange.300' }

// RIGHT — scoped override on the specific component
<Text color="text.muted" _dark={{ color: 'orange.300' }}>NO DOWNLOAD</Text>

// Also acceptable:
const mutedColor = useColorModeValue('gray.500', 'orange.300');
<Text color={mutedColor}>NO DOWNLOAD</Text>
```

**Rule of thumb:** If the change is only for one component or one section, override at the component level. Only modify `theme.ts` tokens when you intentionally want to change the color app-wide.

## Breakpoints and responsive API

Breakpoints are defined in `app/theme.ts`. Use:

- Responsive prop arrays: `px={[2, 4, 6]}`
- Or object syntax: `display={{ base: 'none', md: 'flex' }}`

Only use orientation media queries when the UI truly needs portrait vs landscape behavior.

## Adding a new semantic token

1. Add the token under `semanticTokens.colors` in `app/theme.ts`.
2. Use it in components instead of hardcoded values.
3. Ensure both `default` and `_dark` are set (even if the same).

