# PR / merge checklist (repo-oriented)

## UX and product

- All user-visible actions have feedback (spinner/disabled state/toast).
- Error messages are actionable and don’t expose secrets.
- Copy is consistent (tone/capitalization).

## Accessibility

- `IconButton` has `aria-label`.
- Inputs have labels (or `aria-label`) and sensible `autoComplete` when applicable.
- Interactive elements are reachable via keyboard; focus is not trapped.

## Performance

- Avoid unnecessary re-renders (`useMemo`, `useCallback`, `React.memo`) only where it matters.
- Use `useReducedMotion` for heavy animation.
- Avoid large images without Next/Image considerations.

## Security/config

- No secrets in client code; only `NEXT_PUBLIC_*` is allowed client-side.
- If new external domains are used, update `next.config.js` CSP + `images.remotePatterns` as needed.

## Hygiene

- Run `npm run lint` and `npm run build` (note: husky pre-commit also enforces this).
- Keep types tight; avoid `any` unless unavoidable.

