# Codex skills (repo-local)

This repo includes Codex skills under `.codex/skills/`.

## Recommended: use repo-local `CODEX_HOME`

Run Codex with `CODEX_HOME` pointing at this repo’s `.codex` folder so skills stay repo-scoped:

```bash
CODEX_HOME="$PWD/.codex" codex
```

Note: Codex may write additional state under `.codex/` (auth, logs, etc). This repo’s `.gitignore` keeps everything under `.codex/` ignored except `.codex/skills/`.

If you want this to persist for your shell session:

```bash
export CODEX_HOME="$PWD/.codex"
codex
```

Restart Codex after adding/editing skills.

## Optional: install into your user Codex home

If you prefer the usual `~/.codex/skills` location, run:

```bash
./scripts/install-codex-skills.sh --copy
```

Or symlink (best for contributors iterating on skills):

```bash
./scripts/install-codex-skills.sh --symlink
```

Restart Codex after installing.
