# Motion Patterns — Stacked Poker

Animation vocabulary for the Stacked Poker UI. All motion should feel **composed and intentional** — poker is a game of control, and the UI should reflect that.

---

## Core principles

1. **Punctuate, don't decorate** — motion marks state changes, not idle time
2. **Physics-based easing** — no `linear`, no `ease`. Use spring curves or custom ease-out
3. **Respect reduced motion** — always check `useReducedMotion()` and provide static fallbacks
4. **Stagger, don't simultaneous** — grouped elements enter with 40-60ms delays
5. **Quick in, slow out** — entrances are fast (150-250ms), exits are slightly faster (100-200ms)

---

## Easing library

| Name | Curve | Use |
|------|-------|-----|
| Smooth out | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Default for most reveals |
| Snap | `cubic-bezier(0.19, 1, 0.22, 1)` | Chip slides, card flips |
| Bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Win celebrations, badge pops |
| Gentle | `cubic-bezier(0.4, 0, 0.2, 1)` | Fade transitions, modals |

---

## Pattern catalog

### Page / section entry

Fade-up with stagger. Used for lists, card grids, dashboard sections.

```tsx
// Chakra + CSS keyframes approach
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

<Box
  animation={`${fadeUp} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`}
  style={{ animationDelay: `${index * 50}ms` }}
  opacity={0}
/>
```

### Card hover lift

Subtle scale + shadow upgrade. Used for interactive cards (game tables, leaderboard rows).

```tsx
<Box
  transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  _hover={{
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: 'glass-hover',
  }}
  _active={{
    transform: 'translateY(0) scale(0.98)',
    boxShadow: 'glass-active',
  }}
/>
```

### Button press

Scale down on active, bounce back on release.

```tsx
<Button
  transition="all 0.15s cubic-bezier(0.19, 1, 0.22, 1)"
  _active={{ transform: 'scale(0.96)' }}
/>
```

### Modal / drawer entry

Fade backdrop + slide-up content.

```tsx
// Chakra Modal already handles this — customize via motionPreset
<Modal motionPreset="slideInBottom" ...>
```

For custom modals, use `opacity: 0 → 1` on overlay and `translateY(24px) → 0` on content, both at 250ms with `gentle` easing.

### Chip count change

Number rolls up/down with a brief scale pulse.

```tsx
// Scale pulse on value change
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Trigger animation on value change via key prop
<Text
  key={chipCount}
  animation={`${pulse} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`}
  color="brand.yellow"
  fontWeight="bold"
/>
```

### Win / success glow

Glow shadow pulses 2-3 times then settles.

```tsx
const glowPulse = keyframes`
  0%, 100% { box-shadow: var(--chakra-shadows-glow-green); }
  50% { box-shadow: 0 0 24px 8px rgba(54, 163, 123, 0.5); }
`;

<Box animation={`${glowPulse} 0.8s ease-in-out 3`} boxShadow="glow-green" />
```

### Toast / notification entry

Slide in from top-right with opacity fade. Chakra's toast system handles this, but for custom notifications:

```tsx
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
`;
```

### Skeleton loading

Use Chakra's `<Skeleton>` with the brand colors:

```tsx
<Skeleton
  startColor="whiteAlpha.100"
  endColor="whiteAlpha.200"
  borderRadius="lg"
/>
```

In light mode: `startColor="gray.100"` / `endColor="gray.200"`.

---

## Playful punctuation (tournament & live surfaces)

A small, **earned** layer of character for lived-in surfaces — the live tournament HUD, payout ladders, the details page. Penthouse-playful, never Chuck-E-Cheese: real iconography over emoji, brand tokens over neon, one delight per moment. Every pattern here is gated on `usePrefersReducedMotion()` with a static fallback. Use sparingly — if everything bounces, nothing reads.

### Leader crown

A `PiCrownFill` (react-icons) on the chip leader's avatar / your strip, with a slow royal sway. Static (no animation) under reduced motion — keep a baseline `transform` so it stays put.

```tsx
const crownBob = keyframes`
  0%, 100% { transform: translateY(0) rotate(-7deg); }
  50%      { transform: translateY(-2px) rotate(7deg); }
`;
<Icon as={PiCrownFill} color="brand.yellow" boxSize="17px"
  sx={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}
  animation={prefersReducedMotion ? undefined : `${crownBob} 2.4s ease-in-out infinite`} />
```

### Coin-rain celebration

A short, one-shot burst at a genuine milestone (reaching the money). Deterministic offsets — **no `Math.random()`** (SSR must agree). USDC discs for real money, chip discs for Free Play. Fire once on the state crossing (see "crossing hook" below), never on idle. Skip entirely under reduced motion.

```tsx
const coinFall = keyframes`
  0%   { opacity: 0; transform: translateY(-16px) scale(0.5) rotate(0); }
  18%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(58px) scale(1) rotate(240deg); }
`;
// Render absolutely-positioned coins inside an overflow:hidden parent, each with a
// fixed left%/delay/duration from a constant array. Bounce easing (0.34,1.56,...).
```

### Crossing hook (fire-once on a state change)

Reusable shape for "celebrate the moment X becomes true" — drives the coin-rain, ITM flourish, and rank-change pulse. Tracks the previous value in a ref and returns `true` for a beat on the transition.

```tsx
function useCrossing(active: boolean, ms = 1300): boolean {
  const prev = useRef(active);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (active && !prev.current) {
      setOn(true);
      const id = setTimeout(() => setOn(false), ms);
      prev.current = active; return () => clearTimeout(id);
    }
    prev.current = active;
  }, [active]);
  return on;
}
```

A directional variant (compare numbers, return `'up' | 'down' | null`) drives ▲/▼ rank-change arrows — pop them in with the bounce `popIn` and let them fade.

### Flip tile (tap for detail)

A scoreboard stat that flips on tap/Enter to a detail face — keyboard-accessible (`role="button"`, `tabIndex`, Enter/Space, focus ring), spring easing on the flip, green border to signal the flipped state.

```tsx
<Box sx={{ perspective: '900px' }} h="96px">
  <Box role="button" tabIndex={0} onClick={() => setFlipped(f => !f)}
    transform={flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}
    transition={reduce ? undefined : 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'}
    sx={{ transformStyle: 'preserve-3d' }}>
    <Box sx={{ position:'absolute', inset:0, backfaceVisibility:'hidden' }}>{front}</Box>
    <Box sx={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)' }}>{back}</Box>
  </Box>
</Box>
```

### In-row share bar

Embed a faint, left-anchored bar **inside** a data table row to show relative magnitude (prize size, stack depth) without adding a column — set it as a `backgroundImage` gradient on the row, layered over the existing wash `backgroundColor`.

```tsx
sx={{
  backgroundColor: washColor,
  backgroundImage: `linear-gradient(to right, ${barColor} ${pct}%, transparent ${pct}%)`,
}}
```

### Live-level pulse / "you are here"

A 6px dot with a breathing halo marks the live row; an `inset` left-border + a "you" tag flags the viewer's own row. Stagger table rows in with `rowFade` (opacity-only on `<tr>` — translateY is unreliable on table rows) at `i * 40ms`.

```tsx
const livePulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(54,163,123,0); }
  50%      { box-shadow: 0 0 0 4px rgba(54,163,123,0.32); }
`;
```

### Progress bar: grow-in + shimmer + value pop

Grow the fill from the left with `transform: scaleX` (GPU-friendly; `transformOrigin: 'left'`), sweep a soft highlight across it on a loop, and pop the paired value on change via a `key`-triggered `valuePop`. Reduced motion → static full-width bar, no shimmer.

```tsx
const fillGrow = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`;
// shimmer: an absolute 40%-wide white-gradient stripe translating across the fill.
```

---

## Reduced motion fallback

Always wrap animation logic:

```tsx
import { useReducedMotion } from '@chakra-ui/react';

const prefersReducedMotion = useReducedMotion();

<Box
  animation={prefersReducedMotion ? undefined : `${fadeUp} 0.3s ease forwards`}
  opacity={prefersReducedMotion ? 1 : 0}
/>
```

For CSS-only animations, use:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Duration reference

| Context | Duration | Notes |
|---------|----------|-------|
| Micro-interaction (hover, focus) | 100-150ms | Must feel instant |
| Button feedback | 150ms | Scale down/up |
| Card reveal / fade-in | 200-300ms | With stagger |
| Modal entry | 250ms | Slide + fade |
| Page transition | 300-400ms | Full section swap |
| Celebration (glow pulse) | 800ms x 2-3 | Then settle |
| Number count-up | 400-600ms | For large value changes |
