# Button System Overhaul — Handoff

**Status:** Groups A + B + C + E complete · Group D skipped (current design retained) · Group F next · 4 groups remaining

This file is a stateful handoff for the next agent picking up this work. Read it end-to-end before touching any button code. Reference it; don't re-derive it.

---

## What this is

A multi-pass overhaul of every button in the app. The user's brief: many buttons currently feel like AI-slop (gradients, glassmorphism, glowing shadows, hardcoded colors, duplicated inline `_hover` blocks). We're working **group by group**, the user picks the feel from a Storybook spike, an agent (you) implements.

The user explicitly wants: **satisfying, simple, beautiful** buttons. Not opinionated decoration.

The first decision they made still applies to all subsequent groups by default: **Tactile & weighty** is the chosen feel. Default to it for any new variant unless the user asks for an alternative.

---

## Tactile recipe (the visual spec)

Every new button variant in this overhaul follows this mechanic. Internalize it.

| Property | Value |
|---|---|
| Border-radius | 10–12px (compact 10, standard/large 12) |
| Top highlight | `inset 0 1px 0 rgba(255,255,255,0.18)` (solid fills only) |
| Bottom edge | `0 2px 0 <darker-shade-of-fill>` (3px for 56px buttons; outlines use the same edge) |
| Hover | `bg` stays — **no lift, no extra shadow** |
| Active (press) | `translateY(2px)` + inner shadow `inset 0 2px 4px rgba(0,0,0,0.18)` + edge collapses to `0 0 0` + bg shifts to `-darker` |
| Easing | `transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease` |
| Type | weight 700, letter-spacing 0.02em |
| Outline variant | 2px solid border in the action color, transparent fill, edge in matching color, hover bg = **12%** color tint + border/text shift to `*Dark`, press = **18%** tint + edge collapse |

The mechanic is "looks like a poker chip with a hairline highlight; pressing it sinks the chip and the bottom edge disappears." Snap easing — no creamy slow transitions. The press is the only animated affordance; hover does not lift, does not glow, does not brighten.

### Disabled & loading states (shared, not per-variant)

A polish pass on Group A discovered that bespoke `_disabled` / `_loading` blocks per variant are the wrong shape. The cleaner pattern lives in `Button.baseStyle` and applies to every variant uniformly:

```ts
_disabled: {
  filter: 'saturate(0.45) brightness(0.92)',
  cursor: 'not-allowed',
  pointerEvents: 'none',   // load-bearing — see CHAKRA.md §8
  boxShadow: 'none',
  _active: { transform: 'none' },
},
_loading: {
  filter: 'saturate(0.75)',
  pointerEvents: 'none',
  _active: { transform: 'none' },
},
```

Why each line matters:
- **`filter`** desaturates the live variant. Works on solid fills, outlines, and text-only variants alike — no per-variant rewrites. Loading uses a lighter desaturation so the spinner sits on a near-live chip.
- **`pointerEvents: 'none'`** is load-bearing. Chakra's framework default has `_hover: { _disabled: { bg: 'initial' } }` (see `node_modules/@chakra-ui/theme/dist/esm/components/button.mjs`), which wipes solid-fill bg to transparent on hover-disabled. `:hover:disabled` outranks `:disabled` in CSS specificity, so you can't beat it from `_disabled.bg`. Killing pointer events stops `:hover` from ever firing. Wrapping `Tooltip`s still work because they listen on the parent.
- **No `opacity`** — on light-mode page bg it lets the page color bleed through and the chip visually disappears.

When adding new variants in later groups, don't define `_disabled` / `_loading` unless the shared treatment genuinely doesn't fit. Variants describe the *live* state; the baseStyle owns the rest.

**Consumer rule:** never pass `opacity` / `cursor` / raw `disabled={...}` directly on a `<Button>`. They clobber the variant's `_disabled`. Use `isDisabled` and `isLoading`.

---

## What's in `app/theme.ts` now (reference)

### Brand color shades (extends existing `colors.brand`)

```
brand.green / greenDark (#2A8463) / greenEdge (#22674E)
brand.pink / pinkDark (#C00A4D) / pinkEdge (#950839)
brand.telegram (#0088CC) / telegramDark (#0077B5) / telegramEdge (#006A9D)
```

These are tokenized so we never hardcode hex in button code again. The 9 color leaks Group A had (`#2d9268`, `#2e8d6a`, `#287859`, `#36A37B`, `#d50a52`, `#229ED9`, `#0088cc` literals etc.) are gone from button surfaces.

### Button variants (in `components.Button.variants`)

| Variant | Use it for |
|---|---|
| `tactilePrimary` | Solid green action — the default brand CTA |
| `tactileOutline` | Green outlined secondary, paired with a primary |
| `tactileDestructive` | Pink outlined destructive — never solid pink |
| `tactileTelegram` | Solid telegram-blue — newsletter / community CTAs |

Sizes (44 / 48 / 56 px) come from the consumer via `height` or Chakra's `size` prop. The variant only owns the **mechanic** (edge, press behavior, easing, weight). Don't bake size into a variant.

### Reusable component

**`app/components/SocialIconButton.tsx`** — named export, not default.

```tsx
import { SocialIconButton } from '@/app/components/SocialIconButton';

// Icon-only chip (square)
<SocialIconButton tone="x" />                          // 40×40 default
<SocialIconButton tone="discord" chipSize="lg" />      // 44×44
<SocialIconButton tone="x" chipSize="sm" />            // 36×36

// Labeled chip (icon + text)
<SocialIconButton tone="x" label="Link X" chipSize="sm" />
```

`tone` is `'x' | 'discord' | 'telegram'`. Chakra Button/IconButton props pass through (`onClick`, `isDisabled`, etc).

**Don't** override `bg` / `color` / `boxShadow` / `_hover` / `_active` from the consumer — the component owns those.

**Don't** use `as={Link} href={...}` directly on it — TS doesn't like the polymorphism. **Wrap with `<Link>`** instead, like HomeCard does:

```tsx
<Link href="https://..." isExternal>
  <SocialIconButton tone="x" chipSize="lg" />
</Link>
```

---

## Group inventory (status)

| # | Group | Status | Surfaces |
|---|---|---|---|
| **A** | **Hero / marketing CTAs** | ✅ **DONE** | HomeCard, PublicGames, CreateGame, error pages, TakeSeatModal, GuardModal, NewsletterSuccessModal, PlayerCard, ShareRankCard, Footer |
| **B** | **Table action buttons** (primary trio + raise presets + blind obligations + away rejoin) | ✅ **DONE** | `Footer/ActionButton.tsx`, `raiseActionButton` variant in theme.ts (consumed in `RaiseInputBox.tsx`), `Footer/BlindObligationControls.tsx`, `Footer/AwayRejoinFooter.tsx` |
| **C** | **Table chrome (settings, volume, chat, away, leave, withdraw, pause/resume, burger)** | ✅ **DONE** | `theme.ts` `tactileChrome` variant (replaces `gameSettingsButton`); consumers: `NavBar/index.tsx`, `VolumeButton.tsx`, `AwayButton.tsx`, `LeaveButton.tsx`, `WithdrawButton.tsx` (trigger only), `TableMenuBurger.tsx` |
| D | Felt seat buttons (Sit Down) | ⏭️ **SKIPPED** — user kept current design after spike review | `app/components/EmptySeatButton.tsx` (untouched) |
| **E** | **Mobile drawer nav** (menu trigger + close + 6 nav-link rows + 3 social) | ✅ **DONE** | `app/components/HomePage/HomeNavBar.tsx` |
| **F** | **Desktop nav links (`navLink` variant)** | 🟡 **NEXT** — light review | HomeNavBar (the desktop `NavButtons` component using `navLink` variant) |
| G | Leaderboard quests (currently `Box` not `Button`) | Pending — biggest open question | QuestsSection |
| H | Leaderboard PlayerCard CTAs | Mostly resolved by A | PlayerCard (rank rings, accents) |
| I | Filters / sort / icon-secondary | Light review | PublicGamesGrid |
| J | Form / preset buttons | Pending | CreateGame presets |

**Out of scope (stays untouched):** WalletButton (`app/components/WalletButton.tsx`) and the thirdweb ConnectButton flow.

---

## What Group A actually did (audit trail)

### Files modified (12)
- `app/theme.ts` — added 6 brand shades, 4 tactile variants, removed 9 dead variants
- `app/components/SocialIconButton.tsx` — new file
- `app/components/HomePage/HomeCard.tsx` — PLAY NOW / CREATE / JOIN / 3 socials
- `app/components/HomePage/Footer.tsx` — 3 socials
- `app/components/HomePage/NewsletterSuccessModal.tsx` — Telegram CTA (animation removed)
- `app/components/PublicGames/PublicGamesHero.tsx` — Create Game
- `app/components/PublicGames/EmptyState.tsx` — Retry, Create one
- `app/error.tsx`, `app/table/[id]/error.tsx` — Try again, Return to lobby
- `app/components/CreateGame/GameSettingLeftSide.tsx` — Join Game, Create Game, Finish Sign-In, Disconnect, X+Discord
- `app/components/TakeSeatModal.tsx` — Sit Down
- `app/components/GuardModal.tsx` — Check / Fold Anyway
- `app/components/SeatRequestConflictModal.tsx` — Choose Another Seat
- `app/components/Leaderboard/PlayerCard.tsx` — Finish Sign-In, Link X
- `app/components/Leaderboard/ShareRankCard.tsx` — Post / Send / Save chips polished

### Variants deleted from theme.ts
`greenGradient`, `social`, `outlineSuccess`, `outlineMuted`, `homeSectionButton`, `settingsSmallButton`, `connectButton`, `outlined`, `emptySeat`. All had 0 consumers. Don't reintroduce them.

### Spike file deleted
`app/components/_design/HeroCTAs.stories.tsx` was the side-by-side feel spike. Deleted post-decision. Recreate the same pattern under `_design/` for each new group.

### Polish pass after merge (disabled/loading + outline hover)

Issues caught after Group A landed:
1. Disabled solid buttons (`Create Game` while Cloudflare verifying) ghosted to almost-invisible text on hover.
2. Outline buttons (`JOIN`) felt static — 6% hover tint was imperceptible.
3. `GameSettingLeftSide.tsx` `Create Game` consumer was passing `opacity={0.6}` + `cursor` + raw `disabled` props that clobbered the variant's `_disabled`.

Fixes shipped in the same Group A scope:
- Outline `_hover` bumped to 12% tint + border/text shift to `*Dark`; `_active` to 18%.
- Shared `_disabled` / `_loading` moved to `Button.baseStyle` (see "Disabled & loading states" above).
- `GameSettingLeftSide.tsx:1311–1320` consumer-side overrides removed; switched to `isDisabled`.
- `SocialIconButton.tsx` returned to live-only styles — baseStyle handles disabled/loading uniformly across all tones.

The "fight the design system" iterations along the way are documented in memory (`feedback_chakra_disabled_button.md`) so future agents skip the dead-end of per-variant `_disabled.bg` overrides.

---

## What Group B actually did (audit trail)

The original brief in this doc only mentioned `RaiseInputBox.tsx`. The actual scope had **four surfaces** sharing the same physical table-footer zone — they were migrated together so the footer doesn't look schizophrenic.

### Files modified (4) + spike (1)

- `app/components/Footer/ActionButton.tsx` — Bet/Call/Fold/Check/Raise/Back. Removed `bgGradient`, `::before` top-light, `::after` shimmer keyframe, framer-motion `MotionButton` + `whileHover`/`whileTap` springs, hover glow shadow. Added solid tone bg + tactile chip recipe + 80ms snap press. Brand color leaks (`#2d8763`, `#c9094c`) replaced with `brand.greenDark/Edge` + `brand.pinkDark/Edge` tokens.
- `app/theme.ts` `raiseActionButton` variant — preset chips (1/2 Pot, 3/4 Pot, Pot, All In, +1, +5, +10, +chip). Removed `backdropFilter: blur(8px)`, hover lift + glow shadow, `scale(0.96)` press, bespoke `_disabled`. Added on-felt chip recipe (subtle white tint + hairline highlight + thin edge), tactile press at smaller scale (`translateY(1px)` instead of 2px because the chips are 28–40px tall).
- `app/components/Footer/BlindObligationControls.tsx` — Wait BB / Post Now / Sit Out. Removed `translateY(-1px)` hover, `boxShadow: 'lg'` glows, hardcoded `#2d8763`. Added tactile edge per tone (`#B78900` for yellow outline, `#22674E` for green solid, `rgba(0,0,0,0.45)` for neutral outline). Preserved queued-state `border` switch and `opacity` signaling — those carry meaning.
- `app/components/Footer/AwayRejoinFooter.tsx` — I'm Back / Cancel / Rejoining-status pill. Removed `MotionButton` + framer-motion entirely, `pulseGlow` + `shimmer` keyframes, `glassPseudos` helper, `bgGradient`. Added solid green tactile for I'm Back, pink-outline tactile for Cancel. Status pill (dashed border, not a button) untouched.
- `app/components/_design/TableActions.stories.tsx` (spike) — four directions side-by-side (Baseline / Tactile / Felt-Inset / Sharp) for the user to pick. Tactile picked. Spike retained for now in case Group C wants to reference the same direction-comparison pattern; can be deleted any time.

### Critical constraint from this group

**Layout-preserving migration.** The user's brief on Group B was explicit: "no sizing or scaling or anything to do with layout changes — only button look and styling." Every responsive `cqw`/breakpoint rule, every `@media (orientation: portrait/landscape)` block, every `height`/`width`/`padding`/`fontSize`/`flex`/`maxW`/`flexShrink`/`zIndex` was preserved verbatim. Only `bg`/`border`/`boxShadow`/`transition`/`_hover`/`_active`/animation-pseudos changed.

This is the right default for any future group that touches a working surface — change the look, don't move the boxes. Layout migration is a separate task with its own risk profile.

### Tactile recipe at table scale

For surfaces smaller than the Group A 44–56px buttons, the recipe drops down a weight-class:

- Edge `0 2px 0 <edge>` is fine for 40px+ tall buttons (Bet/Call/Fold, Wait/Post/Sit, I'm Back).
- For 28–40px chips (raise presets), edge becomes `0 1px 0 rgba(0,0,0,0.4)` and press `translateY(1px)` instead of 2px — keeps the affordance without consuming the chip's vertical budget.
- Letter-spacing stays at `0.03–0.04em` regardless of size.

---

## What Group C actually did (audit trail)

### Files modified (6) + spike (1) — `gameSettingsButton` variant retired

- `app/theme.ts` — added `tactileChrome` variant for idle chrome chips. Mode-aware (light: subtle dark-tint chip on cream; dark: subtle light-tint chip on near-black) so the same variant reads in both modes without consumer overrides. Deleted `gameSettingsButton` (had glass blur + lift + glow + scale press).
- `app/components/VolumeButton.tsx` — variant swap (one line).
- `app/components/NavBar/index.tsx` — variant swap on Settings + Chat IconButtons. Pause/Resume IconButtons converted from inline lift+glow to inline tactile chips (green when paused, orange when pendingPause, yellow when normal — each with its matching edge-color hex). Pulse keyframe on the pending-players badge untouched (badges are not buttons).
- `app/components/NavBar/AwayButton.tsx` — 4 states migrated. Solid green tactile for "Cancel rejoin" + "I'm Back," solid pink tactile for "Cancel sit out," idle `tactileChrome` for the resting playing state.
- `app/components/NavBar/LeaveButton.tsx` — 2 states migrated. Idle uses `tactileChrome` with brand.pink icon (signals destructive); queued uses solid pink tactile chip. `aria-pressed` retained.
- `app/components/NavBar/WithdrawButton.tsx` — only the trigger button (line ~187). Solid yellow tactile chip with darker text (`#1A1A1A`) for contrast against the bright yellow. The is-user-seated `filter: blur(1px)` + `opacity: 0.6` signal preserved verbatim. Modal internals (animated gradient border, slideUp keyframe, etc.) deliberately untouched — separate concern.
- `app/components/NavBar/TableMenuBurger.tsx` — toggle migrated. Idle uses `tactileChrome`; open state uses solid navy tactile chip (with a new edge `#1B2754` since this is the only place navy is used as a tactile fill).

Not modified — out of scope for chrome migration:
- `WalletButton.tsx` (thirdweb integration — explicitly excluded by the master scope)
- `StartGameButton` (separate concern; revisit in a later group if needed)
- `Modal` internals of `WithdrawButton`, `SettingsModal` (Group J or separate)

### Pattern: idle vs active toggle states

Chrome buttons are *toggles*. Many have an idle state (variant `tactileChrome`) and an active state (solid brand-tone tactile chip with the same chip mechanic). Rather than encoding all the toggle-tone permutations as variants (would need green/pink/yellow/orange/navy solid tactile variants — overkill for a handful of consumers), each consumer renders its active state inline using the recipe:

```tsx
{
  bg: '<brand.tone>',
  color: 'white',                              // or '#1A1A1A' for yellow
  border: 'none',
  borderRadius: '12px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 <edge-hex>',
  transition: TACTILE_TRANSITION,
  _hover: { bg: '<brand.tone>' },
  _active: {
    bg: '<brand.toneDark>',
    transform: 'translateY(2px)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 <edge-hex>',
  },
}
```

The edge-hex values used in chrome (matching the `brand.<tone>Edge` shades from Group A + B):
- Green edge: `#22674E`
- Pink edge: `#950839`
- Yellow edge: `#B78900`
- Orange edge (pendingPause): `#B45A0B` (new — only used once)
- Navy edge (burger open): `#1B2754` (new — only used once)

If a future group adds more navy or orange chrome states, lift those edges into named brand shades in `theme.ts`. For one-offs, hex inline is fine (the same call we made for Group A's edge hexes).

### Mode-aware idle chip — the new approach

The `tactileChrome` variant uses Chakra's `_dark` style key inside the variant body to flip its colors:

```ts
tactileChrome: {
  bg: 'rgba(0,0,0,0.05)',          // light-mode: subtle dark tint
  color: 'text.secondary',
  borderColor: 'rgba(0,0,0,0.10)',
  ...
  _dark: {
    bg: 'rgba(255,255,255,0.06)',  // dark-mode: subtle light tint
    color: 'rgba(255,255,255,0.85)',
    borderColor: 'rgba(255,255,255,0.14)',
    _hover: { ... },
    _active: { ... },
  },
}
```

This is the first variant in the overhaul to use `_dark` *inside* the variant body. It's the right call here because the chip's bg/border/text values don't have semantic-token equivalents — the rgba alpha tints are computed against whichever bg the page uses. If a future group needs the same pattern (likely Group D for felt-seat buttons), reuse this shape.

---

## What Group E actually did (audit trail)

### Files modified (1)

- `app/components/HomePage/HomeNavBar.tsx` — all 11 button surfaces in the mobile drawer + the menu trigger, migrated to tactile.

### Surfaces migrated

| # | Surface | Recipe applied |
|---|---|---|
| 1 | Mobile menu trigger (hamburger on desktop nav) | `variant="tactileChrome"` |
| 2 | Drawer close (X icon in drawer header) | `variant="tactileChrome"` |
| 3–5 | Play section nav-links (Create Game / Public Games / Leaderboard) | green-tone tactile rows: 10% green-tint hover, 16% + `translateY(1px)` + inset shadow press |
| 6–8 | Resources section nav-links (Docs / Support / Discord) | neutral-tone tactile rows: 6% navy-tint hover (light) / 8% white-tint (dark), 10%/14% press |
| 9–11 | Mobile social row (X / Discord / Telegram) | swapped to `<SocialIconButton tone="..." chipSize="lg" />` (already exists from Group A) |

### Slop removed

- `transform: 'translateX(2px)'` slide-nudge on nav-link rows (no-lift rule)
- `transform: 'translateY(-2px)'` lift on social IconButtons (no-lift rule)
- Hardcoded `#000` / `#5865F2` / `#0088cc` social colors → now flow through `SocialIconButton`'s tone palette
- Duplicated inline `_hover` blocks on the 6 nav-link rows (3 green + 3 neutral) — still 6 inline blocks, but now consistent with the same recipe shape and one shared `TACTILE_TRANSITION` constant
- 3 unused imports (`RiTwitterXLine`, `FaTelegram`, plus the inline-styled IconButton paths)

### Layout preserved verbatim

- All nav-link Button props: `as="a" href={...}`, `onClick={onClose}`, `leftIcon`, `rightIcon`, `variant="ghost"`, `justifyContent="flex-start"`, `height="44px"`, `px={3}`, `borderRadius="12px"`, `fontWeight="semibold"`, `fontSize="sm"`, `color`, `bg="transparent"`, `border="none"`, `sx={{ '& > span:last-of-type': { ml: 'auto' } }}`
- Drawer header layout (Logo + close button), Spacer Box flex={1}, Tooltip wrapping Leaderboard
- All section labels, dividers, theme toggle, WalletButton, decorative bottom gradient
- `MotionFlex` wrapper, `Drawer placement="right" size="xs"`, `DrawerOverlay backdropFilter`, `DrawerContent` bg/border/shadow
- The disabled "Soon"-badged Leaderboard row keeps its `opacity={0.5}` + `cursor="default"` + transparent hover

### Pattern: nav-link tactile row

For full-width drawer rows (vs chip-style tactile buttons), the press affordance is `translateY(1px)` (not 2px — preserves the row's vertical rhythm) plus a soft `inset 0 1px 2px rgba(0,0,0,0.10)` indent. No bottom-edge shadow since rows aren't chip-shaped. Hover is a tone-tint bg only — no lift, no glow, no slide-nudge. The tone tint is per-section: green for Play (action-adjacent), navy for Resources (utility).

### Out of scope (deliberately)

- The desktop nav `NavButtons` component (Group F) — uses `navLink` variant in theme. Light-review group; the current `navLink` has a `transform: translateY(-3px)` hover lift that violates the no-lift rule and a pink hover color, but the rest is reasonable.
- `WalletButton` (master scope exclusion).
- `ColorModeButton` — separate component, separate concern.

---

## How to do Group F (next)

The user's iteration loop is fixed. Follow it.

### 1. Audit first

Group F per this doc is "Desktop nav links (`navLink` variant)" — the top-of-page nav on desktop (the `NavButtons` component inside `HomeNavBar.tsx`). It's a *light review* group: the variant is reasonably scoped already, but it has a hover lift and a pink hover color that don't match the rest of the system.

Before spiking, audit:

```bash
grep -rn 'variant="navLink"\|variant={"navLink"}\|variant={\x27navLink\x27}\|navLink' app/ --include='*.tsx' --include='*.ts'
```

The `navLink` variant in `app/theme.ts` currently has:
- `transform: 'translateY(-3px)'` on hover (no-lift rule violation)
- `color: 'brand.pink'` on hover (out of family with the green-action / navy-utility palette we've established)
- `bg: 'none'`, `boxShadow: 'none'` on all states (good — chrome-leaning)
- All-state `border: 'none'` and explicit `outline: 'none'` reset (good)
- `transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'` (slow vs the 80ms snap we use elsewhere)

Consumers: only the `NavButtons` component inside `HomeNavBar.tsx:55–112` (Home / Create / Public / Leaderboard / Sign In path). No other consumers — this is a tightly scoped variant.

### 2. Build a Storybook spike (or skip)

This is a small variant change — could go straight to migration without a spike, OR build a tiny spike showing baseline vs tactile. The user has consistently picked Tactile in every prior group; for a tightly-scoped change like this, I'd recommend just proposing the tactile change directly (no spike needed) and asking the user to confirm.

If they want a spike: `app/components/_design/DesktopNav.stories.tsx`, two directions only (baseline vs tactile-quiet), single small story.

### 3. Group F context

Desktop nav links are **chrome, not actions**. They should:
- Have NO hover lift (just like the drawer rows in Group E)
- Have a quiet hover signal — bg tint or color shift, not transform
- Use the green tone for hover (consistent with Group E's Play section) since these link into actions, OR neutral for utility consistency
- Use the 80ms snap transition

Current `_hover` color is `brand.pink` — that's tactile-incompatible (pink is reserved for destructive in our system, not nav-hover). Switch to `brand.green` to match Group E or stay neutral.

### 4. Migration

- Update the `navLink` variant in `app/theme.ts`: drop the `translateY(-3px)`, swap pink for green or a neutral token, use `TACTILE_TRANSITION` timing. Add a tactile press state (`_active`).
- Don't add `_disabled` / `_loading` blocks (baseStyle owns those).
- The consumer doesn't need any changes — variants flow through.
- Verify type-check + lint + build clean.
- Update this file's status table.

### 5. Hand back

Self-review, list what to eyeball in browser (`/` desktop nav at the top, links should hover-tint green without lifting), ask if they want to move to Group G (Leaderboard quests — the biggest open question).

---

## Conventions & gotchas

These bit me. Bake them in:

1. **Named imports for `SocialIconButton`.** Default imports break the build.
   ```tsx
   import { SocialIconButton } from '@/app/components/SocialIconButton'; // ✓
   import SocialIconButton from '@/app/components/SocialIconButton';     // ✗
   ```

2. **Polymorphic `<SocialIconButton as={Link}>` doesn't typecheck.** Wrap with Chakra `Link` instead. Pattern is in `HomeCard.tsx` and `CreateGame/GameSettingLeftSide.tsx`.

3. **Variant owns mechanics, caller owns sizing.** `height`, `size`, `px`, `borderRadius` (responsive object) come from the consumer. `bg`, `color`, `border`, `boxShadow`, `_hover`, `_active`, `transition`, `fontWeight`, `letterSpacing` come from the variant. Don't mix layers.

4. **Don't over-tokenize box-shadow strings.** The 2px edge in tactile variants is hardcoded hex (`#22674E`, `#950839`, `#006A9D`) inside the box-shadow string. Chakra's box-shadow tokens don't compose well with multi-color shadows. The hex is fine; it lives next to the brand color shade definition.

5. **Don't restore deleted variants.** If you find yourself wanting `greenGradient` or `social` back, you're solving the wrong problem. The tactile equivalents exist.

6. **No new hardcoded button colors.** Add a brand shade to `theme.ts` first, then use it. There were 9 leaks pre-Group-A; we don't reintroduce them.

7. **Don't add hover lifts.** Tactile is `_hover: { bg: '...' }` (and for outlines, optional `borderColor` / `color` shift) only. The press is the only animated affordance.

8. **Don't write per-variant `_disabled` / `_loading`.** `Button.baseStyle` in `theme.ts` owns both via `filter` + `pointerEvents: 'none'`. Per-variant blocks were the original Group A approach and they were wrong — see the polish-pass note above and `.claude/CHAKRA.md` §8 for the full Chakra gotcha.

9. **Consumers must not pass `opacity` / `cursor` / raw `disabled={...}` on a Button.** Those clobber the variant's `_disabled`. Use `isDisabled` and `isLoading`.

10. **CLAUDE.md still applies.** Read it before touching anything; the design rules in `DESIGN.md` and product voice in `PRODUCT.md` override anything here.

11. **`app/components/_design/` is the spike folder.** Use it for Storybook design exploration only. Delete spikes after the user decides — don't leave them in the codebase.

---

## Verification commands

Before declaring any group done:

```bash
# from repo root
npx tsc --noEmit -p tsconfig.json
npm run lint
rm -rf .next && npm run build      # the .next cache lies — clear it before building if a build randomly fails
```

Sanity-check there are no consumers of the variant you just deleted:

```bash
grep -rn 'variant="<deletedName>"' app/ --include='*.tsx' --include='*.ts'
```

Browser smoke test (light + dark):
- `/` (home + open social drawer + newsletter modal)
- `/public-games` (loading, error, empty, populated)
- `/create-game` (Crypto play type → Sign-In flow → Create Game)
- `/leaderboard` (PlayerCard auth states, share modal)
- Active table → trigger GuardModal (bet, then click Fold)

---

## File map (for fast orientation)

```
app/theme.ts                                            # button variants + brand colors
app/components/SocialIconButton.tsx                     # social icon component (groups A's deliverable)
app/components/_design/                                 # spike folder (delete contents after each decision)
.storybook/preview.tsx                                  # has light/dark toolbar wired up
.storybook/main.ts                                      # stories glob: app/**/*.stories.@(ts|tsx)

# group-a touched files (don't break their migrations):
app/components/HomePage/HomeCard.tsx
app/components/HomePage/Footer.tsx
app/components/HomePage/NewsletterSuccessModal.tsx
app/components/PublicGames/PublicGamesHero.tsx
app/components/PublicGames/EmptyState.tsx
app/error.tsx
app/table/[id]/error.tsx
app/components/CreateGame/GameSettingLeftSide.tsx
app/components/TakeSeatModal.tsx
app/components/GuardModal.tsx
app/components/SeatRequestConflictModal.tsx
app/components/Leaderboard/PlayerCard.tsx
app/components/Leaderboard/ShareRankCard.tsx

# group-b target:
app/components/Footer/RaiseInputBox.tsx
```

---

## Open questions that may come up

- **Group G (Leaderboard quests):** currently `<Box>` not `<Button>`, with per-quest brand colors (X black, Discord purple, Telegram blue, Create Table green). The user committed `ef46cc0` ("vertical felt-rows with brand pop") recently — they like the brand-color-per-quest treatment. Decision when we get there: keep brand-color-per-quest (yes, almost certainly) and convert to real Button + tactile mechanic.

- **Group D (Felt seat):** the existing `EmptySeatButton.tsx` does NOT use the `emptySeat` variant — it has all custom inline styles (dashed border, blur, glow, scale 1.02). The `emptySeat` variant in theme.ts had 0 consumers and was deleted in Group A's cleanup. Group D will need a fresh variant or a custom component approach.

- **Disabled state:** `tactilePrimary` has a `_disabled` block that overrides the press behavior to a no-op. Other tactile variants don't (they didn't need it for Group A). Add `_disabled` to other variants only when a consumer needs it — don't preemptively add it.

- **Dark mode:** Group A variants work in both modes because `brand.*` colors are mode-invariant. If a future variant needs to differ in dark mode, use `_dark={{}}` on the consumer or add `_dark` to the variant — never modify a shared semantic token to fix one component (that rule is in `CLAUDE.md` and the user has been bitten by it before).

---

## TL;DR for the next agent

Read `CLAUDE.md`, `DESIGN.md` button section, then this file. Confirm with the user that **Tactile & weighty** is still the desired feel for Group B. Build a Storybook spike at `app/components/_design/TableActions.stories.tsx` showing baseline + 2–3 directions, let the user pick, implement via theme variants (don't pile inline styles), delete debt, update this file's status table, hand back.
