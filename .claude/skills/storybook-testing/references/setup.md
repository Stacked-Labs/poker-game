# Storybook Setup Reference

## Installed versions (as of 2026-03-13)

| Package | Version |
|---|---|
| `storybook` | 9.1.20 |
| `@storybook/nextjs-vite` | 9.1.20 |
| `@storybook/react` | 9.1.20 |
| `@storybook/addon-docs` | 9.1.20 |
| `@storybook/addon-themes` | 9.1.20 |

Install was done with `--legacy-peer-deps` because the project pins `@types/node@^16` and Vite 7 requires `^20`. This is a dev-only type mismatch — safe to ignore.

## Config files

### `.storybook/main.ts`
- Framework: `@storybook/nextjs-vite`
- Story glob: `../app/**/*.stories.@(ts|tsx)` — only picks up stories inside `app/`
- Addons: `addon-docs` (autodocs), `addon-themes` (dark/light toggle)
- `image.loading: 'eager'` — disables Next.js lazy loading inside Storybook so images appear immediately

### `.storybook/preview.tsx`
- `withThemeByClassName` — adds a toolbar toggle that applies class `chakra-ui-dark` on `<html>`
- `ChakraProvider` with the actual `app/theme.ts` — ensures semantic tokens and brand colors all resolve correctly
- `nextjs.appDirectory: true` globally — prevents "invariant expected app router" crash for any component using `next/navigation`
- Controls sorted `requiredFirst`, color/date auto-matchers active

## npm scripts

```bash
npm run storybook        # dev server at http://localhost:6006
npm run storybook:build  # static output in storybook-static/
```

## Upgrading

When upgrading, all `@storybook/*` packages must be on the **same minor version**. Run:
```bash
npm install --save-dev storybook@X.Y.Z @storybook/nextjs-vite@X.Y.Z @storybook/react@X.Y.Z @storybook/addon-docs@X.Y.Z @storybook/addon-themes@X.Y.Z --legacy-peer-deps
```

## Known issues

- `@storybook/addon-essentials` and `@storybook/addon-interactions` are still on v8 as of this setup and are **not installed** — they would conflict. The essential addons (Controls, Actions, Backgrounds, Viewport) are built into `@storybook/nextjs-vite` v9.
- If a story imports from `next/font/local`, Storybook may fail unless the font `src` path is resolvable from the Vite root.
