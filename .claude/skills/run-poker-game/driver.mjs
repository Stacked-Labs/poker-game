#!/usr/bin/env node
// Storybook driver for poker-game — screenshots/inspects the game's mechanics
// & UX-flow components in a headless browser. There is no chromium-cli on this
// box, so we drive Playwright's bundled chromium (Playwright is already a
// devDependency — `@playwright/test`).
//
// Run from the poker-game/ repo root with Storybook already up on :6006
// (node_modules/.bin/storybook dev -p 6006 --no-open --ci).
//
//   node .claude/skills/run-poker-game/driver.mjs list [filter]
//   node .claude/skills/run-poker-game/driver.mjs shot <storyId> [--theme=dark] [--out=foo.png]
//   node .claude/skills/run-poker-game/driver.mjs mechanics [--theme=dark|light|both]
//
// Stories render at  ${SB}/iframe.html?id=<id>&viewMode=story&globals=theme:<t>
// Theme global maps to Chakra color mode via .storybook/preview.tsx
// (withThemeByClassName -> "chakra-ui-dark" class -> ColorModeSync).

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SB = process.env.SB_URL || 'http://localhost:6006';
const OUT_DIR = process.env.OUT_DIR || '/tmp/poker-game-sb';

// The "mechanics & UX flow" surface, by case-insensitive title substring.
// Resolved against the live index at run time so it survives story-id churn.
const MECHANICS = [
    ['community-cards', 'Felt/CommunityCards'],
    ['pot', 'RunItTwice/Pot'],
    ['dual-board', 'DualBoardCommunityCards'],
    ['run-it-twice', 'RunItTwicePrompt'],
    ['ante-chip', 'AnteChip'],
    ['card-back', 'Components / CardBack'],
    ['card-index', 'Reference / Card Index'],
    ['raise-input', 'Footer/RaiseInputBox'],
    ['seat-request', 'Footer/SeatRequestStatusBadge'],
    ['away-rejoin', 'Footer/AwayRejoinFooter'],
    ['seat-status', 'SeatStatusChip'],
    ['take-seat', 'TakeSeatModal'],
    ['taken-seat', 'TakenSeatButton'],
    ['game-status', 'GameStatusBanner'],
    ['session-points', 'SessionPointsBadge'],
];

const args = process.argv.slice(2);
const cmd = args[0];
const flags = Object.fromEntries(
    args.filter((a) => a.startsWith('--')).map((a) => {
        const [k, v] = a.replace(/^--/, '').split('=');
        return [k, v ?? true];
    }),
);
const positional = args.slice(1).filter((a) => !a.startsWith('--'));

async function fetchIndex() {
    const res = await fetch(`${SB}/index.json`);
    if (!res.ok) throw new Error(`index.json ${res.status} — is Storybook up on ${SB}?`);
    const json = await res.json();
    return Object.values(json.entries || json.stories || {});
}

function storyUrl(id, theme) {
    const g = theme ? `&globals=theme:${theme}` : '';
    return `${SB}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story${g}`;
}

async function shoot(page, id, theme, outPath) {
    await page.goto(storyUrl(id, theme), { waitUntil: 'load', timeout: 30_000 });
    // Storybook mounts into #storybook-root; wait for it to have real content.
    await page.waitForSelector('#storybook-root, #root', { timeout: 20_000 });
    await page.waitForFunction(() => {
        const r = document.querySelector('#storybook-root') || document.querySelector('#root');
        return r && r.children.length > 0 && r.innerText.trim().length + r.querySelectorAll('svg,img,canvas').length > 0;
    }, { timeout: 20_000 }).catch(() => {});
    // Surface Storybook's own error overlay instead of screenshotting a blank.
    const err = await page.$('.sb-errordisplay, #error-message, .sb-nopreview');
    if (err && await err.isVisible()) {
        const txt = (await err.innerText().catch(() => '')).slice(0, 200);
        console.error(`  ⚠ ${id} [${theme}] rendered an error overlay: ${txt}`);
    }
    await page.waitForTimeout(350); // let fonts/animations settle
    await page.screenshot({ path: outPath });
}

async function withBrowser(fn) {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1000, height: 760 }, deviceScaleFactor: 2 });
    try {
        return await fn(page);
    } finally {
        await browser.close();
    }
}

async function main() {
    if (cmd === 'list') {
        const filter = (positional[0] || '').toLowerCase();
        const entries = (await fetchIndex())
            .filter((e) => e.type !== 'docs')
            .filter((e) => !filter || (e.id + ' ' + (e.title || '')).toLowerCase().includes(filter));
        for (const e of entries) console.log(`${e.id}  ::  ${e.title} / ${e.name}`);
        console.log(`\n${entries.length} stories${filter ? ` matching "${filter}"` : ''}`);
        return;
    }

    if (cmd === 'shot') {
        const id = positional[0];
        if (!id) throw new Error('usage: shot <storyId> [--theme=dark] [--out=foo.png]');
        const theme = flags.theme || 'light';
        await mkdir(OUT_DIR, { recursive: true });
        const out = flags.out || join(OUT_DIR, `${id}.${theme}.png`);
        await withBrowser((page) => shoot(page, id, theme, out));
        console.log(`wrote ${out}`);
        return;
    }

    if (cmd === 'mechanics') {
        const want = flags.theme === 'both' ? ['light', 'dark'] : [flags.theme || 'light'];
        await mkdir(OUT_DIR, { recursive: true });
        const entries = await fetchIndex();
        const picks = [];
        for (const [label, needle] of MECHANICS) {
            const hit = entries.find(
                (e) => e.type !== 'docs' && (e.title || '').toLowerCase().includes(needle.toLowerCase()),
            );
            if (hit) picks.push({ label, id: hit.id, title: hit.title });
            else console.error(`  (no story found for "${needle}")`);
        }
        const written = [];
        await withBrowser(async (page) => {
            for (const theme of want) {
                for (const p of picks) {
                    const out = join(OUT_DIR, `${p.label}.${theme}.png`);
                    process.stdout.write(`  ${theme}  ${p.label} (${p.id}) ... `);
                    await shoot(page, p.id, theme, out);
                    console.log('ok');
                    written.push({ ...p, theme, file: out });
                }
            }
        });
        await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify(written, null, 2));
        console.log(`\nwrote ${written.length} screenshots to ${OUT_DIR}/`);
        console.log(`manifest: ${join(OUT_DIR, 'index.json')}`);
        return;
    }

    console.log(`poker-game Storybook driver
  list [filter]                     list story ids (optionally filtered by substring)
  shot <storyId> [--theme=dark]     screenshot one story  [--out=path]
  mechanics [--theme=both]          screenshot the mechanics/UX-flow gallery

  SB_URL  (default ${SB})
  OUT_DIR (default ${OUT_DIR})`);
}

main().catch((e) => {
    console.error(e.message || e);
    process.exit(1);
});
