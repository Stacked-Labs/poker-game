# CSP / headers (repo-specific)

## Where CSP is set

- `next.config.js` sets `Content-Security-Policy` headers for `/:path*`.

## When to touch CSP

- Embedded wallet does not render (blank iframe) → update `frame-src`.
- Wallet/network calls fail (blocked by browser) → update `connect-src`.
- Turnstile issues → ensure script/frame/style directives include Cloudflare endpoints as required.
- Tenor/GIF rendering issues → ensure `img-src` and `images.remotePatterns` allow the needed hosts.

## Rules of thumb

- Keep directives as tight as possible for production; avoid adding wildcards unless required.
- If you add a new third-party integration, update CSP and document *why* in the PR description.

