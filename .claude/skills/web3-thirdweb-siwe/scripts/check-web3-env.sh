#!/usr/bin/env bash
set -euo pipefail

echo "Checking web3 env vars (from your shell environment)..."

missing=0
for key in NEXT_PUBLIC_THIRDWEB_CLIENT_ID NEXT_PUBLIC_API_URL NEXT_PUBLIC_WS_URL; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing: $key"
    missing=1
  else
    echo "OK: $key"
  fi
done

if [[ $missing -ne 0 ]]; then
  echo ""
  echo "Tip: for local dev, ensure these are present in .env.local (not committed)."
  exit 1
fi

echo "Done."

