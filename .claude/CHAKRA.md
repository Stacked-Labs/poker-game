# Chakra UI Conventions — Stacked Poker

This repo uses **Chakra UI v2.8** (`@chakra-ui/react@^2.8.1`) with Emotion. The v2 API is `extendTheme` + semantic tokens + `defineStyleConfig`. Do not use v3 syntax (`createSystem`, `defineConfig`, `data-theme`) — it will not work here.

When working on UI, follow these rules. They override generic Chakra advice.

---

## 1. The Token Rule (most important)

> **NEVER modify a shared semantic token in `app/theme.ts` to change styling for a single component.**

Tokens are app-wide. Changing one affects every consumer. If you want to tweak one component:

- One-off dark-mode change → `_dark={{ color: '...' }}` directly on the component
- One-off light/dark pair → `useColorModeValue('light', 'dark')` in the component
- Repeated pattern across many components → *then* add a new semantic token (and explain why in the PR)

Adding a new token is a deliberate act, not a shortcut. If you find yourself thinking "I'll just bump `text.primary` to fix this one card," stop.

---

## 2. Use existing brand colors and variants — don't invent

The theme is the source of truth. Before writing `color="#..."` or `bg="gray.700"`, check what already exists.

**Brand palette** (`colors.brand.*`):
`navy` `#334479` · `darkNavy` `#0B1430` · `pink` `#EB0B5C` · `green` `#36A37B` · `yellow` `#FDC51D` · `yellowDark` `#B78900` · `lightGray` `#ECEEF5`

**Semantic token namespaces** (use these instead of raw colors when possible):
`bg.*` (default, surface, charcoal, navbar, letterbox, scrollIndicator) ·
`text.*` (primary, secondary, white, gray600, gray700, muted) ·
`btn.*` (border, selected, hover, lightGray) ·
`input.*` (white, lightGray) ·
`card.*` (white, darkNavy, lightGray, heroBg, heroInnerBg) ·
`chat.*` (border, rowEven/Odd, rowEvenHover/OddHover, scrollThumb, scrollThumbHover)

**Existing Button variants** (prefer these over custom `sx`):
`greenGradient` · `outlineSuccess` · `outlineMuted` · `themeButton` · `social` · `underlined` · `raiseActionButton` · `navLink` · `homeSectionButton` · `connectButton` · `emptySeat` · `gameSettingsButton` · `homeNav`

**Existing Input variants:** `outlined` · `white` · `takeSeatModal` · `settings`
**Existing Text variants:** `secondary` · `seatText` · `statSubHead` · `statBody`
**Existing Alert variants:** `solidCompact`

If a new variant is appropriate, add it to `theme.ts` via `defineStyleConfig` rather than inline-styling at the call site.

---

## 3. Layout primitives over `<div>`

Use `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Grid`, `SimpleGrid`. Only drop to a raw `div` for portals or third-party integration points.

For spacing: prefer the `gap`, `p`, `m` shorthands and the spacing scale (`4`, `6`, `8`) over arbitrary `px`. Reach for arbitrary px only when matching a designer's pixel-exact value.

---

## 4. Responsive — array/object syntax, not media queries

```tsx
<Box p={[4, 6, 8]} fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} />
```

Breakpoints in this theme: `sm 480` · `md 768` · `lg 992` · `xl 1280` · `2xl 1536`.

Mobile-first: the first value is base. Don't write `@media` blocks in Emotion.

---

## 5. Light and dark modes (both first-class)

`initialColorMode` is **light**. Both modes are first-class — never design or review a screen in only one. Most semantic tokens already define `{ default, _dark }` pairs in `theme.ts`; if you use them, dark mode is free.

For component-level overrides: `_dark={{ ... }}` prop. For derived values (e.g., picking an icon variant): `useColorModeValue(light, dark)`.

Before declaring UI work done, **verify in both modes**. The most common slip is shipping a fix that looks great in one and breaks contrast or feels off-mood in the other. Toggle the theme and look.

Never branch on `colorMode === 'dark'` in render logic when a token or `_dark` prop will do.

---

## 6. `sx` is a last resort

Order of preference:
1. Style props (`bg`, `color`, `p`, `fontSize`, …)
2. Existing component variant
3. New variant added to `theme.ts`
4. `sx={{}}` only for selectors Chakra props can't express (`&::-webkit-scrollbar`, `& > *:nth-of-type(2)`, etc.)

If you reach for `sx` to set a color, you're skipping step 1.

---

## 7. Accessibility defaults

- Every interactive element has a visible focus state (Chakra defaults are fine — don't disable them)
- Icon-only buttons get `aria-label`
- Color is never the only signal for state (pair with icon, weight, or text)
- Toasts go through `useToastHelper` (in `app/hooks/`) — don't call `useToast` directly

---

## 8. Buttons — disabled & loading states (Chakra gotcha)

Chakra v2's framework `Button.baseStyle` ships with this default:

```js
_hover: { _disabled: { bg: 'initial' } }
```

(See `node_modules/@chakra-ui/theme/dist/esm/components/button.mjs`.) Hovering a disabled button resets `background-color` to transparent, wiping the chip on any solid-fill variant. `:hover:disabled` outranks `:disabled` in CSS specificity, so you can't out-cascade it from a variant's `_disabled.bg`.

**Our fix lives in `app/theme.ts` → `Button.baseStyle`** as a shared `_disabled` / `_loading` block:

- `pointerEvents: 'none'` — load-bearing. `:hover` never fires on the button, so the bg-reset never runs. Wrapping `Tooltip`s still work because they listen on the parent element.
- `filter: saturate(...) brightness(...)` — desaturates the live variant uniformly across solid fills, outlines, and text-only variants. No per-variant rewrites.
- **Never `opacity`** — on light-mode bg it lets the page color bleed through and the chip visually disappears.

**When working on buttons:**
- Don't add bespoke `_disabled` / `_loading` blocks per variant unless the shared baseStyle treatment genuinely doesn't fit. Variants describe the *live* state; the baseStyle owns disabled/loading.
- Don't pass `opacity` / `cursor` / raw HTML `disabled={...}` directly on a `<Button>` consumer — they clobber the variant. Use `isDisabled` and `isLoading`.
- If you remove `pointerEvents: 'none'`, expect every solid-fill disabled button in the app to flash transparent on hover.

---

## 9. Don't fight the design system

Smell tests that mean you're going off-rails:
- `style={{ ... }}` on a Chakra component (use props)
- Hex codes inline that aren't in `colors.brand` (add to theme or use a token)
- `useMediaQuery` for layout (use responsive props)
- A new wrapper component whose only job is to inject `sx` (make it a variant)
- Re-implementing a token's light/dark pair inline (use the token)

When in doubt, read `app/theme.ts` first.
