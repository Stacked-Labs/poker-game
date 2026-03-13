# Performance + accessibility patterns

---

## Performance

### Memoization: profile before you optimize

- `React.memo` — skip re-renders when props are shallowly equal. Only useful when the parent re-renders frequently and this child is expensive.
- `useCallback` — memoize a function reference. Use when passing a callback to a memoized child or as a `useEffect` dependency.
- `useMemo` — memoize a computed value. Use for genuinely expensive computations (sorting large arrays, heavy derivations).

```tsx
// DO: memoize a genuinely expensive sort
const sorted = useMemo(() => [...players].sort(byChips), [players]);

// DON'T: memoize cheap string operations
const label = useMemo(() => `Pot: ${pot}`, [pot]); // pointless overhead
```

**Never wrap every function in `useCallback` "just in case."** This is one of the most common React performance antipatterns — it adds overhead without benefit.

### Re-render hygiene

- Subscribe to only the Zustand slice you need — not the whole store:

```ts
// DO: narrow selector
const chips = useGameStore((s) => s.player.chips);

// DON'T: subscribes to all changes
const store = useGameStore();
```

- Avoid object/array literals as default prop values — they create new references on every render:

```tsx
// DON'T
<PlayerList players={[]} /> // new array every render

// DO
const EMPTY: Player[] = [];
<PlayerList players={EMPTY} />
```

- Split large components to scope re-renders: a game clock that ticks every second shouldn't cause the entire table to re-render.

### Code splitting

- Split at the route level first — highest impact.
- Lazy-load large, non-critical components (modals, heavy panels, settings):

```tsx
const SettingsModal = React.lazy(() => import('./SettingsModal'));

<Suspense fallback={<Spinner />}>
  <SettingsModal />
</Suspense>
```

### Lists & virtualization

- Avoid rendering more than ~100 items in the DOM at once.
- For game log, chat history, and hand history: use `useInView` for "load more" patterns.
- For very long lists (leaderboards, large histories): consider `@tanstack/virtual`.
- Never render huge logs in one go — prefer pagination or windowing.

### Images

- Use `next/image` for all user-uploaded or remote images — automatic WebP, lazy loading, size optimization.
- Always set `width` and `height` (or `fill` with a positioned parent) to prevent layout shift.
- Update `next.config.js` `images.remotePatterns` when adding new image domains.

### Animation performance

- Animate only `transform` and `opacity` — GPU-composited, no layout recalc.
- Avoid animating `width`, `height`, `top`, `left`, `padding`, `margin`.
- Default to subtle transitions (0.15–0.2s ease) — keep gameplay UI snappy.
- Always check `useReducedMotion()` and disable or simplify animations when true.

```tsx
const prefersReduced = useReducedMotion();
<Box transition={prefersReduced ? 'none' : 'transform 0.2s ease'} />
```

---

## Accessibility (a11y)

### Core rules

- **Use semantic HTML.** A `<button>` is already keyboard-accessible and has role semantics. Adding `role="button"` to a `<div>` is always worse.
- **Never** use `<div onClick={...}>` for interactive elements — use `<button>` or `<a>`.
- **Every `IconButton` must have `aria-label`** — this is enforced in the PR checklist.

### Keyboard navigation

Every user flow must be completable via keyboard alone:

| Key | Expected behavior |
|-----|------------------|
| `Tab` / `Shift+Tab` | Move focus between interactive elements |
| `Enter` / `Space` | Activate buttons, checkboxes |
| `Arrow keys` | Navigate within menus, tabs, select lists |
| `Escape` | Close modals, dropdowns, drawers |

- Ensure all focusable elements have a visible focus ring (Chakra defaults are fine unless overridden — do not suppress them).
- Return focus to the triggering element when a modal/drawer closes.

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);
const { isOpen, onOpen, onClose } = useDisclosure();

const handleClose = () => {
  onClose();
  triggerRef.current?.focus();
};

<Button ref={triggerRef} onClick={onOpen}>Open Settings</Button>
<Modal isOpen={isOpen} onClose={handleClose} finalFocusRef={triggerRef}>
  ...
</Modal>
```

### ARIA

- Use ARIA to communicate *state*, not styling. `aria-expanded`, `aria-pressed`, `aria-selected` should mirror React state.
- **Never** use ARIA to fix broken semantics — fix the HTML first.
- Use `aria-live="polite"` for dynamic content updates (notifications, status messages, chip counts):

```tsx
<Box aria-live="polite" aria-atomic>
  {statusMessage}
</Box>
```

- Use `aria-describedby` to link error messages to inputs:

```tsx
<Input id="bet-input" aria-describedby="bet-error" />
<Text id="bet-error" color="red.400">{errors.bet?.message}</Text>
```

### Forms

- Every input **must** have an associated `<label>` (via `htmlFor`/`id`) or `aria-label`.
- Never use only `placeholder` as a label — placeholders disappear when typing.
- Render error messages in visible text, not just color change.
- Disable submit button during async actions to prevent duplicate submissions.

### Dynamic content

- Use `Skeleton` / `SkeletonText` for loading states — better than spinners for layout-preserving UX.
- Announce async results to screen readers via `aria-live` regions.
- When content updates without a page navigation, update the document title or an `aria-live` region.

### Color & contrast

- Never rely on color alone to communicate state — use icons, labels, or badges alongside color.
- Ensure text contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (WCAG AA).
- Brand colors: `brand.pink` on dark passes; `brand.yellow` on dark passes; check light mode text on `brand.green`.

### Testing a11y

- Run `npm run lint` — ESLint a11y rules catch basic issues.
- In Storybook: use the Accessibility panel (a11y addon) per component.
- Manual keyboard test: Tab through the flow, verify no focus traps, all actions reachable.
- Use browser DevTools accessibility tree to check label associations.
