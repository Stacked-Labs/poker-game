# Theme and tokens (repo-specific)

## Where it lives

- Theme entry: `app/theme.ts`
- Providers: `app/providers.tsx` wraps `ChakraProvider` and global toast defaults.

---

## Token usage rules

1. **Semantic tokens first** — use `text.primary`, `bg.navbar`, `chat.border`, etc. They adapt to dark/light automatically.
2. **Brand colors second** — use `brand.navy`, `brand.pink`, `brand.green`, `brand.yellow` for explicit brand color usage.
3. **Never hardcode hex values** — even one-offs should use the nearest token or `brand.*` color.
4. **Avoid `legacy.*` colors** for new work — these are being phased out.

---

## Breakpoints

```
sm:  480px  (30em)
md:  768px  (48em)
lg:  992px  (62em)
xl:  1280px (80em)
2xl: 1536px (96em)
```

Use responsive arrays: `fontSize={['sm', null, 'md', 'lg']}` (base → sm → md → lg).
Use object syntax for clarity: `display={{ base: 'none', md: 'flex' }}`.

---

## Color tokens

### Brand colors (explicit, non-adaptive)

| Token | Value | Use |
|-------|-------|-----|
| `brand.navy` | `#334479` | Primary brand navy |
| `brand.darkNavy` | `#0B1430` | Deep navy backgrounds, text |
| `brand.lightGray` | `#ECEEF5` | Light surfaces, borders |
| `brand.pink` | `#EB0B5C` | Accent, CTAs, focus rings |
| `brand.green` | `#36A37B` | Success, positive action, glow |
| `brand.yellow` | `#FDC51D` | Warning, highlight, chips |
| `brand.yellowDark` | `#B78900` | Yellow hover/active states |

### Semantic text tokens (adapt to mode)

| Token | Light | Dark |
|-------|-------|------|
| `text.primary` | `brand.darkNavy` | `white` |
| `text.secondary` | `brand.navy` | `brand.lightGray` |
| `text.white` | `white` | `brand.lightGray` |
| `text.muted` | `gray.500` | `gray.400` |

### Semantic background tokens

| Token | Light | Dark |
|-------|-------|------|
| `bg.default` | light gray gradient | dark gray gradient |
| `bg.surface` | `legacy.grayDark` | `legacy.grayDarkest` |
| `bg.charcoal` | `#171717` | `#171717` |
| `bg.navbar` | `rgba(255,255,255,0.8)` | `rgba(dark,0.8)` |

### Card tokens

| Token | Use |
|-------|-----|
| `card.white` | Standard light card |
| `card.darkNavy` | Dark featured card |
| `card.lightGray` | Neutral surface |
| `card.heroBg` | Hero/feature card |
| `card.heroInnerBg` | Inner card within hero |

### Input tokens

| Token | Use |
|-------|-----|
| `input.white` | White background inputs |
| `input.lightGray` | Light gray background inputs |

### Button tokens

| Token | Use |
|-------|-----|
| `btn.lightGray` | Muted button background |
| `btn.selected` | Selected state |
| `btn.hover` | Hover state |

### Border tokens

| Token | Use |
|-------|-----|
| `border.lightGray` | Standard card/input borders |

### Chat UI tokens

| Token | Use |
|-------|-----|
| `chat.border` | Chat container border |
| `chat.rowEven` / `chat.rowOdd` | Alternating row backgrounds |
| `chat.rowEvenHover` / `chat.rowOddHover` | Row hover states |
| `chat.scrollThumb` / `chat.scrollThumbHover` | Scrollbar styling |

### Semantic shadow tokens

| Token | Use |
|-------|-----|
| `chat.inputFocus` | Chat input focus ring |
| `card.hero` | Hero card layered shadow |

---

## Shadow tokens

| Token | Use |
|-------|-----|
| `default` | Standard card/container shadow |
| `glass` | Glassmorphism surfaces |
| `glass-hover` | Glassmorphism hover state |
| `glass-active` | Glassmorphism active/pressed |
| `glow-green` | Green glow (winning, success) |
| `glow-pink` | Pink glow (accent, selected) |
| `glow-yellow` | Yellow glow (chips, highlights) |
| `btn-premium` | Premium button shadow |
| `btn-premium-hover` | Premium button hover shadow |

---

## Typography

- Font family: `var(--font-poppins), system-ui, sans-serif` (both heading and body)
- Default text color: `text.primary`

Available `Text` variants: `secondary`, `seatText`, `statSubHead`, `statBody`.

---

## Component variants quick reference

### Button variants

```tsx
variant="greenGradient"     // Primary CTA — green gradient + glow on hover
variant="outlineSuccess"    // Secondary confirm — white bg, green outline
variant="outlineMuted"      // Neutral — gray bg, text.primary
variant="base"              // Dark bg, white border
variant="raiseActionButton" // Poker actions (raise, call) — navy + green hover
variant="social"            // Social/auth — btn.lightGray, lift on hover
variant="navLink"           // Nav items — uppercase, pink hover
variant="themeButton"       // Transparent — pink hover
variant="homeNav"           // Home sections — large, slide animation
variant="underlined"        // In-line text link
variant="emptySeat"         // Dashed border placeholder
variant="gameSettingsButton"// Settings — light gray, navy hover
```

### Input variants

```tsx
variant="white"          // White bg, 40px, pink focus ring
variant="takeSeatModal"  // Light gray bg, 56px, green hover, pink focus
variant="settings"       // White bg, green hover, pink focus
variant="outlined"       // Charcoal bg
```

---

## CRITICAL: Never modify a shared token for a component-specific change

When a specific component needs a different color in dark mode (or any mode), **do NOT change the semantic token value in `theme.ts`**. Semantic tokens are shared across the entire app — changing one affects every component that uses it.

Instead, override the color **directly on the component** using Chakra's `_dark` pseudo-prop or `useColorModeValue`:

```tsx
// WRONG — changes color for ALL components using text.muted
// (in theme.ts) 'text.muted': { default: 'gray.500', _dark: 'orange.300' }

// RIGHT — scoped override on the specific component
<Text color="text.muted" _dark={{ color: 'orange.300' }}>Label</Text>

// Also acceptable:
const mutedColor = useColorModeValue('gray.500', 'orange.300');
<Text color={mutedColor}>Label</Text>
```

**Rule of thumb:** If the change is only for one component or one section, override at the component level. Only modify `theme.ts` tokens when you intentionally want to change the color app-wide.

---

## Adding a new semantic token

1. Add under `semanticTokens.colors` in `app/theme.ts`.
2. Always provide both `default` (light) and `_dark` values.
3. Use it in components instead of hardcoded values.
4. Update this reference file with the new token.

---

## Responsive API

- Responsive prop arrays: `px={[2, 4, 6]}`
- Object syntax: `display={{ base: 'none', md: 'flex' }}`
- Only use orientation media queries when UI truly needs portrait vs landscape behavior.
