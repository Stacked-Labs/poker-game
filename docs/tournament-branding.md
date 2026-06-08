# Tournament host branding (logo + background)

Lets a Host give their tournament a custom look so communities can run branded
events on Stacked. Two images: a **logo** (square) and a **background/banner**
(wide). They appear on the tournament's **lobby card** and **details page**.

> **Status: frontend only, with placeholders.** This PR ships the UI and the
> render paths. It does **not** upload or persist anything yet — image picks are
> local previews (object URLs) that vanish on refresh. The backend work below is
> the follow-up needed to make branding real.

## What's in this PR (frontend)

- **Create-tournament form** — a new optional **Branding** block in *Basics* with
  two pickers (`ImageUploadField`): logo + background. Click or drag-drop,
  preview, replace, remove. Frontend only: it reads the file into an object URL
  for preview and returns it via `onSubmit` values (`logoUrl`, `bannerUrl`). No
  network upload happens.
- **Types** — optional `logo_url` / `banner_url` added to the `Tournament` type
  (`app/hooks/server_actions.ts`) and `logoUrl` / `bannerUrl` to
  `CreateTournamentFormValues`.
- **Lobby card** (`TournamentLobbyCard`) — one layout for every card: a full-bleed
  banner strip with a same-size avatar inset in its lower-left, then the title.
  The banner is the uploaded banner, or the generated type cover when none is set;
  the avatar is the uploaded logo, or the generated type mark when none is set. So
  a card with only a logo, only a banner, or no upload at all still matches the
  proportions of a fully branded one.
- **Detail hero** (`TournamentDetail`) — full-bleed banner behind the title with
  the logo inset; falls back to the generated type cover + avatar when neither is
  set.
- Storybook demos: the populated lobby in `PublicGames/TournamentLobby ›
  Showcase` and the per-path comparison in `PublicGames/TournamentLobby ›
  BrandingMatrix`; single-card states in `PublicGames/TournamentLobbyCard`; the
  detail hero in `Tournament/TournamentDetail`; and the generated primitives in
  `Tournament/Foundations/DefaultBranding`.

Everything degrades gracefully: with no `logo_url` / `banner_url` the UI shows
the generated, type-based default described next.

## Default branding (no upload)

When a Host uploads neither a logo nor a banner, the tournament still gets a
clean, on-brand identity derived from its **type** (Hyper, Turbo, Regular,
Deep). It mirrors the create-tournament type picker, so the look stays
consistent from the moment a Host picks a structure through to the lobby and the
detail page.

- **Avatar** (`TournamentDefaultAvatar`) — the type's icon (bolt, fire, clock,
  layers) in the type's accent color on a faint accent-tinted tile. Used as the
  lobby-card and detail-page hero avatar whenever no logo is uploaded.
- **Cover** (`TournamentDefaultCover`) — the neutral surface, wallpapered with
  card suits in the type's accent color. Used as the lobby-card banner strip and
  the detail-page hero banner whenever no banner is uploaded.

Both are color-mode aware (legible in light and dark) and keep the type color as
a small accent rather than a flood. They take only a `type` (the blind
structure), so there is no per-tournament randomness: every Hyper looks like
every other Hyper, every Turbo like every other Turbo, etc. Implemented in
`app/components/PublicGames/tournamentDefaults.tsx`, which also exports
`TYPE_IDENTITY` and `identityFor`.

Only an uploaded banner drives the full-page blurred ambient wash on the detail
page; generated (no-upload) tournaments keep the neutral page color.

## What the backend needs (follow-up)

1. **Upload + storage.** Accept two optional images (logo, banner) when a host
   creates a tournament (and ideally when editing one). Recommended:
   **pre-signed upload URLs** — backend issues short-lived upload URLs to an
   object store (S3/R2/GCS), the client PUTs the files directly, then the
   tournament is created/updated with the resulting public URLs. (A multipart
   endpoint that proxies the upload is also fine but heavier.)
2. **Validation.** Allow `image/png`, `image/jpeg`, `image/webp`. Size caps
   (suggested: logo ≤ 2 MB, banner ≤ 5 MB). Suggested dimensions: logo square
   (~256×256), banner wide ~3:1 (~1200×360). Server-side downscale/optimize and
   strip EXIF; consider generating a small logo thumbnail.
   - **Ambient/LQIP variant.** The detail page renders the banner a second time
     as a heavily-blurred full-page ambient wash. Serving a tiny pre-blurred
     low-res variant (e.g. `banner_blur_url`, ~32–64px wide) would let the page
     paint that instantly instead of blurring the full-size image client-side.
     Optional but recommended for perf.
3. **Persist** `logo_url` and `banner_url` (nullable) on the tournament record.
4. **Return** both fields in the tournament payloads: `GET /api/tournaments` and
   `GET /api/tournaments/:id` (snake_case `logo_url` / `banner_url`, matching the
   frontend type).
5. **Authorization.** Only the Host (`gameCreator`) may set or change branding.
6. **Abuse/moderation.** These render on a public lobby — add a way to flag/clear
   imagery, verify real content-type (magic-byte sniff, not just the extension),
   and consider a lightweight moderation step before public display.

## Frontend follow-up once the backend exists

- Swap the local object-URL preview in `ImageUploadField` for the real upload
  (pre-signed PUT), surfacing progress + error states.
- Send the stored URLs (not object URLs) from the create form.
- Drop the "placeholder / frontend-only" notes here and in the code comments.
