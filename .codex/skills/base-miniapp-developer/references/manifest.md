# Manifest (farcaster.json)

- Must be hosted at `/.well-known/farcaster.json` on a public HTTPS domain.
- `accountAssociation` proves domain ownership; generate it by signing the manifest via Base Build or Farcaster tooling.
- The manifest requires a `miniapp` object (or `frame` for backward compatibility).

Minimal example:

```json
{
  "accountAssociation": {
    "header": "<header>",
    "payload": "<payload>",
    "signature": "<signature>"
  },
  "miniapp": {
    "version": "1",
    "name": "My Mini App",
    "description": "Short description",
    "iconUrl": "https://myapp.com/icon.png",
    "homeUrl": "https://myapp.com",
    "canonicalDomain": "myapp.com",
    "requiredChains": ["eip155:8453"],
    "requiredCapabilities": ["actions.ready"],
    "tags": ["games"]
  }
}
```

Optional fields you may include:
- `subtitle`, `splashImageUrl`, `splashBackgroundColor`, `screenshotUrls`, `noindex`.

Notes:
- Changes take effect after redeploy and re-index.
- You can serve a static file in `public/.well-known/farcaster.json` or a route handler that returns JSON.
- Farcaster supports hosted manifests; if you use that, redirect `/.well-known/farcaster.json` to the hosted URL.
