#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Install this repo's Codex skills into $CODEX_HOME/skills (defaults to ~/.codex/skills).

Usage:
  ./scripts/install-codex-skills.sh [--copy|--symlink]

Options:
  --copy     Copy skills into destination (default)
  --symlink  Symlink skill folders into destination
EOF
}

mode="copy"
if [[ "${1:-}" == "--symlink" ]]; then
  mode="symlink"
elif [[ "${1:-}" == "--copy" || "${1:-}" == "" ]]; then
  mode="copy"
else
  usage
  exit 2
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src_dir="$repo_root/.codex/skills"

codex_home="${CODEX_HOME:-"$HOME/.codex"}"
dest_dir="$codex_home/skills"

if [[ ! -d "$src_dir" ]]; then
  echo "No skills found at: $src_dir" >&2
  exit 1
fi

mkdir -p "$dest_dir"

shopt -s nullglob
skill_dirs=("$src_dir"/*)
if [[ ${#skill_dirs[@]} -eq 0 ]]; then
  echo "No skills found in: $src_dir" >&2
  exit 1
fi

for skill_path in "${skill_dirs[@]}"; do
  skill_name="$(basename "$skill_path")"
  target="$dest_dir/$skill_name"

  if [[ -e "$target" || -L "$target" ]]; then
    echo "Skip (already exists): $target" >&2
    continue
  fi

  if [[ "$mode" == "symlink" ]]; then
    ln -s "$skill_path" "$target"
    echo "Symlinked: $skill_name -> $target"
  else
    cp -R "$skill_path" "$target"
    echo "Copied: $skill_name -> $target"
  fi
done

echo "Done. Restart Codex to pick up new skills."

