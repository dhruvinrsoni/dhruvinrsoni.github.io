#!/usr/bin/env node

/**
 * Launchpad Card Manager
 *
 * Add, update, or validate the project cards in scripts/data.js — the single
 * source of truth for the Launchpad grid. A deterministic, non-AI alternative
 * to hand-editing the PROJECTS array.
 *
 * Usage:
 *   node tools/add-card.mjs --id <slug> --name "<Name>" --emoji <e> --type "<Type>" --desc "<text>"
 *   node tools/add-card.mjs                       # interactive prompts
 *   node tools/add-card.mjs --update <slug> [--desc "..."] [--name "..."] ...
 *   node tools/add-card.mjs --validate            # check every card, exit non-zero on error
 *   node tools/add-card.mjs ... --dry-run         # print the rendered block, write nothing
 *
 * Fields (flags):
 *   --id --name --emoji --type --desc --sub --liveLabel --primary
 *   --repo --live --webstore --producthunt --featured
 *
 * Smart defaults when --id is given:
 *   repo  -> https://github.com/dhruvinrsoni/<id>
 *   live  -> https://dhruvinrsoni.github.io/<id>/
 *   primary -> 'live' (or 'repo' if no live URL)
 *
 * Zero external dependencies — Node.js built-ins only.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '..', 'scripts', 'data.js');
const WORKSPACE = resolve(__dirname, '..', '..');

const URL_KEYS = ['repo', 'live', 'webstore', 'producthunt'];
const FIELD_ORDER = ['id', 'name', 'sub', 'emoji', 'type', 'featured', 'desc', 'repo', 'live', 'webstore', 'producthunt', 'liveLabel', 'primary'];
const BOOLEAN_FLAGS = new Set(['validate', 'dryRun', 'featured', 'help']);

// ─── Argument Parsing ───────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (BOOLEAN_FLAGS.has(key)) {
      args[key] = true;
    } else {
      args[key] = argv[++i];
    }
  }
  return args;
}

function printUsage() {
  console.log(`
Launchpad Card Manager — manage cards in scripts/data.js

Usage:
  node tools/add-card.mjs --id <slug> --name "<Name>" --emoji <e> --type "<Type>" --desc "<text>"
  node tools/add-card.mjs                       interactive prompts
  node tools/add-card.mjs --update <slug> [--desc "..."] ...
  node tools/add-card.mjs --validate            check all cards
  node tools/add-card.mjs ... --dry-run         preview, write nothing

Fields:
  --id --name --emoji --type --desc --sub --liveLabel --primary
  --repo --live --webstore --producthunt --featured

Defaults from --id:
  repo  -> https://github.com/dhruvinrsoni/<id>
  live  -> https://dhruvinrsoni.github.io/<id>/
  primary -> live (or repo if no live URL)

Examples:
  node tools/add-card.mjs --id rangoli-royale --name "Rangoli Royale" --emoji 🪔 --type "Game · PWA" --desc "..."
  node tools/add-card.mjs --update smart-logger --desc "New description."
  node tools/add-card.mjs --validate
`);
}

// ─── data.js read / parse ───────────────────────────────────────────

function readData() {
  const text = readFileSync(DATA_FILE, 'utf-8');
  const startToken = 'const PROJECTS = ';
  const start = text.indexOf(startToken);
  if (start === -1) throw new Error('Could not find "const PROJECTS = [" in data.js');
  const literalStart = start + startToken.length; // points at '['
  const end = text.indexOf('\n];', literalStart);
  if (end === -1) throw new Error('Could not find the closing "];" of PROJECTS in data.js');
  const literal = text.slice(literalStart, end) + '\n]';
  let cards;
  try {
    cards = new Function('return ' + literal)();
  } catch (e) {
    throw new Error('Failed to evaluate the PROJECTS array literal: ' + e.message);
  }
  return { text, cards, literalStart, end };
}

// ─── Card rendering (house style) ───────────────────────────────────

function q(value) {
  return "'" + String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function renderCard(card) {
  const line1 = ['id', 'name', 'sub', 'emoji']
    .filter((k) => card[k] != null && card[k] !== '')
    .map((k) => `${k}: ${q(card[k])}`)
    .join(', ');

  const line2parts = [`type: ${q(card.type)}`];
  if (card.featured) line2parts.push('featured: true');

  const lines = [`    ${line1},`, `    ${line2parts.join(', ')},`, `    desc: ${q(card.desc)},`];

  for (const k of URL_KEYS) {
    if (card[k] != null && card[k] !== '') lines.push(`    ${k}: ${q(card[k])},`);
  }
  if (card.liveLabel != null && card.liveLabel !== '') lines.push(`    liveLabel: ${q(card.liveLabel)},`);

  if (Array.isArray(card.extras) && card.extras.length) {
    lines.push('    extras: [');
    card.extras.forEach((x, i) => {
      const tail = i === card.extras.length - 1 ? '' : ',';
      const icon = x.icon ? `, icon: ${q(x.icon)}` : '';
      lines.push(`      { label: ${q(x.label)}, url: ${q(x.url)}${icon} }${tail}`);
    });
    lines.push('    ],');
  }

  lines.push(`    primary: ${q(card.primary)}`);
  return '{\n' + lines.join('\n') + '\n  }';
}

// ─── Validation ─────────────────────────────────────────────────────

function validateCard(card, { existingIds = [], isUpdate = false, checkFolder = false } = {}) {
  const errors = [];
  const warnings = [];

  for (const k of ['id', 'name', 'emoji', 'type', 'desc', 'primary']) {
    if (card[k] == null || card[k] === '') errors.push(`missing required field "${k}"`);
  }
  if (card.id && !/^[a-z][a-z0-9-]*$/.test(card.id)) {
    errors.push(`id "${card.id}" must be kebab-case (lowercase letters, digits, hyphens)`);
  }
  if (!isUpdate && card.id && existingIds.includes(card.id)) {
    errors.push(`id "${card.id}" already exists — use --update to modify it`);
  }

  const urls = URL_KEYS.filter((k) => card[k]);
  if (urls.length === 0) errors.push('at least one URL (repo/live/webstore/producthunt) is required');
  if (card.primary && !card[card.primary]) {
    errors.push(`primary "${card.primary}" does not name a present URL (have: ${urls.join(', ') || 'none'})`);
  }
  for (const k of URL_KEYS) {
    if (card[k] && !/^https?:\/\//.test(card[k])) errors.push(`${k} "${card[k]}" is not a valid http(s) URL`);
  }

  if (card.emoji && Array.from(card.emoji).length > 4) warnings.push(`emoji "${card.emoji}" looks long — expected a single glyph`);
  if (card.desc && card.desc.length > 140) warnings.push(`desc is ${card.desc.length} chars (long for a card)`);

  if (checkFolder && card.live && card.live.includes(`dhruvinrsoni.github.io/${card.id}/`)) {
    if (!existsSync(resolve(WORKSPACE, card.id))) {
      warnings.push(`no sibling folder "${card.id}/" found in the workspace — typo in the id?`);
    }
  }

  return { errors, warnings };
}

function validateAll() {
  const { cards } = readData();
  const seen = new Map();
  let errorCount = 0;
  let warnCount = 0;

  for (const card of cards) {
    const { errors, warnings } = validateCard(card, { isUpdate: true });
    if (card.id) {
      if (seen.has(card.id)) errors.push(`duplicate id "${card.id}"`);
      seen.set(card.id, true);
    }
    if (errors.length || warnings.length) {
      console.log(`\n  ${card.emoji || '·'} ${card.name || card.id || '(unnamed)'}`);
      for (const e of errors) console.log(`    ✗ ${e}`);
      for (const w of warnings) console.log(`    ⚠ ${w}`);
    }
    errorCount += errors.length;
    warnCount += warnings.length;
  }

  console.log(`\nValidated ${cards.length} cards — ${errorCount} error(s), ${warnCount} warning(s).`);
  process.exit(errorCount > 0 ? 1 : 0);
}

// ─── Build a card from flags / existing ─────────────────────────────

function buildCard(args, base = {}) {
  const card = { ...base };
  for (const k of ['id', 'name', 'emoji', 'type', 'desc', 'sub', 'liveLabel', 'primary', ...URL_KEYS]) {
    if (args[k] != null) card[k] = args[k];
  }
  if (args.featured) card.featured = true;

  const isNew = Object.keys(base).length === 0;
  if (card.id && isNew) {
    if (!card.repo) card.repo = `https://github.com/dhruvinrsoni/${card.id}`;
    if (!card.live) card.live = `https://dhruvinrsoni.github.io/${card.id}/`;
  }
  if (!card.primary) card.primary = card.live ? 'live' : 'repo';
  return card;
}

function report({ errors, warnings }) {
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
}

// ─── Interactive prompts ────────────────────────────────────────────

async function promptForCard() {
  const rl = createInterface({ input: stdin, output: stdout });
  const ask = async (label, fallback) => {
    const hint = fallback ? ` [${fallback}]` : '';
    const answer = (await rl.question(`${label}${hint}: `)).trim();
    return answer || fallback || '';
  };

  const id = await ask('id (kebab-case)');
  const args = { id };
  args.name = await ask('name', id);
  args.emoji = await ask('emoji');
  args.type = await ask('type', 'PWA');
  args.desc = await ask('desc (one line)');
  args.sub = await ask('sub (optional, e.g. Devanagari)');
  args.repo = await ask('repo', `https://github.com/dhruvinrsoni/${id}`);
  args.live = await ask('live', `https://dhruvinrsoni.github.io/${id}/`);
  args.primary = await ask('primary (repo/live/webstore/producthunt)', args.live ? 'live' : 'repo');
  const featured = await ask('featured? (y/N)', 'N');
  args.featured = /^y/i.test(featured);
  rl.close();
  return args;
}

// ─── Add / Update ───────────────────────────────────────────────────

function writeCardBlock({ text, literalStart, end }, card, mode, args) {
  const { text: fresh } = readData();
  const rendered = renderCard(card);

  if (args.dryRun) {
    console.log(`\n[dry-run] would ${mode} this card:\n`);
    console.log('  ' + rendered);
    console.log('\nNo files written.');
    return;
  }

  if (mode === 'update') {
    const marker = `id: '${card.id}'`;
    const idx = fresh.indexOf(marker);
    const open = fresh.lastIndexOf('{', idx);
    let depth = 0;
    let close = -1;
    for (let i = open; i < fresh.length; i++) {
      if (fresh[i] === '{') depth++;
      else if (fresh[i] === '}') {
        depth--;
        if (depth === 0) { close = i; break; }
      }
    }
    if (close === -1) throw new Error(`Could not locate the object bounds for id "${card.id}"`);
    const out = fresh.slice(0, open) + rendered + fresh.slice(close + 1);
    writeFileSync(DATA_FILE, out);
    console.log(`✓ Updated card "${card.id}" in scripts/data.js`);
  } else {
    const insertAt = fresh.indexOf('\n];', literalStart);
    const head = fresh.slice(0, insertAt); // ends with the last card's "  }"
    const tail = fresh.slice(insertAt);
    const out = head + ',\n  ' + rendered + tail;
    writeFileSync(DATA_FILE, out);
    console.log(`✓ Added card "${card.id}" to scripts/data.js`);
  }
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) { printUsage(); return; }
  if (args.validate) { validateAll(); return; }

  const data = readData();
  const existingIds = data.cards.map((c) => c.id);

  if (args.update) {
    const base = data.cards.find((c) => c.id === args.update);
    if (!base) {
      console.error(`✗ No card with id "${args.update}" — cannot update.`);
      process.exit(1);
    }
    const card = buildCard({ ...args, id: args.update }, base);
    report(validateCard(card, { existingIds, isUpdate: true }));
    writeCardBlock(data, card, 'update', args);
    return;
  }

  let flags = args;
  if (!args.id) flags = await promptForCard();

  const card = buildCard(flags);
  report(validateCard(card, { existingIds, isUpdate: false, checkFolder: true }));
  writeCardBlock(data, card, 'add', args);
}

main().catch((e) => {
  console.error('Error: ' + e.message);
  process.exit(1);
});
