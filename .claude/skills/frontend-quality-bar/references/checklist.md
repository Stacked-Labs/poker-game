# PR / merge checklist (repo-oriented)

## UX and product

- [ ] All user-visible actions have feedback: spinner, disabled state, or toast.
- [ ] Error messages are actionable ("what happened" + "what to do next") and don't expose secrets.
- [ ] Copy is consistent in tone and capitalization (sentence case for UI text, Title Case for headings).
- [ ] Empty states are handled: no blank panels, no silent failures.
- [ ] Success states are confirmed: user knows when an action completed.

## Accessibility

- [ ] `IconButton` has `aria-label`.
- [ ] Inputs have a visible `<label>` (or `aria-label`). Never rely on `placeholder` alone.
- [ ] Error messages are linked to inputs via `aria-describedby`.
- [ ] Interactive elements are reachable via keyboard (Tab, Enter, Escape).
- [ ] Focus is not permanently trapped; focus returns to trigger after modal/drawer closes.
- [ ] Dynamic content updates use `aria-live` where screen reader announcement is needed.
- [ ] Color is not the only indicator of state — also use icon, label, or badge.

## React component quality

- [ ] Component has a single clear responsibility. Split if >150 lines or doing data-fetch + render.
- [ ] No `any` types — use `unknown` and narrow, or define a proper interface.
- [ ] Props typed with `interface` (not `React.FC`).
- [ ] Custom hooks extract non-trivial logic — hooks return data/callbacks, never JSX.
- [ ] `useCallback` / `useMemo` used only where a real re-render problem exists — not preemptively.
- [ ] Zustand selectors are narrow (select a slice, not the whole store).
- [ ] `useState` / `useReducer` is the default; reach for context or Zustand only when state escapes the component.
- [ ] Loading, error, and empty states all rendered (not just happy path).

## Next.js App Router

- [ ] `'use client'` only on leaf components that need hooks/state/events — not high in the tree.
- [ ] Server Components fetch data directly (no `useEffect` for initial data).
- [ ] Server Component-fetched data is passed to Client Components via props.
- [ ] `loading.tsx` / `error.tsx` provided for routes with async data.
- [ ] No `getServerSideProps` — does not exist in App Router.

## TypeScript

- [ ] No `any` — use `unknown` and type-narrow, or define the type.
- [ ] No `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why.
- [ ] Event handlers typed explicitly (`React.ChangeEvent<HTMLInputElement>`, not `any`).
- [ ] `useRef` typed precisely: `useRef<HTMLButtonElement>(null)` — not `useRef<any>`.

## Performance

- [ ] No unnecessary re-renders — large list items are not re-mounting on every parent state change.
- [ ] Large or async components use `React.lazy` + `Suspense` (e.g., modals, settings panels).
- [ ] Lists >50 items use virtualization or load-more — not rendered all at once.
- [ ] `useReducedMotion` checked for motion-heavy components.
- [ ] New images use `next/image` with `width`/`height` or `fill` layout.

## Security / config

- [ ] No secrets in client code — only `NEXT_PUBLIC_*` env vars allowed client-side.
- [ ] New external domains added to `next.config.js` CSP and `images.remotePatterns`.
- [ ] No user-supplied values interpolated directly into shell commands, SQL, or eval.

## Styling

- [ ] No hardcoded hex colors — use semantic tokens or `brand.*` colors.
- [ ] No inline `style={{}}` for colors/spacing when Chakra props exist.
- [ ] Dark mode tested — no invisible text, invisible borders, or broken contrast.
- [ ] Responsive: works on mobile (360px+) and desktop — no horizontal scroll on mobile.

## Hygiene

- [ ] `npm run lint` passes with no errors.
- [ ] `npm run build` passes with no type errors.
- [ ] No `console.log` left in production paths (only intentional debug logs).
- [ ] No commented-out code blocks — remove dead code.
- [ ] No unused imports.
