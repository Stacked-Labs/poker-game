---
name: react-architecture
description: Generic React & Next.js App Router best practices for this repo. Use for component architecture, TypeScript patterns, state management decisions, custom hooks, error handling, form handling, and Next.js Server vs Client Component decisions.
---

# React Architecture (Stacked Poker)

## First steps

1. Identify the component's responsibility: is it data-fetching, presentation, or interactive?
2. Decide Server Component vs Client Component (see below).
3. Check nearby components for established patterns before introducing new ones.

## Core rules

- **Functional components only.** No class components.
- **No `React.FC`.** It adds an implicit `children` prop and obscures return types.
- **No `any`.** Use `unknown` + type narrowing, or define a proper interface.
- **Small, focused components.** >150 lines or mixed concerns → split it.
- **Composition over configuration.** Fewer props + more composition > one "god component" with 20 flags.

---

## Server vs Client Components

**Default: Server Component.** Only add `'use client'` when you need:

| Need | Solution |
|------|----------|
| `useState`, `useReducer`, `useEffect`, `useRef` | `'use client'` |
| Browser APIs (`window`, `localStorage`) | `'use client'` |
| Event handlers (`onClick`, `onChange`) | `'use client'` |
| Third-party client libs (animations, charts) | `'use client'` |
| Data fetching, DB calls, async transforms | Server Component (`async` function) |
| Static layout, no interactivity | Server Component |

**Keep `'use client'` at the leaves.** Never put it high in the tree unless the entire subtree genuinely needs client features.

```tsx
// DO: push interactivity to the leaf
<GameLayout>            {/* Server Component */}
  <PlayerList />        {/* Server Component */}
  <BetControls />       {/* 'use client' — has onClick */}
</GameLayout>

// DON'T: mark parent 'use client' because one child needs it
```

**Never import a Server Component from inside a Client Component.** Pass it as `children` instead:

```tsx
// WRONG (build error)
// In ClientWrapper.tsx ('use client'):
import ServerData from './ServerData';

// RIGHT — pass as a slot
<ClientWrapper>
  <ServerData /> {/* rendered by server, passed as JSX prop */}
</ClientWrapper>
```

---

## State management decision tree

Use in this order:

1. **`useState` / `useReducer`** — always the default. If state doesn't leave the component, keep it local.
2. **React Context** — low-frequency shared values: auth session, theme, locale, feature flags. **Not** for values that update every keystroke or every frame.
3. **Zustand** — shared client state that updates frequently across loosely-related components (game state, chat, UI preferences).
4. **TanStack Query** — all server/async state: fetching, caching, invalidation. Treat as its own category.

**Never** put server cache (API responses) in Zustand or Context. Use TanStack Query.

**Never** use Context for high-frequency state — every consumer re-renders on every change.

```ts
// DO: narrow Zustand selector
const chips = useGameStore((s) => s.player.chips);

// DON'T: subscribe to entire store
const everything = useGameStore();
```

Use `useReducer` instead of multiple related `useState` calls when transitions have business logic rules.

---

## Custom hooks

Extract any non-trivial logic that mixes state + effects:

- Name hooks `useXxx`.
- Colocate with the component if only used there; promote to `app/hooks/` when reused.
- Hooks return data and callbacks — **never JSX**.

```ts
// Good custom hook
function usePlayerTimer(timeoutMs: number) {
  const [remaining, setRemaining] = useState(timeoutMs);

  useEffect(() => {
    const id = setInterval(() => setRemaining((t) => t - 100), 100);
    return () => clearInterval(id);
  }, []);

  return remaining;
}
```

---

## TypeScript patterns

### Props

```tsx
// DO: interface for component props
interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onFold?: () => void; // optional with ?
}

// DON'T: React.FC (implicit children, obscures return type)
const PlayerCard: React.FC<PlayerCardProps> = ...
```

Use discriminated unions for multi-mode components:

```tsx
type ButtonProps =
  | { variant: 'icon'; icon: ReactNode; label: string }
  | { variant: 'text'; children: ReactNode };
```

### Events

```tsx
// Always type events explicitly
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };
```

### Refs

```tsx
// Always type refs precisely
const btnRef = useRef<HTMLButtonElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
```

### Utility types

- `ComponentProps<typeof Comp>` — extend existing component props.
- `Pick<T, 'a' | 'b'>`, `Omit<T, 'c'>`, `Partial<T>` — avoid duplicating type definitions.
- `interface` for object shapes that may be extended; `type` for unions/intersections.

---

## Component architecture patterns

### Compound components

Use for tightly coupled UI that shares implicit state (Tabs, Accordion, Select-like):

```tsx
// Parent owns state via Context; children consume without explicit prop drilling
<PlayerActions>
  <PlayerActions.Fold />
  <PlayerActions.Check />
  <PlayerActions.Raise />
</PlayerActions>
```

Use this when child components are meaningless outside the parent context, or when prop drilling exceeds 2 levels.

### Error boundaries

- Wrap every major section with `ErrorBoundary` + `Suspense`. They are complementary.
- Use `react-error-boundary` library — don't hand-roll class-based boundaries.
- Use **granular** boundaries (section-level), not one top-level catch-all.
- Log errors to monitoring in `onError` callback.

```tsx
<ErrorBoundary fallback={<SectionFallback />} onError={captureException}>
  <Suspense fallback={<Skeleton />}>
    <AsyncSection />
  </Suspense>
</ErrorBoundary>
```

In Next.js App Router, use co-located `error.tsx` + `loading.tsx` files for route-level boundaries.

---

## Form handling

- Use **React Hook Form** for any form with >2 fields.
- Pair with **Zod** for schema validation via `zodResolver`.
- Default `mode: 'onSubmit'`; use `mode: 'onBlur'` when per-field feedback is important UX.
- Use RHF's `<Controller>` only for Chakra UI inputs that don't expose a native `ref`.

```tsx
const schema = z.object({
  buyIn: z.number().min(10).max(10000),
});

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema),
});

<form onSubmit={handleSubmit(onSubmit)}>
  <FormControl isInvalid={!!errors.buyIn}>
    <FormLabel>Buy-in Amount</FormLabel>
    <Input variant="takeSeatModal" type="number" {...register('buyIn', { valueAsNumber: true })} />
    <FormErrorMessage>{errors.buyIn?.message}</FormErrorMessage>
  </FormControl>
  <Button type="submit" variant="greenGradient" isLoading={isSubmitting}>
    Join
  </Button>
</form>
```

---

## Data fetching patterns

### Server Components (preferred for initial data)

```tsx
// app/game/[id]/page.tsx — async Server Component
async function GamePage({ params }: { params: { id: string } }) {
  const game = await fetchGame(params.id); // direct fetch, no useEffect

  return <GameTable game={game} />;
}
```

### Client-side with TanStack Query

Use for data that updates client-side, needs polling, or depends on client state:

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['game', gameId],
  queryFn: () => fetchGame(gameId),
  refetchInterval: 5000, // polling
});
```

### Parallel data streams (Suspense)

Wrap independent data sections in `<Suspense>` so they stream independently:

```tsx
<Suspense fallback={<PlayerSkeleton />}>
  <PlayerList gameId={id} />
</Suspense>
<Suspense fallback={<ChatSkeleton />}>
  <GameChat gameId={id} />
</Suspense>
```

---

## File organization (this repo)

```
app/
  components/         # Client components by feature
    game/             # Table, seat, action components
    chat/             # Chat UI
    modals/           # Modal components
  hooks/              # Shared custom hooks
  contexts/           # React context providers
  stores/             # Zustand stores (useGameStore, etc.)
  theme.ts            # Chakra theme
  providers.tsx       # ChakraProvider + context wiring

app/(routes)/         # Next.js App Router pages
  page.tsx            # Thin — imports from components/
  loading.tsx         # Suspense boundary
  error.tsx           # Error boundary
```

- `page.tsx` and `layout.tsx` are thin wrappers — business logic lives in `components/` and `hooks/`.
- Colocate component-specific hooks with the component; promote to `app/hooks/` only when reused.

## What to load next

- For Chakra UI patterns and theme tokens: load `chakra-design-system` skill.
- For quality checklist and perf/a11y details: load `frontend-quality-bar` skill.
- For Storybook stories: load `storybook-testing` skill.
