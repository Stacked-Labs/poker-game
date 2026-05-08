# Button System Overhaul — Handoff

**Status:** Group A complete (incl. disabled/loading polish pass) · Group B next · 8 groups remaining

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
| **B** | **Table action buttons (Raise/Call/Fold)** | 🟡 **NEXT** | RaiseInputBox |
| C | Table chrome (settings, volume, leave, away) | Pending | NavBar (table), VolumeButton, AwayButton, LeaveButton, WithdrawButton |
| D | Felt seat buttons (Sit Down) | Pending | EmptySeatButton |
| E | Mobile drawer nav | Pending | HomeNavBar drawer items + mobile social row |
| F | Desktop nav links (`navLink` variant) | Working — light review | HomeNavBar |
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

## How to do Group B (next)

The user's iteration loop is fixed. Follow it:

### 1. Build a Storybook spike
- Path: `app/components/_design/TableActions.stories.tsx`
- Title: `'Design Spikes / Group B — Table Actions'`
- Show 4 rows: **Baseline** (current), **Tactile**, plus 2 alternates appropriate to the surface (Soft / Sharp worked for Group A; pick what makes sense for raise/call/fold)
- Render: Raise / Call / Fold trio, plus the +chips/all-in row
- Toggle light/dark via existing toolbar (already wired in `.storybook/preview.tsx`)
- Each row should be self-contained inline styles — don't add new theme variants until the user picks
- Delete the spike file after the user decides

### 2. Group B context

The current `raiseActionButton` variant in `theme.ts` is the loudest debt in the app:
- `backdropFilter: blur(8px)` (Solid-Over-Glass debt)
- Hover transforms to brand.green with `0 6px 16px rgba(54, 163, 123, 0.35)` glow shadow (No-Glow debt)
- `translateY(-2px)` lift on hover
- Active: `scale(0.96)`

Used 8× in `app/components/Footer/RaiseInputBox.tsx`. Most-pressed surface in the entire app.

The user already noted: "the press-down (`scale 0.96`) is good — that's the satisfying part. The glow undermines it." Tactile's `translateY(2px)` + edge-collapse press is more honest than `scale(0.96)` here, but the table surface has tighter physical scale (these buttons live over the felt at responsive sizes 70–85px wide × 28–40px tall) — your tactile recipe needs to read at those dimensions. Think about: edge thickness on a 28px-tall button (probably 1px not 2px), letter-spacing tightening at 8–10px font sizes.

### 3. After the user picks
- Add new variant(s) to `theme.ts` (likely just `tactileTableAction` — one variant; Raise/Call/Fold are stylistically identical)
- Define **only the live state** (bg, color, border, hover, active). Don't hand-roll `_disabled` or `_loading` — `Button.baseStyle` already handles both via `filter` + `pointerEvents: 'none'`. Override only if the table-action surface genuinely needs something different (e.g. a louder disabled tell because the table is fast-paced).
- Update `RaiseInputBox.tsx` to use the new variant. Don't pass `opacity` / `cursor` / raw `disabled` props on the consumer side — use `isDisabled`.
- Delete the `raiseActionButton` variant
- Verify type-check + lint + build clean
- Update this file's status table

### 4. Hand back
Self-review, list what to eyeball in browser, ask if they want to move to Group C.

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
