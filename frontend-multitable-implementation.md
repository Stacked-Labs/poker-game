Frontend Integration Guide: Multi-Table (One Connection Per Table)
This document summarizes all backend changes relevant to the frontend and provides concrete guidance to update the client for the new multi-table architecture.
What changed (high-level)
One WebSocket connection per table. Each browser tab or in-app view that shows a table opens its own WS connection.
Table-specific WS URL. No generic /ws route; each connection targets a specific table.
No tableName in messages. Connection context provides the table, so payloads are simpler.
Spectator-friendly join. join-table no longer carries a username; spectators can join and subscribe immediately.
Multiple connections per session/address are supported (soft limits only).
Owner moderation and pause/resume are enforced server-side using the connection’s table context.
Connect flow
Connect to a table using a table-specific URL:
wss://<host>/ws/table/{tableID}
Authentication:
Optional. If the auth_token cookie is present and valid, the server marks the connection authenticated to an address; otherwise, the connection still works as spectator/player where allowed.
After the socket opens, send:
{"action":"join-table"}
Message catalog (client → server)
All payloads omit tableName. All messages include action.
Session/table
{"action":"join-table"}
Chat and activity log
{"action":"send-message","message":"..."}
Requires a username (spectators will receive an error)
{"action":"send-log","message":"..."}
Player onboarding and seating
{"action":"new-player","username":"Alice"}
{"action":"take-seat","username":"Alice","seatID":3,"buyIn":100}
Owner moderation (owner only; will error if not owner)
{"action":"accept-player","uuid":"<pendingPlayerUUID>"}
{"action":"deny-player","uuid":"<pendingPlayerUUID>"}
{"action":"kick-player","uuid":"<playerUUID>"}
Game lifecycle (owner only; will error if not owner)
{"action":"start-game"}
{"action":"reset-game"}
{"action":"pause-game"}
{"action":"resume-game"}
Player actions
{"action":"player-call"}
{"action":"player-check"}
{"action":"player-raise","amount":250}
{"action":"player-fold"}
{"action":"request-leave"}
Leaving
{"action":"leave-table"}
Message catalog (server → client)
All payloads omit tableName; connection context determines the table.
Identity
{"action":"update-player-uuid","uuid":"<uuid>"}
Game state
{"action":"update-game","game": <GameView> }
Sent broadly after state changes, accept/deny, kick, pause/resume, etc.
Chat and logs
{"action":"new-message","uuid":"<id>","message":"...","username":"...","timestamp":"..."}
{"action":"new-log","uuid":"<id>","message":"...","timestamp":"..."}
Errors: {"action":"error","code":<int>,"message":"..."}
Pause/Resume
{"action":"game-paused","pausedBy":"<ownerUsername>" }
{"action":"game-resumed","resumedBy":"<ownerUsername>" }
Pending players (owner-only informational)
{"type":"pending_players_update","payload":[ { "uuid":"...", "username":"...", "seatId":N, "buyIn":M }, ... ] }
Is player pending (player-specific)
{"type":"is_pending_player","payload":true|false}
Required frontend changes
Connection routing
Replace generic /ws with per-table endpoint: wss://<host>/ws/table/{tableID}.
Open one WS per visible table (per tab or view). Do not multiplex multiple tables over a single connection.
Initial handshake
After open, send {"action":"join-table"}. No username required.
Remove tableName from all outbound payloads
Delete any tableName fields. The backend derives the table from the connection.
Spectators and chat
Spectators can connect and receive updates immediately.
Spectators attempting send-message will receive an action:"error" response; allow send-log.
Owner-only guardrails
accept-player, deny-player, kick-player, pause-game, resume-game, start-game, reset-game will be rejected if called by a non-owner connection. Handle action:"error" gracefully.
Identity handling
On connection, store the latest uuid from action:"update-player-uuid". Use it for client-side identity within that table.
State updates
Subscribe to action:"update-game" for all table-state rendering. Treat this as the source of truth per connection.
Pause/resume UX
Handle action:"game-paused" and action:"game-resumed" to update controls, timers, and banners.
Error handling
Centralize handling for action:"error" with user-friendly feedback.
Multiple connections per user
The frontend may open multiple WS connections (one per table). Each is independent; do not share per-connection state (username, seat, etc.) across sockets.
Optional auth
If the user is authenticated, the auth_token cookie should be present and valid. The server will validate and associate an address; otherwise, the connection still works for spectators and free tables. No changes required in WS handshake parameters.
Reconnection
On reconnect:
Re-open the same wss://.../ws/table/{tableID}.
Send {"action":"join-table"} again.
Expect a fresh update-player-uuid and subsequent update-game.
Example client sequence per table

1. Open WS to wss://.../ws/table/{tableID}
2. On open, send:
   {"action":"join-table"}
3. If the user chooses a seat:
   {"action":"new-player","username":"Alice"}
   {"action":"take-seat","username":"Alice","seatID":3,"buyIn":100}
4. Listen for:
   update-player-uuid, update-game, error, game-paused, game-resumed, pending_players_update (owner).
   Owner console quick reference
   Accept seat request: {"action":"accept-player","uuid":"<pendingUUID>"}
   Deny seat request: {"action":"deny-player","uuid":"<pendingUUID>"}
   Kick player: {"action":"kick-player","uuid":"<playerUUID>"}
   Pause: {"action":"pause-game"}
   Resume: {"action":"resume-game"}
   Start/Reset: {"action":"start-game"}, {"action":"reset-game"}
   Operational notes (impact to frontend)
   Soft limits only:
   Up to 10 concurrent connections per authenticated address and high table limits are allowed server-side; no enforced hard caps. Frontend can open many table connections, but should avoid creating redundant sockets for the same table.
   Unauthenticated users:
   Supported end-to-end; some actions (e.g., crypto-table creation, certain owner flows) require auth on the server side.
   Migration checklist
   Update all WS URLs to /ws/table/{tableID}.
   Remove tableName fields from all outbound messages.
   Send join-table after opening.
   Ensure UI does not assume global username; username is per-table.
   Add handlers for:
   update-player-uuid, update-game, game-paused, game-resumed, error, pending_players_update.
   Guard UI actions by role (owner vs. non-owner), and handle server rejections.
   Confirm spectator behavior:
   Spectators may view state; send-message will error; send-log allowed.
   Test with multiple tabs:
   Two or more connections with the same session/address across different tables should function independently.
   Reconnect paths:
   On reconnect, resend join-table and rehydrate from update-game.
   Remove any legacy routing/multiplexing code for multi-table over single connection.
   Update unit/integration tests to reflect the simpler message schema and per-table connection model.
   Optional but recommended: centralize WS client creation per table to standardize handshake, identity handling, incoming action routing, and teardown.
   Logging and analytics:
   Consider tagging events with tableID from the connection URL rather than a payload field.
   Performance:
   Ensure each table UI view owns and cleans up its own WS (open on mount, close on unmount).
   Security:
   Rely on server-side checks for owner-only actions; still, disable owner UI controls in the client when not owner.
   Error UX:
   Map common error codes/messages (e.g., 400 validation, 403 owner-only) to actionable user feedback.
   Backward compatibility:
   Not required in this branch. Remove legacy per-message table routing and validation.
   Testing:
   Add multi-connection tests (two tables open) to ensure no cross-talk. Validate pause/resume and owner moderation flows.
   Docs:
   Update any API or message catalogs on the frontend to mirror the inbound/outbound schemas above.
   Note: Username for a connection is table-specific; do not assume or reuse usernames across table sockets.
   Note: Outbound paused/resumed messages omit tableName; use connection context.
   Note: Server sends update-player-uuid shortly after registration; use it for identity state per table.
   Note: Spectator join requires only join-table; they will still receive update-game broadcasts.
   Note: For crypto tables, creation/auth flows occur via HTTP; WS remains table-specific and optional-auth.
   Note: The server maintains per-connection state; no need to send tableName anywhere in WS.
   Note: Use error action responses for operational guidance; do not retry owner-only actions on a non-owner connection.
   Note: Maintain one WS per visible table; do not share a single WS among multiple tables.
   Note: Do not depend on server-side connection auto-join beyond join-table; always issue it explicitly after open.
   Note: Pending player updates use type:"pending_players_update" (not action); handle both action- and type-based envelopes in your client message router.
   Note: Auto-deal signaling is internal to the server; the frontend only needs to react to update-game and paused/resumed messages.
