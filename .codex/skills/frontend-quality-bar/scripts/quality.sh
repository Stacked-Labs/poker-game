#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$repo_root"

mode="${1:-full}"

if [[ "$mode" == "fast" ]]; then
  echo "Running fast checks: lint"
  npm run lint
  exit 0
fi

echo "Running checks: lint + build"
npm run lint
npm run build

echo "Tip: run 'npm run format' if formatting drift is expected."

