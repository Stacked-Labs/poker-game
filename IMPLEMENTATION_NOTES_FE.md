# Action Time Bank — Phase 2 Frontend Notes

Branch: `feat/action-time-bank` (poker-game, off `third-tourney-fixes`)
Plan: `docs/action-time-bank-implementation-plan.md` §14 (PR #290 backend = poker-server #292)
Scope: frontend only.

## Wire contract consumed (shipped by backend PR #292)
- `update-game` → each player gains `timeBankMs` (ms); `config` gains `baseActionMs` (ms).
- `actionDeadline` (absolute epoch ms) already encodes `base + bank`. Client never re-arms.

## Files changed
| File | Change |
|---|---|
| `app/interfaces.tsx` | `timeBankMs?: number` on `Player`; `baseActionMs?: number` on `Config`. |
| `app/contexts/WebSocketProvider.tsx` | `timeBankMs`/`baseActionMs` ride through the wholesale `players`/`config` assignment (verified: lines parse the raw payload directly; backend emits camelCase). Added a `console.warn` when `actionDeadline` is already in the past on receipt (clock-skew/stale-broadcast signal). |
| `app/components/TakenSeatButton.tsx` | **Two-segment action ring** for the current actor + numeric overlay. |
| `app/components/Footer/index.tsx` | Verified only — `actionDeadline === 0` no-timer/reveal check still holds (the bank rides inside the deadline; 0 still means "no timer"). No change. |

## Two-segment ring design (§14)
Split per the plan: `baseRemaining = min(remaining, baseMs)`, `bankRemaining = max(0, remaining - baseMs)`.
- **Base segment** = the guaranteed base clock, the arc nearest the top, depletes **last**, colored green→yellow→red by *base* time remaining (≤10s yellow, ≤5s red).
- **Bank segment** = the extra on top (distinct cool blue `#5AA9FF`), the outer band, depletes **first**. Rendered only when `bankRemaining > 0`.
- Implemented with the component's existing conic-gradient-mask border technique: base box masked to `[360-baseAngle, 360]`; bank box masked to the band `[360-timerAngle, 360-baseAngle]`.
- **Numeric overlay**: shows `+Ns` (bank seconds, blue) while bank remains, then plain base seconds (urgency-colored) on the base floor.
- **Tick-tock cue**: left as-is — fires once 5s before the final deadline (end of base), guarded per-deadline, so no double-fire at the base→bank transition.
- **Graceful fallback**: when `baseActionMs` is absent (feature off / old payload), `baseMs` defaults to the whole window → the ring collapses to a single base segment with the legacy thresholds (byte-compatible behavior).

## Quality bar (exact commands)
- `npx tsc --noEmit` → **PASS** (0 errors)
- `npx next lint` (changed files) → **PASS** (only pre-existing warnings: `timerColorHex` unused [dead code predating this work], two WS `exhaustive-deps` warnings on untouched lines)
- `npm run build` → **PASS** (exit 0)

## Manual QA still needed (for the PR)
- Two browsers on a cash table: ring shows base→bank, depletion + refill across hands; the "+Ns" overlay during bank time; smooth green→yellow→red on the base floor.
- Crypto table: bank keyed by wallet survives a reconnect.
- Light + dark mode check of the new bank color.
- High-latency client: confirm the grace buffer (server-side) keeps a fast-acting throttled player from bleeding bank.

## Notes
- Contract types + WS parsing were started by the initial agent (which hit an API error); the ring/overlay + verification + commits were completed in the parent session.
