# MiniKit Context & Safety

- `useMiniKit()` exposes `context`, `isFrameReady`, and `setFrameReady()`.
- Context values can be spoofed. Do not use them for authentication.
- Use `useAuthenticate()` for verified identity in security-sensitive flows.
- Consider `useAddFrame()` if you need save/install + notification token.
- Use `useClose()` to close the mini app after completion.
