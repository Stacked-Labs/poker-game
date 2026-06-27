#!/usr/bin/env node
/**
 * Copy guardrail for player-facing surfaces.
 *
 * Blocks the house copy bans from regressing into shipped UI:
 *   - "Banker"            (killed term; use Host / the table contract)
 *   - vendor names        (thirdweb) leaking into rendered copy
 *   - em dash (—) / "--"  in user-visible strings
 *
 * Scope is intentionally incremental: it covers the surfaces that have been
 * cleaned. Add globs here as each section pass finishes its `clarify` step,
 * so the guardrail expands to match what's actually clean. Comments, imports,
 * and asset paths (src/href/*.png…) are exempt — the bans are about *copy*.
 *
 * Run: `npm run lint:copy`  (also wired into the husky pre-commit hook)
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();

// Covered surfaces (expand as section passes clean more).
const FILES = ['app/utils/FAQsData.ts'];
const DIRS = ['app/components/HomePage'];

const BANS = [
    { id: 'banker', re: /\bBanker\b/, msg: 'killed term "Banker" (use Host / the table contract)' },
    { id: 'vendor', re: /thirdweb/i, msg: 'vendor name "thirdweb" in copy (describe the outcome instead)' },
    { id: 'emdash', re: /—/, msg: 'em dash in copy (use comma, colon, period, or parentheses)' },
];

const isCode = (line) =>
    /^\s*(import|export\s+\*)/.test(line) || // imports
    /\/\*|\*\/|^\s*\*|\/\//.test(line) || // block / JSX {/* */} / line comments
    /\b(src|href|srcSet|poster)\s*=/.test(line) || // asset paths
    /\.(png|jpe?g|svg|webp|gif|mp4|webm)\b/i.test(line); // asset filenames

function walk(dir) {
    const out = [];
    for (const name of readdirSync(join(ROOT, dir))) {
        const rel = join(dir, name);
        const st = statSync(join(ROOT, rel));
        if (st.isDirectory()) out.push(...walk(rel));
        else if (['.tsx', '.ts'].includes(extname(name)) && !/\.(stories|test)\./.test(name))
            out.push(rel);
    }
    return out;
}

const targets = [...FILES, ...DIRS.flatMap(walk)];
const violations = [];

for (const file of targets) {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
        if (isCode(line)) return;
        for (const ban of BANS) {
            if (ban.re.test(line)) violations.push({ file, line: i + 1, msg: ban.msg, text: line.trim().slice(0, 100) });
        }
    });
}

if (violations.length) {
    console.error(`\n✖ copy guardrail: ${violations.length} violation(s) in ${targets.length} files\n`);
    for (const v of violations) console.error(`  ${v.file}:${v.line}  ${v.msg}\n     › ${v.text}`);
    console.error('');
    process.exit(1);
}
console.log(`✓ copy guardrail: clean across ${targets.length} player-facing files`);
