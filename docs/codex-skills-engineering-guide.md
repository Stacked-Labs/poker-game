# Codex Skills Engineering Guide (Repo-Local)

This repo uses **repo-local Codex skills** under `.codex/skills/`. Skills are lightweight, self-contained “operational playbooks” that help Codex (and future engineers) work faster and more consistently in this codebase.

This guide explains:
- How skills trigger and what to put in them
- The full skill directory structure and when to use each subdirectory
- How to explore a repo to decide what skills to create
- Practical patterns for “router + subskills”, validation, and iteration

## What a “skill” is (in practice)

A skill is **not** general documentation and not a README replacement. It is:
- A **high-signal workflow** for recurring tasks in this repo
- A **map of where to look** (file entry points, conventions, pitfalls)
- A set of **scripts/templates** that reduce repeated work and mistakes

Codex skills are designed for **progressive disclosure**:
1. **Metadata** (always in context): `name` + `description` in `SKILL.md` frontmatter
2. **Body** (loaded when triggered): short workflow and pointers
3. **Resources** (loaded only when needed): scripts/references/assets/examples

## Where skills live in this repo

- Repo-local skills are committed at `.codex/skills/<skill-name>/`.
- A skill must have `SKILL.md` at the skill root.

The repo also includes:
- `docs/codex-skills.md` for how to run Codex using repo-local skills.

## Skill directory structure (all options)

```
.codex/skills/<skill-name>/
├── SKILL.md                 # required (metadata + instructions)
├── references/              # optional (detailed docs, checklists, maps)
├── scripts/                 # optional (automation; should be runnable)
├── assets/                  # optional (templates, scaffolds, example configs)
└── examples/                # optional (small real code snippets/patterns)
```

### `SKILL.md` (required)

`SKILL.md` must start with YAML frontmatter:

```yaml
---
name: your-skill-name
description: What it does + WHEN to use it (trigger keywords and contexts).
---
```

Guidelines:
- **Description is the trigger**: include words/contexts engineers will type (e.g. “Chakra”, “theme”, “SIWE”, “WebSocket”, “CSP”, “Tenor”).
- Keep the body short: workflow + repo entry points + “what to read next”.
- Use imperative form (“Do X”, “Check Y”, “Run Z”).

### `references/` (detailed guidance)

Use `references/` for longer material that shouldn’t always load:
- Architecture maps (“entry points”, “data flow”, “where state lives”)
- Checklists (QA, release, security, a11y/perf)
- “How we do it here” conventions
- API contracts and schemas (if applicable)

Keep each reference file focused (one topic). Add a table of contents for files over ~100 lines.

### `scripts/` (automation)

Use scripts when:
- The same multi-step command sequence is repeated (lint+build, generating assets)
- There’s a fragile workflow (auth debugging, env validation)
- You want deterministic output without burning tokens re-explaining steps

Guidelines:
- Make scripts **idempotent** and safe by default.
- Fail fast with clear error messages.
- Don’t require network unless necessary (and document that it does).
- Never embed secrets or tokens.

### `assets/` (templates and scaffolds)

Use `assets/` for files that should be copied into the codebase:
- Component templates aligned to repo conventions
- Snippets for providers/hooks
- CSS tokens/templates

If a template has parameters, document them in `SKILL.md` (“copy this, then replace X/Y”).

### `examples/` (small working patterns)

Examples are best for showing “the right way” without rewriting from scratch:
- A good Chakra component pattern
- A safe fetch wrapper usage
- A correct thirdweb/SIWE flow snippet

Keep examples small and representative; they should be easy to skim.

## Recommended skill architecture: “router + subskills”

For non-trivial repos, a good pattern is:
- 1 broad **router skill**: routes work to the right subskill with a decision tree
- Several narrow **subskills**: each focused on a single domain

Why:
- Router triggers often but stays tiny (low context tax).
- Subskills are targeted and only load when relevant.

In this repo you can follow the pattern already present under `.codex/skills/`:
- Router: `.codex/skills/poker-game-router/`
- Subskills: `.codex/skills/chakra-design-system/`, `.codex/skills/web3-thirdweb-siwe/`, `.codex/skills/frontend-quality-bar/`

## How to decide what skills to create (repo exploration workflow)

When starting a new repo (or expanding skill coverage), explore systematically:

### 1) Identify major “surfaces”

Look for:
- UI layer: `app/components/`, pages/routes, shared layout
- State layer: `contexts/`, reducers/stores, global providers
- Networking: API routes, fetch helpers, websocket clients
- Integrations: auth, payments, analytics, third-party APIs
- Styling system: theme/tokens, UI library conventions

In this repo:
- Providers: `app/providers.tsx`
- Theme: `app/theme.ts`
- Web3: `app/thirdwebclient.ts`, `app/components/WalletButton.tsx`, `app/hooks/useWalletAuth.ts`
- WebSocket + game state: `app/contexts/WebSocketProvider.tsx`, `app/contexts/AppStoreProvider.tsx`

### 2) Inventory dependencies and “non-obvious” libraries

Start with `package.json` and then scan imports:
- UI framework (Chakra UI)
- Animation (Framer Motion)
- Web3 (thirdweb, ethers, viem)
- Media integrations (Tenor, emoji-mart)
- Security (CSP, Turnstile)

The “non-obvious” libs are prime candidates for skills because they have sharp edges.

### 3) Find repeated workflows and failure modes

Good skills encode:
- Repeated code patterns (button styles, toasts, modal patterns)
- Repeated debugging workflows (auth loops, CSP blocking, websocket reconnect)
- Naming conventions and file entry points

To find repetition:
- Search for repeated components/props/styles (e.g. Chakra `IconButton` usage)
- Search for “TODO”, “FIXME”, “console.log”, “Unauthorized”, “Error”

### 4) Define triggers and boundaries

For each skill, decide:
- **Trigger keywords** (go into `description`)
- **Scope** (what it owns; what it explicitly does not own)
- **Entry points** (files and modules to open first)

Example:
- `web3-thirdweb-siwe` should trigger on “thirdweb”, “wallet”, “ConnectButton”, “SIWE”, “signature”, “auth loop”, “Base”, “USDC”.

## Using MCP + repo rules (Cursor)

This repo includes:
- `.cursor/rules/frontend-guidelines.mdc` (frontend conventions)
- `.cursor/rules/thirdweb.mdc` (thirdweb documentation pointers)
- `.cursor/mcp.json` (MCP servers, e.g. Chakra docs + thirdweb API docs)

Skill best practice:
- In `SKILL.md`, point to these files and tell the agent when to read them.
- Don’t paste large external docs into `references/`; prefer MCP or a link + guidance (“search for X”).

## How to test that a skill is actually being used

Practical approaches:
- **Trigger test**: ask a question with the keywords you put in `description`, and confirm the response follows the workflow and references the listed entry points.
- **Signature test (temporary)**: add a unique string near the top of a skill body (not the YAML) and see if it appears in the agent’s output for a triggering prompt; remove it afterwards.
- **Behavioral test**: create a small “expected behavior” list (files to open, commands to run) and verify the agent does that without prompting.

## Skill quality checklist

Before committing a new skill:
- `SKILL.md` description is trigger-rich and accurate
- Body is short and points to `references/` for depth
- References are organized and searchable (TOC for long files)
- Scripts are safe, runnable, and don’t embed secrets
- Templates/examples match repo style (formatting, patterns, imports)
- The skill saves time on real tasks (not theoretical)

## Common mistakes to avoid

- Writing a long tutorial in `SKILL.md` (context tax)
- Putting “when to use this skill” in the body instead of YAML `description`
- Duplicating the same information across multiple skills (pick one source of truth)
- Adding broad, vague triggers (“use for anything”) to a subskill (use the router for that)
- Committing tokens/secrets to skills or references

