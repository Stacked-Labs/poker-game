---
name: Stacked
description: Onchain poker room. Real-money cash games settled in USDC on Base.
colors:
  penthouse-midnight: "#0B1430"
  velvet-navy: "#334479"
  neon-stake: "#EB0B5C"
  felt-green: "#36A37B"
  chip-yellow: "#FDC51D"
  chip-yellow-deep: "#B78900"
  cold-light: "#ECEEF5"
  ash-charcoal: "#363535"
  black-ash: "#262626"
  ink: "#191414"
  ink-deep: "#121212"
  surface-night: "#171717"
  letterbox-night: "#141418"
  letterbox-day: "#D8D8DD"
typography:
  display:
    fontFamily: "var(--font-poppins), system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-poppins), system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-poppins), system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-poppins), system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-poppins), system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.03em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  '2xl': "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  '2xl': "48px"
components:
  button-primary:
    backgroundColor: "{colors.surface-night}"
    textColor: "{colors.cold-light}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-confirm:
    backgroundColor: "{colors.felt-green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-confirm-hover:
    backgroundColor: "{colors.felt-green}"
    textColor: "#FFFFFF"
  button-action-raise:
    backgroundColor: "{colors.velvet-navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  button-ghost-link:
    backgroundColor: "transparent"
    textColor: "{colors.penthouse-midnight}"
    rounded: "{rounded.sm}"
    padding: "0"
  input-default:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.penthouse-midnight}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input-stake:
    backgroundColor: "{colors.cold-light}"
    textColor: "{colors.velvet-navy}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-default:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.penthouse-midnight}"
    rounded: "{rounded.lg}"
    padding: "16px"
  card-hero:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.penthouse-midnight}"
    rounded: "{rounded.2xl}"
    padding: "32px"
---

# Design System: Stacked

## 1. Overview

**Creative North Star: "The Crypto Card Room"**

Stacked is an underground card room that happens to live onchain. The room is dark, warm, intimate. The felt is real. The money is USDC. The door speaks the language of people who already hold a wallet, not the language of people we're trying to convert. This is not a casino floor and it is not a fintech dashboard. It is a confident, lived-in room where the cards move fast and the settlement is invisible until you stand up.

The aesthetic anchors on three tensions, held in balance: **product discipline at the table** (every pixel earns its place under decision pressure), **brand permission in the lobby** (personality, motion, and color carry weight), and **crypto-native fluency throughout** (wallets, USDC, Base, signing all spoken without translation). The room rejects what it isn't, on purpose: the polished WSOP corporate floor, the Uniswap-clone DEX dashboard, the gradient-mesh Web3 hero page, and the AI-rendered SaaS landing template all live somewhere else.

The current implementation carries some debt the strategic line will eventually retire: glassmorphic backdrop blurs, glow shadows, and gradient buttons exist in the codebase from earlier eras. They are documented honestly below, but they are not the system's future. New work should not extend them; existing instances are debt to remove.

**Key Characteristics:**
- **Light and dark modes are both first-class.** `initialColorMode` is `light`; semantic tokens carry full `{ default, _dark }` pairs. Every screen must be designed and reviewed in both modes before shipping. The brand mood ("warm, intimate, lived-in") applies to both — light warms toward Cold Light surfaces, dark warms toward Penthouse Midnight / Ink. Never cool fintech gray in either mode.
- Mobile-first by usage. Primary players are on phones in landscape at the table, in portrait in the lobby.
- Color is committed, not restrained: Penthouse Midnight + Velvet Navy + Cold Light carry the room across modes; Neon Stake is the rare pink accent that earns its appearances.
- Typography is a single-family system (Poppins). Hierarchy through weight and scale, not type-pairing.
- Motion is human, not robotic. Bets settle, chips have weight, deals have rhythm.

## 2. Colors

The palette is a confident card-room set that works in both light and dark modes: deep navy for the ground, hot pink for action, felt green for affirmation, chip yellow for stakes, cold light for soft surfaces. Neutrals are warmed by ink and ash, never neutral-cool. Pure white and pure black are forbidden.

### Primary
- **Penthouse Midnight** (`#0B1430`): The ground of the room. Headers, hero backgrounds, primary text in light mode, deepest card surfaces. The color the table sits in.
- **Velvet Navy** (`#334479`): Secondary ground. Action buttons (raise variant), secondary text, hover-into-color for confirmable buttons. Carries the room when Penthouse Midnight is too heavy.

### Secondary
- **Neon Stake** (`#EB0B5C`): The signature accent. Used on focus rings, primary action confirmation, brand-surface highlights, and *only* the moments that are meant to be pink. Never decorative, never gradient-text, never a stripe.
- **Felt Green** (`#36A37B`): The color of money in motion. Confirm/call/win states. Currently appears in `greenGradient` button and glow shadow; the glow is debt, the green is not.

### Tertiary
- **Chip Yellow** (`#FDC51D`) / **Chip Yellow Deep** (`#B78900`): High-stakes / tournament / warning. Reserved for moments where the table itself is asking a question. Pairs with Chip Yellow Deep for hover and pressed states.

### Neutral
- **Cold Light** (`#ECEEF5`): The light surface of the room. Soft card grounds in light mode, secondary text in dark mode, low-contrast input grounds.
- **Ash Charcoal** (`#363535`): Mid-dark warm gray. Input fields and chat row grounds in dark mode.
- **Black Ash** (`#262626`): Deeper than charcoal but still warm. Chat row backgrounds, tertiary card surfaces.
- **Ink** (`#191414`) / **Ink Deep** (`#121212`): The deepest two warm darks. Ink is body background; Ink Deep is the absolute floor (`<html>` and pre-render scrim).
- **Surface Night** (`#171717`): The hero card inner background and the global body scrim. The most-used dark surface in the system.
- **Letterbox Night** (`#141418`) / **Letterbox Day** (`#D8D8DD`): Side-bands when content doesn't fill the viewport. Slightly off from the main surface to keep the eye centered.

### Named Rules

**The Neon Stake Rule.** The signature pink (`#EB0B5C`) is rare on purpose. Use it for: input focus rings, the brand mark, and the single most-important action in any view. Never on body text. Never as a gradient. Never on more than one element per screen.

**The No Pure Black/White Rule.** `#000` and `#fff` are forbidden. Every neutral is warmed: pure white belongs in incidental cases (button text on saturated grounds); pure black belongs nowhere. Reach for Penthouse Midnight, Ink, Ink Deep, or Cold Light instead.

**The Warm-Neutrals Rule.** Both modes share a warm temperature, never cool fintech gray. In light mode, warm toward Cold Light (`#ECEEF5`) for soft grounds and white for primary cards; text warms toward Penthouse Midnight, never `gray.700` cool gray. In dark mode, Ash Charcoal and Black Ash carry mid-tones; Ink carries body; Penthouse Midnight carries hero. The legacy `gray.500/700` ramp is debt — treat as legacy, not target, in both modes.

## 3. Typography

**Display Font:** Poppins (with `system-ui, sans-serif` fallback)
**Body Font:** Poppins (same family)
**Label Font:** Poppins (uppercase + letter-spaced for stakes/labels)

**Character:** A single-family system. Poppins is geometric, friendly, modern, and reads well at small sizes on mobile (the dominant context). Hierarchy is built through weight contrast (500 body / 700 heading / 800 display) and scale, not by introducing a serif or a display face. The system is intentionally one voice; if a screen needs more variation, the answer is scale and weight, not a second family.

### Hierarchy

- **Display** (800, `clamp(2rem, 6vw, 4rem)`, line-height 1.05, letter-spacing `-0.02em`): Hero headlines on `/` and marketing surfaces only. Never inside the table.
- **Headline** (700, `clamp(1.5rem, 3.5vw, 2.25rem)`, line-height 1.15): Section headers in the lobby and stats. Tight letter-spacing.
- **Title** (700, 1.25rem, line-height 1.3): Card titles, modal titles, secondary structure. Used heavily in `/leaderboard` and `/public-games`.
- **Body** (500, 1rem, line-height 1.5): Default paragraph. Cap at 65–75ch on text-heavy surfaces (FAQ, stats explanations).
- **Label** (700, 0.75rem, letter-spacing `0.03em`, often UPPERCASE): Action labels (CALL / RAISE / FOLD), stakes badges, table-side metadata.

### Named Rules

**The One-Family Rule.** Poppins for everything. Hierarchy through weight and scale, never through a second family. If a screen feels flat, raise the weight delta or the size delta, not the family count.

**The Tight-Headline Rule.** Headings carry letter-spacing `-0.02em`. The default Poppins tracking reads loose at scale; tight headings carry the confidence the brand wants.

**The Mobile-First-Type Rule.** All display and headline sizes are `clamp()`-bound. Do not hard-code `font-size: 4rem` for a hero — phones are the primary surface, and a fixed-size hero will overflow.

## 4. Elevation

The system uses a **hybrid**: tonal layering (warm-dark surfaces stacked on warm-dark grounds) is the default, with a small vocabulary of structural shadows reserved for hero cards and chat input focus. There is also a legacy vocabulary of glassmorphic and glow shadows that are debt, not target.

### Shadow Vocabulary

- **default** (`0px 0px 8px 0px rgba(0, 0, 0, 0.15)`): Quiet ambient lift. Default Chakra component shadow. Use sparingly.
- **card.hero** (light: `0 25px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.9)` / dark: `0 25px 80px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)`): The signature hero card lift on `/`. Layered, with a hairline outline. Reserved.
- **chat.inputFocus** (`0 0 0 2px rgba(51, 68, 121, 0.2)`): Chat input focus ring. Velvet Navy, 2px, no blur. The minimum viable focus indicator for a chat field.

### Legacy Shadow Vocabulary (debt; do not extend)

- **glass / glass-hover / glass-active**: Layered ambient shadows with `inset 0 1px 0 rgba(255,255,255,X)` highlights. Glassmorphic. Mark as legacy.
- **glow-green / glow-pink / glow-yellow** (`0 0 20px rgba(...,0.4), 0 0 60px rgba(...,0.15)`): Colored glows. PRODUCT.md anti-references explicitly forbid "glowing buttons." These exist in the theme; they are scheduled debt.
- **btn-premium / btn-premium-hover**: Premium-button shadow stack. Legacy.

### Named Rules

**The Tonal-First Rule.** Depth is built by stacking warm-dark surfaces (Surface Night on Ink, Ink Deep below), not by reaching for shadows. Surfaces do not need a shadow to feel separated from their ground if their tone differs.

**The No-Glow Rule.** `glow-green`, `glow-pink`, `glow-yellow` exist in `theme.ts` from an earlier era. Do not add new uses. Existing uses are tracked as cleanup.

**The Hairline-Outline Rule.** When a card needs *more* than tone — like the hero card — pair the shadow with a `0 0 0 1px` hairline of warm-white at low opacity. The hairline is what makes the lift feel architectural instead of fluffy.

## 5. Components

### Buttons

The button system is built on the **tactile chip** mechanic: every CTA has a hairline top highlight, a colored bottom edge, and presses by sinking 1–2px while the edge collapses. Hover changes color or bg-tint only — never a lift, never a glow, never a scale. Snap easing (80ms) on transform, slightly slower (120ms) on color shifts. The full per-property recipe and the `Button.baseStyle` disabled/loading rule live in `.claude/CHAKRA.md` §10.

**Current Button variants** (in `app/theme.ts`):

- **`tactilePrimary`** — solid Felt Green CTA (`brand.green` → `brand.greenDark` press, `brand.greenEdge` rim). The default brand action.
- **`tactileOutline`** — Felt Green outlined secondary (2px border, transparent fill, 12% green tint on hover). Pairs with `tactilePrimary`.
- **`tactileDestructive`** — Neon Stake outlined destructive (2px pink border, never solid pink fill).
- **`tactileTelegram`** — solid Telegram blue, used on community CTAs and newsletter.
- **`tactileChrome`** — mode-aware idle chip for clusters where multiple chrome buttons live together (NavBar settings/chat/away/leave/withdraw triggers, table chrome). Subtle dark-tint chip on cream / subtle light-tint chip on near-black via `_dark` inside the variant body.
- **`tactileGhost`** — transparent in-card utility chrome (chat header X / sound / overlay-toggle, popover toggles). Fills `card.lightGray` on hover. Use this *inside* card surfaces where `tactileChrome`'s chip would compete with the content.

**Other variants in active use:**

- **`raiseActionButton`** — at-table raise preset chips (1/2 Pot, Pot, All In, +1/+5/+10). Smaller-edge tactile recipe (1px edge, `translateY(1px)` press) tuned for 28–40px chips on the felt.
- **`navLink`** — desktop nav links (`HomeNavBar` `NavButtons`). Typography-only, transparent ground. The hover shifts to Neon Stake — this is the **one documented exception** to the otherwise reserved-pink rule, deliberately retained as the lobby-nav signature.
- **`homeNav`** — mobile drawer nav rows. Tactile row recipe (no edge shadow, `translateY(1px)` press, soft inset indent), tone-tinted per section (green for Play, navy for Resources).
- **`themeButton`** — the theme/mode toggle. Transparent, hover shifts text to Neon Stake.

**Toggle states (idle ↔ active).** Several chrome buttons toggle between an idle and an active state (Pause/Resume, Away/Back, Leave/Cancel-leave). Use `tactileChrome` for the idle state and inline a solid brand-tone tactile chip for the active state — see `app/components/NavBar/AwayButton.tsx` for the canonical pattern. Don't add a variant per tone permutation.

**The state-aware action slot.** When a primary action becomes contextually unavailable (e.g., the Withdraw button in the settings card while the user is seated), prefer **replacing the action with the unblocking action** ("Leave seat") in the same slot rather than disabling-with-a-blur. The replacement button must mirror the source action's full state set — for Leave seat, that's `idle / queued / settlement-stuck`, matching the navbar `LeaveButton`. See `WithdrawBalanceCard.tsx` for the canonical implementation.

**Linkouts.** External URLs use the shared `<ExternalLink>` component (see `.claude/CHAKRA.md` §11). In-app handle/identity links use `<PlayerNameLink>`. Iconified social CTAs use `<SocialIconButton tone="..." />`. Don't reinvent the recipes inline.

### Inputs

- **`white` variant:** White ground, 2px Cold Light border, 10px radius. Focus shifts border to Neon Stake plus a 1px Neon Stake outline. The default form field — used in newsletter, free tokens, and most modals.
- **`takeSeatModal` variant:** Cold Light ground (becomes white on focus), 12px radius, 56px tall, 2px transparent border. Hover shifts border to Felt Green; focus to Neon Stake plus a Neon-Stake-tinted outer halo. The most expressive input in the system; lives in the take-seat flow.
- **`settings` variant:** White ground, Cold Light border, 8px radius. Smaller and tighter than `white`. Same hover/focus pattern (Felt Green on hover, Neon Stake on focus).
- **`outlined` (legacy):** Charcoal ground, gray border, used in older surfaces. Treat as legacy; new work should use `white` or `settings`.

### Cards

- **Default (`card.white` / `card.lightGray` / `card.darkNavy`):** Token-driven. White or Cold Light ground in light mode; Gray Light or Gray Dark in dark mode. Soft 8–12px radius. No shadow at rest.
- **Hero (`card.heroBg` / `card.heroInnerBg`):** White ground in light mode; semi-transparent Surface Night (`rgba(23,23,23,0.8)`) in dark mode with a hairline outline. Carries the layered `card.hero` shadow. Reserved for the home hero.
- **Internal padding:** `16px` (`spacing.md`) for default cards; `32px` (`spacing.xl`) for hero. No padding scale below `8px` for card interiors.

### Chat surface

- **Row alternation:** Cold Light + white in light mode; Black Ash + Ash Charcoal in dark mode. Hover bumps the row by ~3% lightness.
- **Border:** `rgba(0,0,0,0.08)` light / `rgba(255,255,255,0.15)` dark. Hairline.
- **Scroll thumb:** Velvet Navy at 20% opacity light; warm-white at 25% dark. Hover thickens to 30/40%.
- **Input focus:** `chat.inputFocus` ring described in Elevation.

### Action labels (signature)

The action label cluster (`CALL` / `BET` / `RAISE` / `ALL-IN`) is treated as a typographic component, not a button. Uses the **Label** type role: 12px Poppins 700, uppercase, letter-spaced `0.03em`. Currently appears as transient per-seat labels at the table.

### Empty seat (signature)

`emptySeat` button variant. 100% width, dashed `gray.400` border, gray text, font-size scales aggressively from `0.95rem` on mobile up to `2.3rem` on `lg`. The "sit down" affordance is *deliberately* loud at the table.

### Named Rules

**The Solid-Over-Gradient Rule.** Confirm and primary actions resolve to solid colors, not gradients. The legacy `greenGradient` variant is gone; all CTAs land on `tactilePrimary` (flat Felt Green).

**The No-Lift Hover Rule.** Hover never uses `transform: translateY(-Npx)` or `scale(1.0X)`. Hover changes color, bg-tint, or border. **Press** is the only animated affordance — `translateY(1–2px)` with the bottom edge collapsing.

**The No-Glow Rule.** Hover never uses colored `boxShadow` glows (`0 0 20px rgba(...,0.4)` etc.). Edge shadows only. The legacy `glow-green` / `glow-pink` / `glow-yellow` shadow tokens exist in `theme.ts`; do not extend them.

**The Solid-Over-Glass Rule.** `backdropFilter: blur(...)` is reserved for modal overlays only. The button overhaul retired all in-button blur usage; do not reintroduce it on chips or chrome.

**The Disabled-Visual Rule.** A muted-but-clickable button uses `opacity: 0.85 → 1 on hover`. Never `filter: blur(...)` — it reads as broken UI. A truly disabled button uses `isDisabled` and lets `Button.baseStyle._disabled` (filter desaturate + `pointerEvents: none`) handle the visual.

**The 44pt Tap Rule.** All tap targets in the table interface and primary lobby flows hit a 44×44pt minimum on mobile. The `raiseActionButton` minimum height of 28px on `base` is a deliberate exception inside a known-zoomed table layout — do not propagate that exception elsewhere.

## 6. Do's and Don'ts

### Do:

- **Do** use Poppins for all text. Hierarchy comes from weight (500 / 700 / 800) and scale, not from a second family.
- **Do** reach for **Penthouse Midnight** and **Velvet Navy** as the room's grounds. Use **Cold Light** for soft surfaces in light mode.
- **Do** reserve **Neon Stake** for the single most important action per screen, focus rings, and the brand mark.
- **Do** use **Felt Green** for confirm / call / positive money states, flat (not gradient) for new variants.
- **Do** build depth with tonal layering first. Reach for shadow only when tone alone can't do the job.
- **Do** pair shadow with a 1px hairline outline (`rgba(255,255,255,0.05)` in dark) when a card needs to feel architectural.
- **Do** clamp display and headline sizes. Mobile is the primary context.
- **Do** carry letter-spacing `-0.02em` on headings.
- **Do** use semantic tokens (`bg.*`, `text.*`, `card.*`, `chat.*`) at call sites; reach for raw `colors.brand.*` only inside theme definitions.
- **Do** respect `prefers-reduced-motion`. Chip animations, deal animations, and ambient motion all need a toned-down path that preserves causality.
- **Do** ensure 44×44pt tap targets in the table and primary lobby flows.
- **Do** pair color with shape, icon, or text for state. Suit identity, action state, and stake tier are never color-only.

### Don't:

- **Don't** use `#000` or `#fff`. Every neutral is warmed (Penthouse Midnight, Ink, Ink Deep, Cold Light).
- **Don't** introduce a second type family. Poppins, all weights, all sizes.
- **Don't** add **glassmorphism** — backdrop blurs as a decorative effect. PRODUCT.md anti-references forbid it. Existing `backdropFilter` uses are debt.
- **Don't** add **glowing buttons** — `glow-green`, `glow-pink`, `glow-yellow` shadows are explicitly anti-reference. Do not extend them. Existing uses are scheduled cleanup.
- **Don't** use **gradient text** (`background-clip: text`). Single solid color, emphasis through weight or size.
- **Don't** use **gradient meshes** or "Welcome to the Future" hero copy. PRODUCT.md anti-reference: Web3 hero-page slop.
- **Don't** build the **hero-metric SaaS template** (big number, small label, gradient accent). PRODUCT.md anti-reference: AI-generated UI.
- **Don't** use **identical card grids** — same-sized cards with icon + heading + text, repeated. PRODUCT.md anti-reference.
- **Don't** use **side-stripe borders** (`border-left` greater than 1px as a colored accent). Cross-register absolute ban.
- **Don't** use **em dashes** (`—`) in shipped copy. Commas, colons, semicolons, periods, parentheses.
- **Don't** ship the **WSOP / PokerStars / ClubGG aesthetic**: stock-photo felt, glossy chip stacks, casino-floor red-and-gold, "professional" tone. PRODUCT.md anti-reference: corporate poker rooms.
- **Don't** ship the **Uniswap-clone DEX dashboard aesthetic** — generic chart cards, swap gradients. PRODUCT.md anti-reference: generic crypto dashboards.
- **Don't** ship "✨" or three-emoji headers or lavender-to-pink gradients. PRODUCT.md anti-reference: AI-generated UI.
- **Don't** ship **Chuck-E-Cheese degen** — neon for neon's sake, comic-sans-energy fonts, screaming chrome. PRODUCT.md anti-reference.
- **Don't** modify a shared semantic token in `app/theme.ts` to fix one component. Use `_dark={{}}` or `useColorModeValue()` directly. (Repo rule from `.claude/CHAKRA.md`.)
- **Don't** introduce raw hex codes outside `theme.ts`. Use semantic tokens or `colors.brand.*`.
