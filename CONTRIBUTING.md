# Contributing & Branching Workflow

This describes how code flows from a developer's machine to production. The
same model applies across our repos (`poker-game`, `poker-server`,
`poker-docs`, …); this copy lives in `poker-game` but the rules are identical
everywhere.

## TL;DR

```
feature branch  ──PR──▶  dev  ──PR──▶  main
  (your work)            (staging)      (production)
```

- **`main`** is production — it deploys to **stackedpoker.io**.
- **`dev`** is staging — it deploys to **dev.stackedpoker.io**.
- **The one rule:** `main` never receives a change that hasn't already lived in
  `dev`. Code only ever moves *up* the pipeline. `dev` is therefore always
  "`main` plus the things we're about to release," which makes every release a
  non-event.

We don't sort changes into branches by risk ("this is cosmetic, push it
straight to main"). **Every change — cosmetic or scary — takes the same route.**
Risk is managed by review, CI, and the staging environment, not by which branch
you pick.

## Day-to-day: shipping a change

1. **Branch from `dev`:**
   ```bash
   git checkout dev && git pull
   git checkout -b feat/short-description   # or fix/… or chore/…
   ```
2. Do the work. Commit in logical chunks.
3. **Open a PR into `dev`.** Fill in the PR template.
4. Get **1 approving review** and a **green build check**.
5. Merge. Squash or merge-commit is fine for feature → `dev`.
6. Your change is now live on **dev.stackedpoker.io**. Verify it there.

That's it. You almost never interact with `main` directly.

## Releasing: promoting `dev` → `main`

When the things in `dev` are ready for players:

1. Open a PR: **base `main`, head `dev`**, titled e.g. `Release: 2026-06-16`.
2. Review the diff — it's everything that's been verified on staging since the
   last release. There should be no surprises.
3. **Merge with a real merge commit — never squash** (see below).
4. Deploy + verify on production.
5. **Tag the release** (`vYYYY.MM.DD` or semver). For releases that span
   frontend **and** backend, use the **same tag in both repos** so a given
   production state is reproducible across the stack.

See [the release checklist](#release-checklist) below.

## ⚠️ Never squash a promotion or reconciliation merge

For **feature → `dev`**, squashing is fine.

For **`dev` → `main`** (and any **`main` → `dev`** reconciliation), you **must**
use *"Create a merge commit."* Squashing collapses the commits into one *new*
commit, so git no longer sees that `main` and `dev` share history — the branches
"forget" they're related and the next promotion re-surfaces every old conflict.
A real merge commit preserves ancestry and keeps `dev` a true superset of `main`.

`main`'s branch protection enforces this (merge-commits only). On `dev`, it's a
discipline rule for promotion/reconciliation PRs.

## Hotfixes (the only sanctioned reason to touch `main` directly)

If production is broken and `dev` isn't releasable, don't wait:

1. **Branch from `main`:** `git checkout -b hotfix/the-problem main`
2. Fix it. PR into `main`, review, merge, deploy.
3. **Immediately back-merge into `dev`** so the two don't drift:
   ```bash
   git checkout dev && git pull
   git merge origin/main        # merge commit, resolve any conflicts
   # open a PR for this into dev
   ```

Step 3 is not optional. Skipping it is exactly how `main` and `dev` drifted
apart before. Better still: prefer **feature flags** (merge unfinished work
turned off) so `dev` stays releasable and hotfixes are rarely needed.

## Branch protection (enforced on `main` and `dev`)

Both branches require:

- A pull request — **no direct pushes**.
- **1 approving review**; stale approvals are dismissed when new commits land.
- **Conversation resolution** before merge.
- **No force-pushes, no deletion.**
- `main` additionally allows **merge-commits only** (no squash/rebase).

Org admins retain an emergency bypass — use it only for genuine incidents, and
follow the hotfix back-merge rule afterward.

## Release checklist

Copy this into the `dev → main` release PR:

```
## Release checklist
- [ ] dev is green on CI and verified on dev.stackedpoker.io
- [ ] No open P0/P1 bugs against anything in this diff
- [ ] DB migrations (if any) are backward-compatible and run-ordered
- [ ] Env vars / secrets needed by new code exist in the prod environment
- [ ] Frontend + backend release tags coordinated (same version, if paired)
- [ ] Merging with a MERGE COMMIT (not squash)
- [ ] Rollback plan known (revert the merge commit + redeploy)
- [ ] Post-deploy smoke test on production planned
```

## Branch naming

| Prefix     | Use for                                  | Branch from |
|------------|------------------------------------------|-------------|
| `feat/`    | New feature or enhancement               | `dev`       |
| `fix/`     | Bug fix (non-urgent)                     | `dev`       |
| `chore/`   | Tooling, deps, docs, refactors           | `dev`       |
| `hotfix/`  | Urgent production fix                    | `main`      |
| `release/` | Optional staging branch for a big release| `dev`       |

## Local quality gate (before opening a PR)

```bash
npm run build     # production build — also typechecks; this is the CI gate
npm run lint      # eslint
npm run format    # prettier
```
