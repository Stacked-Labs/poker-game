# Auth flow (repo-specific)

## Files

- Client hook: `app/hooks/useWalletAuth.ts`
- Backend calls: `app/hooks/server_actions.ts`
- Auth context: `app/contexts/AuthContext.tsx`

## Current intended behavior

- Auth runs once at provider level (to avoid duplicate auth attempts from multiple wallet UI mounts).
- A ref (`authAttemptRef`) prevents duplicate attempts for the same address.
- If user rejects/cancels signature:
  - Disconnect wallet
  - Show a warning toast
- If verification fails or errors:
  - Disconnect wallet (security default)
  - Show error toast

## Common bug patterns

- **Signing the wrong payload**: sign the SIWE *message string*, not the JSON payload.
- **Auth loop**: caused by missing cookie persistence, `isAuth()` returning false unexpectedly, or the attempt ref resetting.
- **Multiple auth triggers**: multiple mounts of auth hook; ensure it’s only invoked in one provider-level place.

## Checklist for changes

- Keep error handling consistent: user-friendly toast + console logs for debugging.
- Preserve the “disconnect on failure” safety posture unless explicitly changing security behavior.
- Avoid leaking backend responses or secrets into UI or logs.

