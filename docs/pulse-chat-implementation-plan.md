# Pulse Chat (7TV Inline Emotes) - Frontend Implementation Plan

## Goal
Replace the current GIF-centric chat with a tokenized, inline emote system using 7TV global emotes. First, remove all existing GIF/emoji libraries and integrations to get a clean slate. This is a frontend-only change with no backend adjustments. Keep chat fast, inline with text, and ready for performance-sensitive rendering and features like autocomplete.

## Current Chat Surface (Repo Pointers)
- Chat UI container + toggle + unread badge: `app/components/NavBar/index.tsx`
- Chat sidebar shell: `app/components/NavBar/Chat/SideBarChat.tsx`
- Chat message rendering + input: `app/components/NavBar/Chat/ChatBox.tsx`
- WebSocket message handling (new-message -> store): `app/contexts/WebSocketProvider.tsx`
- Chat state store: `app/contexts/AppStoreProvider.tsx`
- Sound notifications: `app/contexts/SoundProvider.tsx`, `app/utils/SoundManager.ts`

## Clean-Slate Removal (Do First)
Remove all GIF/emoji libraries and integrations currently in the repo before adding 7TV.
- UI: Remove the MediaButton (GIF/emoji popover) from `app/components/NavBar/Chat/ChatBox.tsx`
- Components: Delete `app/components/NavBar/Chat/MediaButton.tsx`
- Hooks: Delete `app/hooks/useTenor.ts`
- API route: Delete `app/api/tenor/route.ts`
- Dependencies: Remove emoji-mart, tenor-related libs, and any unused GIF utilities from `package.json`
- Assets: Remove any GIF-specific handling code paths (e.g., `isGifUrl` in chat rendering)

## Proposed Architecture
### 1) Emote Dictionary Store (Zustand)
Create a new store that owns the EMOTE_DICTIONARY and handles caching + freshness.
- State:
  - `emotesByName: Record<string, Emote>`
  - `emotesById: Record<string, Emote>`
  - `lastFetchedAt: number`
  - `isLoading: boolean`, `error?: string`
- Actions:
  - `hydrateFromCache()` (localStorage)
  - `fetchGlobalEmotes()` (7TV API)
  - `getEmoteByName(name)`

Data model:
```ts
type Emote = {
  id: string;
  name: string;
  url: string; // https://cdn.7tv.app/emote/{id}/1x.webp
};
```

Caching policy:
- Read from localStorage at boot
- Fetch when cache is missing or older than 24h
- Write cache after successful fetch

### 2) Message Tokenization Pipeline
Add a tokenizer that converts raw message strings into tokens before render.
- Inputs: raw text string, emote dictionary, user list (optional for mentions)
- Outputs: `ChatToken[]`

Token types:
```ts
type ChatToken =
  | { type: 'text'; content: string }
  | { type: 'emote'; id: string; url: string; name: string }
  | { type: 'mention'; userId?: string; username: string };
```

Tokenization rules:
- Split by whitespace while preserving punctuation boundaries
- If a token matches an emote name in the dictionary (including `:name:`), emit `emote` token
- If a token matches `@username`, emit `mention`
- All other content remains `text`

Sanitization:
- Do not inject HTML, render as text nodes only
- Avoid `dangerouslySetInnerHTML`

### 3) Inline Renderer
Replace the GIF-only logic with a tokenized renderer.
- Render tokens inside a single line-wrapping text container
- Emote rendering:
  - `<img>` (or `next/image` if it does not force layout shifts)
  - `height: 28px`
  - `min-width: 28px` (prevent layout shift)
  - `vertical-align: middle`
  - `display: inline-block`

### 4) Autocomplete (":" trigger)
Add an inline autocomplete in the ChatBox input.
- Triggered by `:`
- Filter emotes by prefix
- Arrow-key selection + Enter to insert `:emoteName:` or raw name
- Close on Escape or blur

### 5) Virtualized Message List
Replace the current `.map` in `ChatBox` with a virtualization component for performance.
- Add `react-virtuoso` or `react-window`
- Ensure consistent row heights for tokenized messages with emotes

## Implementation Plan (Frontend)
1) Remove GIF/emoji integrations (clean slate) ✅
   - Delete Tenor API route and hook
   - Delete MediaButton component
   - Remove emoji-mart / Tenor dependencies
   - Strip GIF URL detection/rendering in ChatBox

2) Create emote store and fetcher ✅
   - Add Zustand dependency
   - Create `app/stores/emotes.ts`
   - Implement cache read/write + 7TV fetch

3) Add tokenizer + renderer utilities ✅
   - Add `app/utils/chatTokenizer.ts`
   - Add `app/components/NavBar/Chat/MessageRenderer.tsx`

4) Replace message rendering in ChatBox ✅
   - Use tokenizer + renderer for all messages
   - Keep auto-scroll logic

5) Add emote picker (new, 7TV-backed) ✅
   - Read from emote store
   - Insert emote names into input

6) Add autocomplete in ChatBox input ✅
   - Listen to input value and cursor position
   - Show suggestions popover near input

7) Add virtualization ✅
   - Replace list rendering with `Virtuoso` or `FixedSizeList`

8) Styling + UX polish ✅
   - Add CSS for inline emotes and autocomplete list
   - Ensure theme tokens are used

## Key File Touchpoints
- `app/components/NavBar/Chat/ChatBox.tsx`
- `app/contexts/WebSocketProvider.tsx`
- `app/contexts/AppStoreProvider.tsx`
- `app/theme.ts`
 
## Files Removed (Clean Slate)
- `app/components/NavBar/Chat/MediaButton.tsx`
- `app/hooks/useTenor.ts`
- `app/api/tenor/route.ts`

## Backend Impact Analysis (Required at Bottom)
- No backend changes planned or required. All parsing, emote rendering, autocomplete, and virtualization are implemented client-side.
- Constraints with no backend changes:
  - Mentions are best-effort unless a user directory exists on the client.
