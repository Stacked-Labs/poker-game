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

*Tactile family* — the system default; see §10 for the full recipe:
- `tactilePrimary` — solid green CTA
- `tactileOutline` — green outline secondary
- `tactileDestructive` — pink outline (never solid pink)
- `tactileTelegram` — solid telegram-blue
- `tactileChrome` — mode-aware idle chip for in-cluster chrome (NavBar, table chrome)
- `tactileGhost` — transparent in-card utility chrome (chat header, popover toggles); fills `card.lightGray` on hover

*Other current variants:*
- `raiseActionButton` — at-table raise preset chips (smaller-edge tactile, on-felt)
- `navLink` — desktop nav typography (pink hover is a documented exception)
- `homeNav` — mobile drawer nav rows
- `themeButton` — theme/mode toggle
- `outlined`, `socialIcon` — older surfaces

For toggle states (idle ↔ active), use `tactileChrome` for the idle state and inline a solid brand-tone tactile chip for the active state (see `app/components/NavBar/AwayButton.tsx` for the canonical pattern). For external links and outbound URLs, use the shared `ExternalLink` component (see §11) — don't reinvent the recipe inline.

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

---

## 10. Tactile button recipe (the system default)

Every new button variant defaults to the **tactile chip** mechanic established across the button overhaul. The variant owns the live styling; never bake size into a variant — `height`, `px`, `borderRadius`, and `size` come from the consumer.

| Property | Value |
|---|---|
| Top highlight (solid fills) | `inset 0 1px 0 rgba(255,255,255,0.18)` |
| Bottom edge (resting) | `0 2px 0 <darker-shade>` (1.5–2px depending on size) |
| Hover | `bg` shift only — **no lift, no glow, no scale** |
| Press | `translateY(2px)` (1px on chips ≤32px) + edge collapses to `0 0 0` + bg shifts to `*Dark` + `inset 0 2px 4px rgba(0,0,0,0.18)` |
| Easing | `transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease` |
| Type | weight 700, letter-spacing `0.02em` |
| Outline variant | 2px solid border in action color, transparent fill, hover bg = 12% color tint with border/text shifting to `*Dark` |

Brand edge tokens already exist for green / pink / telegram (`brand.<color>Edge`); for one-off tones (yellow `#B78900`, navy `#1B2754`, orange `#B45A0B`) inline hex is acceptable. If a tone lands in three or more places, lift it into a named brand shade.

**Disabled and loading** are owned by `Button.baseStyle` (see §8). Don't add per-variant `_disabled` / `_loading` blocks. Don't use `filter: blur(...)` for a disabled visual — it reads as broken UI. If a click target is intentionally muted but still clickable, use `opacity: 0.85 → 1 on hover` instead.

---

## 11. Standard link components

Two reusable components own the link patterns. Don't reinvent inline.

**`app/components/ExternalLink.tsx`** — for external/outbound URLs (BaseScan, contracts, docs, social rooms when not iconified).

```tsx
<ExternalLink href="https://basescan.org/...">View contract</ExternalLink>
```

Recipe: `brand.navy` rest (`brand.lightGray` dark) → hover shifts to `brand.green` with a 1.5px underline at 3px offset. Trailing `FiExternalLink` icon (default 11px, opacity 0.6 → 1) inherits color via `currentColor`. `iconSize` and Chakra `LinkProps` forward through.

**`app/components/PlayerNameLink.tsx`** — for X handles inside player identity surfaces. Identity-first: text color/weight stays unchanged on hover, only the underline appears. The `Text` baseStyle cascade (see §12) is the reason `color="text.primary"` is set explicitly inside.

**Iconified social CTAs** (Discord/Telegram/X social-row chips) use `<SocialIconButton tone="..." />` — don't wrap them with the underline-link recipe; they're already a chip affordance.

---

## 12. Chakra `Text` dark-mode cascade gotcha

`Text.baseStyle` ships a hardcoded `color: 'charcoal.800'` that wins via cascade in dark mode. A `<Text>` without an explicit `color` prop will be invisible (or near-invisible) on dark backgrounds, even when its parent sets a color.

Fix: set `color="text.primary"` (or another mode-aware token) **directly on the `<Text>`**, not on a parent. This bit us repeatedly until we made it a rule:

```tsx
<Text color="text.primary">{name}</Text>          // ✓ readable in both modes
<Box color="text.primary"><Text>{name}</Text></Box>   // ✗ baseStyle wins inside <Text>
```

`PlayerNameLink.tsx` documents this pattern at the source.

---

## 13. The Settings modal panel context

`app/components/NavBar/Settings/SettingsModal.tsx` renders `TabPanels` with `bg="rgba(255, 255, 255, 0.05)"` over a `ModalOverlay bg="rgba(11, 20, 48, 0.5)"`. The result: tab content sits on a **dark** surface in *both* light and dark mode.

Implications when working inside any Settings tab:

- **Section labels** (uppercase, letter-spaced) that render directly on the panel surface need `color="whiteAlpha.700"` — not `text.secondary`. `text.secondary` resolves to `brand.navy` in light mode, which disappears on the dark panel.
- **Cards** sitting on the panel must use **opaque** backgrounds (`card.white`, never `bg.greenSubtle` / `card.heroBg` or other semi-transparent tokens). Semi-transparent fills wash out against the dark panel.
- For the "current user" or "selected" tinted-card affordance, layer the tint on top of a solid base via `boxShadow: inset 0 0 0 9999px rgba(54, 163, 123, 0.07)` — the inset shadow gives the green tint without sacrificing opacity. See `PlayerCard.tsx` for the canonical implementation.
- Labels *inside* white cards on the panel still use `text.secondary` (their surface is light, the dark-panel rule doesn't apply).

When in doubt, check the parent surface's bg before picking a label color.

---

## 14. Numeric input pattern — block at the source

For chip / blind / amount inputs where decimals or non-digits are invalid, **don't** rely on `type="number"` and post-validate. Browsers preserve `"05"` typed input even when the parsed `Number()` doesn't change, and the controlled-value reconciler skips DOM updates when the prop value matches.

Use the string-state pattern (see `CreateGame/GameSettingLeftSide.tsx` blinds for the canonical implementation):

```tsx
const [valueStr, setValueStr] = useState<string>('5');
const value = valueStr === '' ? NaN : Number(valueStr);

<Input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={valueStr}
    onChange={(e) => {
        const raw = e.target.value;
        if (/[.,]/.test(raw)) {
            toast.warning('Whole chips only', "Blinds can't be split into decimals.", 3000, 'blinds-no-decimal');
        }
        const digits = raw.replace(/\D/g, '');
        setValueStr(digits === '' ? '' : String(Number(digits)));
    }}
/>
```

Why each piece matters:
- `type="text" inputMode="numeric"` — keeps the numeric keypad on mobile without `type="number"`'s DOM reconciliation quirk.
- String state — `String(Number(digits))` strips leading zeros at write time, and the displayed string always matches state.
- The decimal-detection branch fires a transient toast with a fixed `id` so spam keypresses don't stack notifications.


## Theming thirdweb embedded widgets

`BuyWidget`, `SwapWidget`, `ConnectButton`, and `PayEmbed` accept a `theme` prop that takes a thirdweb `lightTheme()` / `darkTheme()` object. Bridge Chakra → thirdweb at the call site:

```tsx
const { colorMode } = useColorMode();
const theme = colorMode === 'light' ? lightTheme() : darkTheme();
return <BuyWidget client={client} theme={theme} ... />;
```

Never modify the global Chakra `colorMode` to satisfy a widget — use the per-widget `theme` prop. See `app/components/TopUp/TopUpModal.tsx` for the canonical pattern.
