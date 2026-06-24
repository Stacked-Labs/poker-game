# DESIGN.md — Stacked Visual System (poker-game)

> **SCOPE BANNER.** This file governs **PIXELS** — color, type, elevation, motion, components — for the poker-game client. It does **not** govern voice, audience stance, terminology, or product claims. For those, the **Stacked-Consultant brand brain** (`../Stacked-Consultant/brand/`) is the single source of truth and **overrides this file on anything player-facing**. Every rule below is tagged **[TABLE]**, **[MARKETING]**, or **[BOTH]** so you always know where it applies.

---

## 0. How to use this doc

- **Scope tags.** `[TABLE]` = the live game surface (`/table/[id]`). `[MARKETING]` = the public homepage, lobby, and any marketing-adjacent surface. `[BOTH]` = the shared substrate (tokens, type, motion, a11y) that holds everywhere. If a rule is untagged, treat it as `[BOTH]`.
- **The brand brain wins on voice/claims.** Copy, terminology ("platform fee" never "rake"; never "Banker"; Free Play vs. real-money), audience framing, and what we may or may not claim live in `../Stacked-Consultant/brand/` (`identity.md`, `voice-and-tone.md`, `visual-identity.md`). This file does not restate or override them. When in doubt about *words*, go there.
- **The live light homepage wins over this doc for marketing.** Per `visual-identity.md`, the homepage's light look is the canonical reference for the marketing visual world. If a marketing asset and this doc ever disagree, sample the homepage and update this file — don't drift the asset.
- **`theme.ts` wins over this doc for tokens.** Every hex and token name here is synced from `app/theme.ts`. If they diverge, `theme.ts` is right and this file is stale — fix the doc.

---

## 1. Two surfaces, two registers

Stacked is one product with two visual jobs. The mood that's right at the table is wrong in marketing, and vice versa. Don't apply one register everywhere.

### 1a. `[TABLE]` — `/table/[id]` (the product)

The live game surface. **Strict product discipline**: every pixel earns its place under decision pressure. The crypto-fluent, intimate, **dark-mood-first-class** register lives here — wallets, USDC, Base, and onchain settlement are spoken without translation because this is where a seated player already is. Warm, lived-in, low-distraction. Light and dark are both first-class (`initialColorMode: 'light'`), but the table is the one place the dark, intimate mood is fully at home rather than reined in.

### 1b. `[MARKETING]` — `/` + lobby (the front door)

The homepage, lobby, and marketing surfaces. **Recreational-first**: the default reader is a poker player who has never touched crypto. The **light look is mandatory** here — clean, calm, trustworthy, lots of breathing room, never crypto-dark / neon / "to the moon." The brand brain governs this surface's voice and feel; `visual-identity.md` makes the light look a firm, non-negotiable rule. Personality, motion, and color carry weight in the lobby, but inside the light register, not against it.

> This is the single biggest correction from the previous DESIGN.md: it applied the dark, crypto-native, "penthouse 3am" mood across the *whole* product including marketing. That collides with the brand brain. **Stop steering marketing dark.** Marketing is light-first, recreational-first, brand-brain-governed.

---

## 2. Color — one token table

There is **one** color vocabulary: the code token name from `app/theme.ts`. The poetic nickname is a secondary column for prose only. Do **not** invent a third set of names. Call sites use **semantic tokens** (`bg.*`, `text.*`, `card.*`, `chat.*`); reach for raw `brand.*` only inside `theme.ts`.

### Brand colors (`colors.brand.*` in `theme.ts`)

| Code token | Nickname | Hex | Mode | Allowed where | Surface |
|---|---|---|---|---|---|
| `brand.darkNavy` | Penthouse Midnight | `#0B1430` | both | The ground of the room: hero/felt grounds, primary text in light mode, deepest card surfaces | [BOTH] |
| `brand.navy` | Velvet Navy | `#334479` | both | Secondary ground; raise-preset chips; secondary text; chat scroll thumb | [BOTH] |
| `brand.navy.80` | Velvet Navy 80% | `rgba(51,68,121,.8)` | both | Translucent navy fills | [BOTH] |
| `brand.pink` | Neon Stake | `#EB0B5C` | both | Signature accent — see Neon Stake Rule below. Focus rings on inputs, single most-important action, brand mark | [BOTH] |
| `brand.pinkDark` | Neon Stake (pressed) | `#C00A4D` | both | Pressed/hover state of pink controls | [BOTH] |
| `brand.pinkEdge` | Neon Stake (edge) | `#950839` | both | Bottom edge of `tactileDestructive` chip | [BOTH] |
| `brand.green` | Felt Green | `#36A37B` | both | Money in motion: confirm/call/win, default brand CTA (`tactilePrimary`) | [BOTH] |
| `brand.greenDark` | Felt Green (pressed) | `#2A8463` | both | Pressed state of green CTAs | [BOTH] |
| `brand.greenEdge` | Felt Green (edge) | `#22674E` | both | Bottom edge of `tactilePrimary` / `tactileOutline` | [BOTH] |
| `brand.yellow` | Chip Yellow | `#FDC51D` | both | High-stakes / tournament / celebratory (`tactileGold`), gold tier | [BOTH] |
| `brand.yellowDark` | Chip Yellow Deep | `#B78900` | both | Pressed/hover gold; gold-tier text in light | [BOTH] |
| `brand.yellowEdge` | Chip Yellow (edge) | `#8A6A00` | both | Bottom edge of `tactileGold` | [BOTH] |
| `brand.lightGray` | Cold Light | `#ECEEF5` | both | Soft card grounds (light), input grounds, secondary text (dark), app ground (light) | [BOTH] |
| `brand.base` | Base Blue | `#0052FF` | both | The Base network mark only | [BOTH] |
| `brand.usdc` / `usdcDark` / `usdcEdge` | USDC Blue | `#2775CA` / `#1C5A99` / `#164A7F` | both | USDC chips/badges and their tactile edges | [BOTH] |
| `brand.telegram` / `telegramDark` / `telegramEdge` | Telegram Blue | `#0088CC` / `#0077B5` / `#006A9D` | both | `tactileTelegram` community CTA only | [MARKETING] |

### Neutrals (warm — `colors.charcoal.*`, `colors.black.*`, `colors.legacy.*`)

| Code token | Nickname | Hex | Allowed where |
|---|---|---|---|
| `charcoal.400` / `.600` | Ash Charcoal | `#363535` | Input fields, chat row grounds (dark mode) |
| `charcoal.800` | Black Ash | `#262626` | Deeper chat rows, tertiary card surfaces (dark); default `Text` color |
| `black.dark` / `legacy.grayDark` | Ink | `#191414` | Body background (dark) |
| `legacy.grayDarkest` | Ink Deep | `#121212` | The absolute floor: `<html>` and pre-render scrim (dark) |
| `legacy.grayLight` | Surface Night | `#212121` | Dark-mode card surfaces |
| `bg.charcoal` (token) | Surface Night | `#171717` | Hero card inner background; default `Button` ground |

Letterbox bands and most surfaces are reached through **semantic tokens** (`bg.letterbox` → `#D8D8DD` light / `#141418` dark, etc.), not raw hex.

### Named color rules

- **The Neon Stake Rule `[BOTH]`.** `brand.pink` (`#EB0B5C`) is rare on purpose. Default allowed uses: input focus rings, the brand mark, and the **single** most-important action per view. Never on body text, never as a gradient, never as a decorative stripe. **Documented, deliberate exceptions** (don't "fix" these): the `navLink` desktop-nav hover shifts to pink — the lobby-nav signature; and `themeButton` (the mode toggle) hovers to pink. Both are the one place pink is the nav-voice highlight. `tactileDestructive` uses a pink *outline* (never a solid pink fill).
- **The No Pure Black / No Pure White Rule `[BOTH]`.** `#000` and `#fff` are forbidden as design colors. `white` is allowed only incidentally (button text on saturated fills). For darks, reach for Penthouse Midnight, Ink, or Ink Deep; for lights, Cold Light or `white` card grounds.
- **The Warm-Neutrals Rule `[BOTH]`.** Both modes run warm, never cool fintech gray. The muted text ramp is the warm navy-slate `text.gray600` / `text.muted` / `text.gray700` tokens (verified AA against their grounds) — **not** Chakra's cool `gray.500/700`, which is legacy debt in both modes.

---

## 3. Typography `[BOTH]`

**One family: Poppins** (`var(--font-poppins), system-ui, sans-serif`), for everything — display and body. Hierarchy comes from **weight and scale**, never a second family.

| Role | Weight | Size | Notes |
|---|---|---|---|
| Display | 800 | `clamp(2rem, 6vw, 4rem)`, lh 1.05, ls `-0.02em` | Hero headlines on `/` and marketing **[MARKETING]**. Never inside the table. |
| Headline | 700 | `clamp(1.5rem, 3.5vw, 2.25rem)`, lh 1.15 | Lobby/stats section headers. |
| Title | 700 | `1.25rem`, lh 1.3 | Card and modal titles. |
| Body | 500 | `1rem`, lh 1.5 | Default paragraph; cap 65–75ch on text-heavy surfaces. |
| Label | 700 | `0.75rem`, ls `0.03em`, often UPPERCASE | Action labels (CALL / RAISE / FOLD), stake badges, table metadata. |

`fontWeights` in `theme.ts`: body/normal 500, medium/semibold 600, bold/heading 700, extrabold 800, black 900. `Heading` baseStyle carries `letterSpacing: -0.02em`.

**Named rules.** *One-Family Rule* — Poppins only; if a screen feels flat, raise the weight or size delta, not the family count. *Tight-Headline Rule* — headings carry `-0.02em` tracking. *Mobile-First-Type Rule* — display and headline sizes are `clamp()`-bound; never hard-code a fixed hero size, phones are primary.

> **Note `[BOTH]`.** The previous DESIGN.md's YAML frontmatter named these roles `display/headline/title/body/label` with exact pixel specs. Those specs are accurate and preserved above; the frontmatter block itself is dropped to keep one source per fact.

---

## 4. Elevation `[BOTH]`

Depth is **tonal-first**: stack warm-dark surfaces (Surface Night on Ink, Ink Deep below) rather than reaching for shadows. Surfaces separate by tone; shadows are a small, reserved vocabulary.

### Shadow vocabulary (current — all live in `theme.ts`)

| Token | Where | Value (abbrev.) |
|---|---|---|
| `shadows.default` | Quiet ambient lift; default Chakra component shadow. Use sparingly. | `0 0 8px rgba(0,0,0,.15)` |
| `card.hero` (semantic) | Signature hero-card lift on `/`. Layered + hairline outline. Reserved. | light `0 25px 80px…, 0 0 0 1px rgba(255,255,255,.9)` / dark equivalent at `.05` hairline |
| `card.lift` / `card.liftHover` (semantic) | Standard card lift + hover. Replaces the removed `glass` tokens. | `0 8px 24px` → `0 14px 36px`, mode-aware |
| `focus.ring` (semantic) | The one focus-ring recipe for interactive controls. | `0 0 0 3px rgba(54,163,123,.35)` (green) |
| `chat.inputFocus` (semantic) | Chat input focus ring — Velvet Navy, 2px, no blur. | `0 0 0 2px rgba(51,68,121,.2)` |

### Removed debt (closed list — do not warn about these as if live)

These tokens were **deleted** from `theme.ts` (zero consumers; see the comment at `shadows`, ~line 1200). They are gone, not lurking. Do not reintroduce them; do not write warnings implying they still exist:

- `glass` / `glass-hover` / `glass-active` — glassmorphic ambient stacks → replaced by `card.lift` / `card.liftHover`.
- `glow-green` / `glow-pink` / `glow-yellow` — colored glows.
- `btn-premium` / `btn-premium-hover` — premium-button shadow stack.

### Named rules

- **Tonal-First Rule.** Build depth by stacking warm-dark tones first; reach for shadow only when tone can't separate two surfaces.
- **No-Glow Rule.** No colored `boxShadow` glows (`0 0 20px rgba(...,.4)` etc.). Edge shadows and the structural tokens above only. (The old glow tokens are removed, per above.)
- **Hairline-Outline Rule.** When a card needs more than tone (the hero card), pair the shadow with a `0 0 0 1px` warm-white hairline at low opacity — that's what makes the lift read architectural, not fluffy.

---

## 5. Motion `[BOTH]`

Motion is human, not robotic: bets settle, chips have weight, deals have rhythm. The shared vocabulary lives in `theme.ts → transition`, exposed as CSS vars (`var(--chakra-transition-easing-snap|settle)`, `…duration-snap|settle`):

- **`snap`** — `cubic-bezier(0.4, 0, 0.2, 1)`, `80ms`. The tactile press curve (transforms, edge collapse).
- **`settle`** — `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo, deceleration, **no overshoot**), `220ms`. For arrivals and color shifts. **No bounce / elastic.**

**Named rules.**
- **Press-not-lift.** Hover never lifts (`translateY(-Npx)`) and never scales (`scale(1.0X)`); hover changes color, bg-tint, or border only. **Press** is the only animated affordance — `translateY(1–2px)` with the bottom edge collapsing.
- **Reduced-motion.** `theme.ts` global styles honor `prefers-reduced-motion: reduce` app-wide (animations/transitions clamped to `0.01ms`). Chip, deal, and ambient motion must each have a toned-down path that **preserves causality** — the player still sees cause and effect, just without the flourish.

---

## 6. Components

All variants below are real and live in `app/theme.ts`. The full per-property button recipe, the `Button.baseStyle` disabled/loading rule, and the `<ExternalLink>` / `<PlayerNameLink>` / `<SocialIconButton>` recipes live in **`.claude/CHAKRA.md`** (§10–§11).

### Buttons — the tactile chip mechanic `[BOTH]`

Every CTA is a **tactile chip**: hairline top highlight, colored bottom edge, presses by sinking 1–2px while the edge collapses. Hover changes color or bg-tint only — never a lift, glow, or scale. `snap` (80ms) on transform, slightly slower on color shifts.

| Variant | Tag | What it is |
|---|---|---|
| `tactilePrimary` | [BOTH] | Solid Felt Green CTA (green → `greenDark` press, `greenEdge` rim). The default brand action. |
| `tactileOutline` | [BOTH] | Felt Green outline secondary (2px border, transparent fill, 12% green tint hover). Pairs with primary. |
| `tactileNeutral` | [BOTH] | Charcoal outline. Low-stakes secondary with no go/stop tone (e.g. "view results"). |
| `tactileDestructive` | [BOTH] | Neon Stake **outline** destructive (2px pink border, never solid pink fill). |
| `tactileTelegram` | [MARKETING] | Solid Telegram blue. Community / newsletter CTA. |
| `tactileGold` | [BOTH] | Solid Chip Yellow celebratory CTA (tournament win), dark ink text. |
| `tactileChrome` | [TABLE] | Mode-aware idle chip for table NavBar chrome clusters (settings/chat/away/leave). Dark-tint on cream / light-tint on near-black via inline `_dark`. |
| `tactileChromeSolid` | [TABLE] | Same chrome chip with a fully opaque page-toned ground — for the portrait burger menu where chips float over felt with no container. |
| `tactileGhost` | [TABLE] | Transparent in-card utility chrome (chat header X / sound / toggles). Fills `card.lightGray` on hover. Use inside card surfaces where `tactileChrome`'s chip would compete. |
| `raiseActionButton` | [TABLE] | At-table raise presets (1/2 Pot, Pot, All In, +1/+5/+10). Smaller-edge tactile recipe (solid navy chip, ~1.5px edge, `translateY(1.5px)` press) tuned for 28–40px chips on the felt. |
| `navLink` | [MARKETING] | Desktop nav links. Typography-only, transparent ground; hover shifts to Neon Stake — the **documented pink exception** (lobby-nav signature). |
| `homeNav` | [MARKETING] | Mobile drawer nav rows. Tactile row recipe (soft inset, `translateX` hover nudge), tone-tinted per section. |
| `themeButton` | [BOTH] | Mode toggle. Transparent, hover shifts text to Neon Stake (documented pink exception). |
| `underlined` | [BOTH] | Text-link button: transparent, underlined, no edge. |
| `base` / sizes | [BOTH] | Default charcoal pill; `sm`–`4xl` sizes. **Unknown/unset variants render as this charcoal pill** — there is no `link` variant; for a text link use `underlined` or `<ExternalLink>`. |

**Toggle states (idle ↔ active) `[TABLE]`.** Chrome buttons that toggle (Pause/Resume, Away/Back, Leave/Cancel) use `tactileChrome` for idle and an inline solid-tone tactile chip for active — canonical pattern in `app/components/NavBar/AwayButton.tsx`. Don't add a variant per tone permutation.

**State-aware action slot `[TABLE]`.** When a primary action goes contextually unavailable (e.g. Withdraw while seated), **replace it with the unblocking action** ("Leave seat") in the same slot rather than disabling-with-blur, mirroring the source action's full state set. Canonical: `WithdrawBalanceCard.tsx`.

### Inputs `[BOTH]`

| Variant | What it is |
|---|---|
| `white` | White ground, 2px Cold Light border, 10px radius. Focus → Neon Stake border + 1px pink outline. Default form field (newsletter, modals). |
| `takeSeatModal` | Cold Light ground (→ white on focus), 12px radius, 56px tall, 2px transparent border. Hover → Felt Green border; focus → Neon Stake + pink-tinted halo. The most expressive input; lives in the take-seat flow. |
| `settings` | White ground, Cold Light border, 8px radius. Tighter than `white`; same hover (green) / focus (pink) pattern. |
| `outlined` | **Legacy.** Charcoal ground, gray border. New work uses `white` or `settings`. |

### Cards `[BOTH]`

- **Default** (`card.white` / `card.lightGray` / `card.darkNavy`): token-driven. White or Cold Light (light) / Surface Night family (dark). Soft 8–12px radius. No shadow at rest — use `card.lift` only when a card must read raised.
- **Hero** (`card.heroBg` / `card.heroInnerBg`) `[MARKETING]`: white (light) / `rgba(23,23,23,0.95)` (dark) with a hairline outline; carries `card.hero`. Reserved for the home hero.
- **Felt** (`card.felt`): Penthouse Midnight ground in both modes — a card-room "felt" surface (newsletter, seat-pickers). The felt is the room, not a one-off color.
- **Padding:** `16px` default cards; `32px` hero. No card-interior padding below `8px`.

### The chip-pill pattern `[BOTH]`

The lobby's metadata chip is a reused pattern, not a per-instance hack. Tinted families live as semantic tokens — `bg.pillNeutral` / `border.pillNeutral` (neutral), plus tone variants `bg.greenTint`, `bg.yellowTint`, `bg.usdcTint`, `bg.navyTint`, and the single saturated `bg.hotSubtle` / `text.hot` "HOT" mark (one per row, max). Reach for these tokens; don't inline new pill hexes.

### Chat surface `[TABLE]`

Row alternation (`chat.rowEven/Odd`, Cold Light + white light / Black Ash + Ash Charcoal dark; hover ~3% lighter), hairline `chat.border`, `chat.scrollThumb` (Velvet Navy 20% light / warm-white 25% dark, thickening on hover), and the `chat.inputFocus` ring.

### Signature table elements `[TABLE]`

- **Action labels** (`CALL` / `BET` / `RAISE` / `ALL-IN`): a *typographic* component, not a button — the Label role (12px Poppins 700, uppercase, `0.03em`), transient per-seat at the table.
- **Empty seat** (`emptySeat` consumer): full-width, dashed `gray.400` border, font scaling from `~0.95rem` (mobile) up to `2.3rem` (`lg`). The "sit down" affordance is deliberately loud.

### Named component rules

- **No-Lift Hover Rule `[BOTH]`** — hover never `translateY(-Npx)` or `scale`; press is the only animated affordance.
- **Solid-Over-Gradient Rule `[BOTH]`** — confirm/primary actions resolve to solid color. The old `greenGradient` variant is gone; CTAs land on flat `tactilePrimary`.
- **Solid-Over-Glass Rule `[BOTH]`** — `backdropFilter: blur(...)` is reserved for modal overlays only; no in-button blur on chips or chrome.
- **Disabled-Visual Rule `[BOTH]`** — a muted-but-clickable button uses `opacity: .85 → 1` on hover, never `filter: blur`. A truly disabled button uses `isDisabled` and lets `Button.baseStyle._disabled` (filter desaturate + `pointerEvents: none`) own the visual.
- **44pt Tap Rule `[BOTH]`** — tap targets in the table and primary lobby flows hit 44×44pt minimum on mobile. `raiseActionButton`'s 28px floor on `base` is a deliberate exception inside the known-zoomed table layout — don't propagate it.

---

## 7. Do / Don't

| Do | Don't | Tag |
|---|---|---|
| Use Poppins for all text; hierarchy from weight/scale | Introduce a second type family | [BOTH] |
| Use semantic tokens (`bg.*`, `text.*`, `card.*`) at call sites | Introduce raw hex outside `theme.ts` | [BOTH] |
| Reach for `brand.darkNavy` / `brand.navy` grounds; Cold Light for soft surfaces | Use `#000` or `#fff` as design colors | [BOTH] |
| Reserve `brand.pink` for one key action, focus rings, the mark | Spread pink across a screen, or as gradient/stripe/body-text | [BOTH] |
| Use `brand.green` for confirm/call/win, flat | Use gradient fills or gradient text (`background-clip: text`) | [BOTH] |
| Build depth tonal-first; add `card.lift` only when needed | Add glow `boxShadow`, or reintroduce removed glass/glow/premium tokens | [BOTH] |
| Pair a reserved shadow with a 1px hairline when a card must read architectural | Add glassmorphism — decorative `backdropFilter` blur outside modal overlays | [BOTH] |
| Clamp display/headline sizes; carry `-0.02em` on headings | Hard-code a fixed hero font size | [BOTH] |
| Design and review every change in **light and dark** | Bias dark-by-default; or steer **marketing** dark/crypto-native | [BOTH] / [MARKETING] |
| Keep the marketing surface light, calm, recreational-first; sample the live homepage | Invent a separate darker/louder/"crypto" marketing skin | [MARKETING] |
| Pair color with shape/icon/text for state (suit, action, stake tier) | Encode state by color alone | [BOTH] |
| Ensure 44×44pt tap targets in table + primary lobby flows | Propagate the `raiseActionButton` 28px exception elsewhere | [BOTH] |
| Respect `prefers-reduced-motion` with a causality-preserving path | Use side-stripe borders (`border-left` > 1px as colored accent) | [BOTH] |
| Use `_dark={{}}` / `useColorModeValue()` on the component | Edit a shared semantic token in `theme.ts` to fix one component | [BOTH] |

> **Copy rules (em-dash bans, terminology, claims) are NOT in this file.** They live in the brand brain — `../Stacked-Consultant/brand/voice-and-tone.md`. This is a pixels doc; cede voice there.

---

## 8. Anti-references — do NOT look like

The room rejects what it isn't, on purpose. These hold across both registers.

- **Corporate poker rooms** (WSOP / PokerStars / ClubGG): stock-photo felt, glossy chip stacks, casino-floor red-and-gold, "professional" tone.
- **Generic crypto dashboards** (Uniswap-clone DEX): chart cards, swap gradients, generic Web3 chrome.
- **Web3 hero-page slop**: gradient meshes, glassmorphism, "Welcome to the Future" hero copy.
- **AI-generated UI**: lavender-to-pink gradients, "✨" / three-emoji headers, the hero-metric SaaS template (big number, small label, gradient accent), identical repeating card grids.
- **Chuck-E-Cheese degen**: neon for neon's sake, comic-sans energy, screaming chrome.

For `[MARKETING]` specifically, the brand brain adds its own anti-references (no crypto-dark / neon / laser-eyes / "to the moon," no FOMO/countdown devices, no fake game data) — see `visual-identity.md` and `identity.md` → *anti-positioning*. Those govern; this list complements.

---

## 9. Pointers

- **Voice, audience, terminology, claims →** `../Stacked-Consultant/brand/` (`identity.md`, `voice-and-tone.md`, `visual-identity.md`). **Single source of truth; overrides this file on anything player-facing.**
- **Color tokens (source of truth) →** `app/theme.ts` (`colors.brand.*`, `semanticTokens`, `shadows`, `transition`).
- **Chakra recipes (per-property button/input recipes, disabled rule, `<ExternalLink>` / `<PlayerNameLink>` / `<SocialIconButton>`) →** `.claude/CHAKRA.md` (§10–§11).
- **Product / register context →** `PRODUCT.md` and `CLAUDE.md` at the repo root.

---

## 10. Last synced to `theme.ts`: 2026-06-23
