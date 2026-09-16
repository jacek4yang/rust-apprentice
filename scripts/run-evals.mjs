#!/usr/bin/env node
/**
 * Runs the behavioural eval suite, working around the harness constraint described in evals/README.md.
 *
 * `claude plugin eval` runs the plugin's skills as a *model-invoked* capability, so a skill that sets
 * `disable-model-invocation: true` is invisible to the agent under test and every case scores against bare
 * Claude Code. Production keeps that setting — it is what stops a learning session starting just because the
 * user mentioned Rust — so this script flips it only for the duration of a run, then restores the files.
 *
 * The temporary flip is also a useful check: several cases assert that the mentor hands the work back to the
 * learner, which is exactly the behaviour a model-invoked skill tends to abandon.
 *
 * Usage:
 *   node scripts/run-evals.mjs                      # whole suite, two-arm, default runs per case
 *   node scripts/run-evals.mjs --case total-beginner --runs 1 --ablation none
 *   node scripts/run-evals.mjs --reasoning           # print why, then exit
 *
 * Any additional arguments are passed through to `claude plugin eval .`.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const BEFORE = "disable-model-invocation: true";
const AFTER = "disable-model-invocation: false";

const args = process.argv.slice(2);

if (args.includes("--reasoning")) {
  console.log(`Eval harness shim.

Production skills set "${BEFORE}" so Claude never starts a learning session unprompted.
The eval harness loads plugin skills only as model-invoked capabilities, so it cannot observe a
skill that is user-invoked only: the run silently measures baseline Claude Code.

This script flips the flag to "${AFTER}" for the duration of the run, restoring the files
afterwards in a finally block, and refuses to run if a file was already modified.`);
  process.exit(0);
}

const skillFiles = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(SKILLS_DIR, entry.name, "SKILL.md"));

const originals = new Map();

for (const file of skillFiles) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(BEFORE)) {
    console.error(`${file} does not contain "${BEFORE}" — refusing to modify an unexpected state.`);
    process.exit(1);
  }
  originals.set(file, text);
}

function patch(from, to) {
  for (const [file, text] of originals) {
    writeFileSync(file, text.replace(from, to), "utf8");
  }
}

let status = 0;
try {
  patch(BEFORE, AFTER);
  console.log("Prepared skills for the eval harness (model invocation temporarily enabled).\n");

  execFileSync(
    "claude",
    ["plugin", "eval", ".", "--trust-plugin", ...args],
    { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" }
  );
} catch (error) {
  status = typeof error.status === "number" ? error.status : 1;
} finally {
  patch(AFTER, BEFORE);
  console.log("\nRestored disable-model-invocation: true in both skills.");
}

process.exit(status);
