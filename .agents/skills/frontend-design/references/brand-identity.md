# Stacked Poker — Brand Identity System

This is the source of truth for the Stacked visual identity. Every UI decision in this repo should trace back to these principles.

---

## Brand personality

**Stacked** is a premium crypto-native poker platform. The brand sits at the intersection of:

- **High-stakes elegance** — the composure of a serious poker table
- **Web3 modernity** — crypto-native, wallet-first, on-chain identity
- **Approachable confidence** — not intimidating, but not casual either

Think: private poker club with a digital-native audience. Not a Vegas casino. Not a mobile casual game.

---

## Color system

### Primary palette

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary navy | `brand.navy` | `#334479` | Primary text, backgrounds, anchoring color |
| Deep navy | `brand.darkNavy` | `#0B1430` | Deep backgrounds, hero sections, contrast |
| Accent pink | `brand.pink` | `#EB0B5C` | CTAs, focus rings, hover states, alerts |
| Success green | `brand.green` | `#36A37B` | Wins, positive actions, confirmations |
| Chip yellow | `brand.yellow` | `#FDC51D` | Chips, highlights, warnings, rewards |
| Light surface | `brand.lightGray` | `#ECEEF5` | Light mode surfaces, subtle borders |

### Color usage ratios

- **70% navy/charcoal** — backgrounds and containers dominate
- **20% light gray/white** — text and surfaces for contrast
- **10% pink/green/yellow** — accents should feel intentional, not scattered

### Color do-nots

- Never use pink for success or green for errors
- Never pair pink and yellow as equal-weight accents (one must dominate)
- Never use `legacy.*` colors for new components — these are being phased out
- Never hardcode hex — always use `brand.*` or semantic tokens

---

## Typography

### Font family

**Poppins** — used for all text. Set globally via `var(--font-poppins)`.

### Type scale (Chakra defaults + overrides)

| Role | Component | Weight | Size guidance |
|------|-----------|--------|---------------|
| Page title | `Heading as="h1"` | Bold (700) | `2xl`-`3xl` |
| Section heading | `Heading as="h2"` | Semibold (600) | `lg`-`xl` |
| Subsection | `Heading as="h3"` | Medium (500) | `md`-`lg` |
| Body text | `Text` | Regular (400) | `sm`-`md` |
| Caption / label | `Text variant="secondary"` | Regular (400) | `xs`-`sm` |
| Stat number | `Text` | Bold (700) | `xl`-`3xl` |

### Typography rules

- Headings are always **sentence case** (not Title Case, not ALL CAPS)
- Use `text.primary` for main content, `text.secondary` for supporting
- `text.muted` (`gray.400`/`gray.500`) only for tertiary info
- Never use custom `letterSpacing` or `lineHeight` without checking the theme first

---

## Surface system

### Card hierarchy

| Level | Shadow | Background | Use |
|-------|--------|------------|-----|
| Elevated | `glass` | Semi-transparent white/dark | Primary cards, modals, popovers |
| Elevated hover | `glass-hover` | Same + brightness shift | Interactive cards on hover |
| Flat | `default` | `card.white` / `card.darkNavy` | Standard content containers |
| Featured | `card.hero` | `card.heroBg` | Hero sections, featured content |
| Accent glow | `glow-green` / `glow-pink` / `glow-yellow` | Varies | Winning states, CTAs, chip displays |

### Glassmorphism recipe

```tsx
<Box
  bg="rgba(255, 255, 255, 0.08)"
  backdropFilter="blur(16px)"
  borderRadius="xl"
  border="1px solid"
  borderColor="whiteAlpha.100"
  boxShadow="glass"
  _hover={{ boxShadow: 'glass-hover' }}
/>
```

In dark mode, increase the white opacity to `0.06-0.12`. In light mode, use `rgba(255, 255, 255, 0.6-0.8)`.

---

## Spacing & layout

### Spacing scale

Follow Chakra's 4px base grid. Common spacings:

| Context | Value | Chakra prop |
|---------|-------|-------------|
| Tight (inline elements) | 4-8px | `1`-`2` |
| Default (card padding) | 16-24px | `4`-`6` |
| Section gaps | 32-48px | `8`-`12` |
| Page margins | 16-32px | `4`-`8` (responsive) |

### Layout principles

- **Content-width constraint**: Use `Container maxW="container.xl"` for page content
- **Mobile-first responsive**: Start with mobile layout, expand for larger screens
- **Portrait/landscape**: Poker table components must handle both orientations via `@media (orientation: ...)`
- **Breathing room**: Prefer generous padding over cramped layouts — the premium feel comes from space

---

## Iconography & imagery

- Use **react-icons** for standard icons (consistent set across the app)
- Poker-specific graphics (cards, chips, table) use custom SVGs or the existing component library
- Icons should be `currentColor` to inherit text color tokens
- Avoid icon-heavy UI — prefer text labels with subtle icon accents

---

## Dark mode (primary) vs Light mode

The app is **dark-mode-first**. Design and test in dark mode, then verify light mode.

### Dark mode signature

- Deep navy/charcoal backgrounds (`bg.charcoal`, `brand.darkNavy`)
- White/light gray text (`text.primary` resolves to white)
- Colored accents pop against dark surfaces
- Glassmorphism surfaces with subtle white-alpha borders
- Glow shadows visible and impactful

### Light mode adaptation

- Light gray/white backgrounds (`bg.default`, `card.white`)
- Dark navy text (`text.primary` resolves to `brand.darkNavy`)
- Accents still use `brand.pink`/`brand.green`/`brand.yellow` (same tokens)
- Glassmorphism uses higher opacity whites
- Glow shadows still present but more subtle

### Mode-specific overrides

When the semantic token doesn't cover your case:
```tsx
// Preferred
<Text color={useColorModeValue('brand.navy', 'white')}>...</Text>

// Or inline
<Box _dark={{ bg: 'whiteAlpha.100' }} _light={{ bg: 'gray.50' }}>...</Box>
```

**Never modify `app/theme.ts` semantic tokens for a single component's needs.**
