# Performance + accessibility patterns

## References (web)

- Next.js performance: https://nextjs.org/docs/app/building-your-application/optimizing
- Web Vitals: https://web.dev/vitals/
- WAI-ARIA authoring practices: https://www.w3.org/WAI/ARIA/apg/

## Animation

- Default to subtle transitions; avoid long/complex animations during gameplay.
- Use `useReducedMotion()` and respect user preferences.

## Lists/logs (game log, chat)

- Consider pagination/infinite loading patterns already used (e.g. `useInView` for Tenor).
- Avoid rendering huge logs in one go; prefer “load more” or consider virtualization if needed.

## Forms and controls

- Disable buttons during async actions to prevent duplicate submissions.
- Surface state in the UI (spinner, progress, badge).
