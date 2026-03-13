---
name: storybook-testing
description: Write, maintain, and review Storybook v9 stories for this repo (Next.js 14 App Router + Chakra UI v2 + Zustand). Use when adding stories for new components, visualising component states, or doing visual review passes.
---

# Storybook Testing (Stacked Poker)

## First steps (always)

1. Read `references/setup.md` for how Storybook is configured in this repo.
2. Read `references/patterns.md` for story patterns specific to our stack.
3. Check `examples/` for working story templates before writing new ones.
4. Run `npm run storybook` (port 6006) to verify the story renders before handing it off.

## Where stories live

Stories are **colocated** with their components:

```
app/
  components/
    NavBar/
      SessionPointsBadge.tsx
      SessionPointsBadge.stories.tsx   ← here
    Toasts/
      DepositSuccessToast.tsx
      DepositSuccessToast.stories.tsx
    Leaderboard/
      ShareRankCard.tsx
      ShareRankCard.stories.tsx
```

## Stack-specific rules

### Chakra UI v2
- All stories inherit `ChakraProvider` + app theme from `.storybook/preview.tsx`. **Never add ChakraProvider inside a story file.**
- Use the toolbar's light/dark toggle (class `chakra-ui-dark`) to test both modes.
- Force a specific mode per story with `<DarkMode>` or `<LightMode>` wrappers in a story-level decorator.
- `useColorModeValue` and semantic tokens work automatically — no mocking needed.
- **Never use raw hex colors in stories.** Use theme tokens (`brand.green`, `text.primary`) to keep stories consistent with production.

### Next.js App Router
- `nextjs.appDirectory: true` is set globally in `preview.tsx` — you don't need to repeat it unless overriding.
- If a component calls `usePathname()` or `useRouter()`, the mock is already active. Override the mock pathname per story:
  ```typescript
  parameters: { nextjs: { navigation: { pathname: '/leaderboard' } } }
  ```

### Zustand stores
- Reset store state in `beforeEach` to prevent leakage between stories (see `references/patterns.md` for the exact pattern).
- Use `store.setState(state, true)` (the `true` flag = full replace, not merge).
- The main store to mock in this repo: `usePointsAnimationStore` in `app/stores/pointsAnimation.ts`.

## CSF3 story format (required)

Always use the `satisfies Meta<typeof Component>` pattern — **never** `as Meta<...>`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
    title: 'Components/MyComponent',
    component: MyComponent,
    tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { /* props */ },
};
```

## Story coverage checklist

For each component, cover:
- [ ] **Default / primary use case** — the happy path
- [ ] **Key variant states** (e.g., heat levels for SessionPointsBadge: cold/warm/hot/overcharge)
- [ ] **Edge cases** — empty, loading, error, 0 state, max value
- [ ] **Interactive states** — if the component has animations/triggers, add a story with a button/action to fire them
- [ ] **Dark mode** — add at least one story with the `chakra-ui-dark` class or `<DarkMode>` wrapper

## What NOT to do

- Don't import `ChakraProvider` inside story files — it's global.
- Don't hardcode `setTimeout` to "wait for animations" in stories — use `play` functions with `userEvent` and `expect`.
- Don't create stories for every prop permutation — focus on meaningful visual states.
- Don't use `as Meta<...>` — it kills TypeScript inference.
- Don't write stories for pure server components (RSC) without enabling `experimentalRSC` in `main.ts`.

## Running Storybook

```bash
npm run storybook        # dev server → http://localhost:6006
npm run storybook:build  # static build output
```
