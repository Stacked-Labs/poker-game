# Chakra component patterns (repo-facing)

## General

- Keep components small; extract helpers when logic gets dense.
- Prefer typed props (`type FooProps = { ... }`) and follow nearby file conventions.
- Match existing import style and Chakra composition patterns in nearby components.

## Layout

- Use `Flex` for alignment, `Grid` for complex layouts, and avoid deep nesting.
- Use `Stack`, `HStack`, `VStack` for consistent spacing.

## A11y defaults

- All `IconButton` must have `aria-label`.
- Don’t rely on color alone; use icons/labels/badges for state.
- Ensure focus states are visible (Chakra defaults are usually fine unless overridden).

## Toasts

- Prefer the repo toast helper when available: `app/hooks/useToastHelper.ts`.
- Keep toast messages actionable (“what happened” + “what to do next”).

## Client components

Most components under `app/components/` are client components. Use `use client` only when needed (hooks/state/effects).

