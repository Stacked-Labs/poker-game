## Frontend Multi-Table Migration Plan (Per-Table WebSocket)

This plan enumerates all frontend edits needed to support one WebSocket connection per table, aligned with the backend spec in `frontend-multitable-implementation.md`.

### 1) Connection architecture: only on table pages (one socket per visible table)

Goal: Only render a WebSocket on `/game/[id]` routes. Each table view owns its own WebSocket connected to `wss://<host>/ws/table/{tableID}`. Open on mount, close on unmount. No multiplexing across tables or non-game pages.

- Files to change

    - `app/contexts/WebSocketProvider.tsx`
        - Convert to a per-table provider (accept `tableId: string` prop) and build the per-table URL.
        - Current: uses a single global `WS_URL` and sends `join-game` with `gameID` from global state on open.
        - New: connect to `wss://<host>/ws/table/{tableId}`. On `onopen`, send `{ action: "join-table" }` (no payload).
        - Keep existing inbound handlers (already support `update-player-uuid`, `update-game`, `new-message`, `new-log`, `error`, `game-paused`, `game-resumed`, `pending_players_update`, `is_pending_player`).
        - Ensure cleanup closes the socket when the provider unmounts.
    - `app/providers.tsx`
        - Remove the global `<SocketProvider>` wrapper so Home/Create-Game pages do not create any WebSocket connection.
    - `app/game/[id]/layout.tsx` (or `page.tsx`)

        - Wrap the game route children with the per-table socket provider, passing the route `id` as `tableId`.
        - Example: `<SocketProvider tableId={params.id}>{children}</SocketProvider>`.

    - `app/page.tsx` (Home)
        - Remove dependency on `SocketContext`. The redirect should not depend on a socket being present. Use only `appState.table` → `router.push(/game/${appState.table})`.
    - `app/create-game/page.tsx`
        - Confirm no socket usage. Keep it socket-free; use HTTP only for creation/auth flows.

Notes

- This reduces unnecessary connections on Home/Create-Game and aligns with backend guidance: one connection per visible table view.
- If you prefer not to change the global provider signature, create a new `app/contexts/TableSocketProvider.tsx` and use it only under `app/game/[id]/` while leaving the old provider unused/removed at root.
- Preserve reconnection logic; it should reopen the same table URL and resend `join-table` on `onopen`.

### 2) Initial handshake and reconnect flow

Goal: On socket open, send `{ action: "join-table" }`. On reconnect, do the same and expect fresh `update-player-uuid` followed by `update-game`.

- Files to change
    - `app/contexts/WebSocketProvider.tsx`
        - Replace the `join-game` send with `join-table` (no `gameID`/`tableName`).
    - `app/game/[id]/page.tsx`
        - Remove the explicit `joinTable(socket, tableId)` call. The provider handles the handshake.
        - Keep `dispatch({ type: 'setTablename', payload: tableId })` so HTTP endpoints (e.g., owner checks) can still reference table ID via state.

### 3) Update outbound message schemas (remove tableName everywhere)

Goal: No outbound payload includes `tableName`/`tablename`. The connection context implies the table.

- Files to change
    - `app/hooks/server_actions.ts`
        - Remove `tablename` from `joinTable` or delete the helper entirely (provider handles handshake).
        - Update moderation helpers to omit table name:
            - `acceptPlayer(socket, uuid)` (remove `tableName` param and field)
            - `denyPlayer(socket, uuid)`
            - `kickPlayer(socket, uuid)`
        - Leave action helpers as-is (they already match the catalog):
            - `sendMessage`, `sendLog`, `newPlayer`, `takeSeat`, `player-call/check/raise/fold`, `request-leave`, `pause-game`, `resume-game`, `start-game`, `reset-game`.
    - Call sites
        - `app/components/NavBar/Settings/PlayerList.tsx`
            - Update calls to `acceptPlayer/denyPlayer/kickPlayer` to only pass `(socket, uuid)`.
        - `app/game/[id]/page.tsx`
            - Remove `joinTable(socket, tableId)` invocation.

### 4) Inbound message handling and state updates

Goal: Use the per-connection inbound catalog as the single source of truth for table state.

- Files to review/adjust (mostly already compliant)
    - `app/contexts/WebSocketProvider.tsx`
        - Already handles:
            - `update-player-uuid` → dispatch `updatePlayerID`
            - `update-game` → dispatch `updateGame`
            - `new-message`/`new-log` → append to state (and unread tracking)
            - `game-paused`/`game-resumed` → toasts + optimistic `paused` toggle
            - `pending_players_update` (type-based) and `is_pending_player` (type-based) → set `pendingPlayers` / `isSeatRequested`
        - Keep centralized `error` handling with toasts.

### 5) Spectator behavior and chat

Goal: Spectators can connect and receive updates without a username. Chat "send-message" will error server-side; UI should reflect that.

- Files to verify
    - `app/components/NavBar/Chat/ChatBox.tsx`
        - Sending is already gated by `!username && !clientID`. This is acceptable because `new-player` sets username and server sets `clientID` via `update-player-uuid`.
        - Centralized error handling in the socket provider will surface any server `action:"error"` responses for unauthorized chat.
    - `app/hooks/server_actions.ts`
        - `sendLog` remains allowed for spectators; no change needed.

### 6) Owner-only guardrails

Goal: UI can conditionally show owner controls, but enforcement is server-side per connection.

- Files to verify/update
    - `app/components/NavBar/StartGameButton.tsx` and pause/resume buttons inside `app/components/NavBar/index.tsx`
        - No schema changes required. Keep guard via `useIsTableOwner()` and handle server `error` events gracefully.
    - `app/hooks/server_actions.ts`
        - Ensure `pause-game`, `resume-game`, `start-game`, `reset-game` remain as simple `{ action: ... }` sends.

### 7) Identity handling per table

Goal: Use `update-player-uuid` to set identity (`clientID`) per connection.

- Files
    - `app/contexts/WebSocketProvider.tsx`
        - Already dispatches `updatePlayerID` on `update-player-uuid`.
    - `app/contexts/AppStoreProvider.tsx`
        - Global store is fine because each table is typically opened in its own tab; the provider scoping per route ensures separation at runtime.

### 8) Remove legacy multiplexing and `tableName` references

Goal: No client code routes messages by table name; the connection defines the context.

- Files to clean up
    - `app/hooks/server_actions.ts`
        - Remove `tableName` payload fields and extra parameters from moderation helpers.
    - `app/game/[id]/page.tsx`
        - Delete legacy `joinTable` call and any reliance on `tableName` in WS payloads.

### 9) Reconnection semantics

Goal: If the socket drops, the provider should reconnect to the same table URL and resend `join-table`.

- Files
    - `app/contexts/WebSocketProvider.tsx`
        - Retain existing backoff, toasts, and `onopen` handshake. Make sure the reconnection path rebuilds the per-table URL using the stored `tableId` prop.

### 10) Minimal test plan (manual until automated tests are added)

- Open two tables in two tabs: ensure independent state, no cross-talk.
- Join a seat on table A; verify chat on table B as spectator errors gracefully and does not affect A.
- Owner on table A can accept/deny/kick; non-owner receives `error` when attempting those actions.
- Pause/Resume on A does not affect B; banners and controls update correctly.
- Reload a tab mid-game; verify `update-player-uuid` then `update-game` arrive and UI hydrates.

### File-by-file checklist

- `app/contexts/WebSocketProvider.tsx`
    - [ ] Add `tableId` prop and compute URL: `wss://<host>/ws/table/{tableId}`
    - [ ] Send `{ action: 'join-table' }` on open (remove `join-game` branch)
    - [ ] Keep/verify inbound handlers (already aligned)
    - [ ] Ensure cleanup closes per-table socket
- `app/providers.tsx`
    - [ ] Remove global `<SocketProvider>`
- `app/game/[id]/layout.tsx`
    - [ ] Wrap route with per-table socket provider
- `app/game/[id]/page.tsx`
    - [ ] Remove `joinTable(socket, tableId)` call
    - [ ] Keep `setTablename` dispatch for HTTP-only flows
- `app/hooks/server_actions.ts`
    - [ ] Remove `joinTable` or strip `tablename` entirely (not needed)
    - [ ] Change signatures and payloads for `acceptPlayer/denyPlayer/kickPlayer` to `{ action, uuid }`
    - [ ] Leave player actions, logs, chat as-is
- `app/components/NavBar/Settings/PlayerList.tsx`
    - [ ] Update calls to moderation helpers to remove `appState.table` argument
- `app/components/NavBar/index.tsx`, `app/components/StartGameButton.tsx`
    - [ ] No payload changes; verify against new provider scope
- `app/components/NavBar/Chat/ChatBox.tsx`
    - [ ] Keep current gating; rely on provider error handling

### Environment/Config notes

- `NEXT_PUBLIC_WS_URL` usage
    - If it currently includes `/ws`, derive the per-table URL by appending `/table/{tableId}`.
    - Alternatively, introduce `NEXT_PUBLIC_WS_ORIGIN` and assemble `wss://<origin>/ws/table/{tableId}` safely.

---

This plan keeps component wiring largely intact, focusing changes on: (1) scoping the socket provider per table, (2) removing `tableName` from outbound messages, and (3) eliminating the legacy join path in the page while preserving centralized inbound handling and error UX.
