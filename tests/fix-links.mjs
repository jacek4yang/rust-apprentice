#!/usr/bin/env node
/**
 * Repairs relative markdown links inside skills/ that point at files moved during a reorganization.
 *
 * Only rewrites a link when exactly one file in the repository matches its basename, so an ambiguous name is
 * reported rather than guessed at. Links to files that do not exist anywhere are reported and left alone.
 *
 * Usage:
 *   node tests/fix-links.mjs          # report only
 *   node tests/fix-links.mjs --write  # rewrite the unambiguous ones
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");

function walk(dir, predicate = () => true) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).split("\\").join("/");

// Index every markdown file by basename, so a moved target can be found.
const byBasename = new Map();
for (const file of walk(join(ROOT, "skills"), (f) => f.endsWith(".md"))) {
  const name = basename(file);
  if (!byBasename.has(name)) byBasename.set(name, []);
  byBasename.get(name).push(file);
}

const rewrites = [];
const ambiguous = [];
const missing = [];

for (const file of walk(join(ROOT, "skills"), (f) => f.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  let updated = text;
  let changed = false;

  for (const match of text.matchAll(/\]\((?!https?:|#|mailto:)([^)]+)\)/g)) {
    const raw = match[1];
    const [target, fragment] = raw.split("#");
    const trimmed = (target ?? "").trim();
    if (!trimmed || trimmed.includes("<")) continue; // template placeholder

    const resolved = resolve(dirname(file), trimmed);
    if (existsSync(resolved)) continue;

    const candidates = byBasename.get(basename(trimmed)) ?? [];
    if (candidates.length === 1) {
      const replacement = relative(dirname(file), candidates[0]).split("\\").join("/");
      const next = `](${replacement}${fragment ? `#${fragment}` : ""})`;
      rewrites.push(`${rel(file)}: ${raw} -> ${replacement}`);
      updated = updated.replaceAll(`](${raw})`, next);
      changed = true;
    } else if (candidates.length > 1) {
      ambiguous.push(`${rel(file)}: ${raw} matches ${candidates.length} files`);
    } else {
      missing.push(`${rel(file)}: ${raw}`);
    }
  }

  if (changed && WRITE) writeFileSync(file, updated, "utf8");
}

for (const line of rewrites) console.log(`  fix   ${line}`);
for (const line of ambiguous) console.log(`  AMBIG ${line}`);
for (const line of missing) console.log(`  DEAD  ${line}`);

console.log(
  `\n${rewrites.length} repairable, ${ambiguous.length} ambiguous, ${missing.length} with no target.` +
    (WRITE ? " Repairs written." : " Run with --write to apply repairs.")
);
