#!/usr/bin/env node
/**
 * Asserts that the pinned Skills CLI discovers exactly the three expected skills.
 *
 * Runs `skills add . --list`, which resolves this repository the same way
 * `skills add <owner>/<repo>` will, so a layout change that breaks installation fails here rather than for a
 * user. The CLI's human output is parsed; `--json` cannot be combined with `--list`.
 *
 * Usage: node tests/assert-discovery.mjs
 */

import { packageCli } from "./lib/package-cli.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED = ["rust-learn-continue", "rust-learn-init", "rust-learn-status"];

let output;
try {
  output = packageCli("skills", ["add", ".", "--list"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (error) {
  console.error("Failed to run the skills CLI.");
  console.error(error.stdout ?? "");
  console.error(error.stderr ?? "");
  process.exit(1);
}

// Strip ANSI colour codes before parsing.
const plain = output.replace(/\[[0-9;]*m/g, "");

const countMatch = plain.match(/Found\s+(\d+)\s+skills?/i);
if (!countMatch) {
  console.error("Could not find the skill count in the CLI output:");
  console.error(plain);
  process.exit(1);
}

const declaredCount = Number(countMatch[1]);

// Skill names appear as the first non-empty line following "Available Skills" or after a separator.
const listed = [...plain.matchAll(/^\s*[│|]?\s{3,}([a-z0-9][a-z0-9-]{1,63})\s*$/gm)]
  .map((m) => m[1])
  .filter((name) => !["Source", "Available", "Use", "Local", "Found"].includes(name))
  .filter((name, index, all) => all.indexOf(name) === index)
  .sort();

if (declaredCount !== EXPECTED.length) {
  console.error(`CLI declared ${declaredCount} skills; expected ${EXPECTED.length}.`);
  console.error(plain);
  process.exit(1);
}

if (listed.join(",") !== EXPECTED.join(",")) {
  console.error(`Expected exactly [${EXPECTED.join(", ")}] but the CLI found [${listed.join(", ")}]`);
  console.error(plain);
  process.exit(1);
}

console.log(`Skills CLI discovery OK: found ${declaredCount} skills -> ${listed.join(", ")}`);
