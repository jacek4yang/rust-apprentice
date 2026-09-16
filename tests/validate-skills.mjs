#!/usr/bin/env node
/**
 * Validates both SKILL.md files against the Agent Skills specification using the official reference
 * implementation (`skills-ref validate`).
 *
 * The skills deliberately carry no Claude Code-only frontmatter. `disable-model-invocation: true` was tried and
 * removed: measured on Claude Code, a personal skill with that flag set is not registered at all — the /name
 * command does not resolve and the skill is absent from the model's listing, so the flag produced an uninstalled
 * skill rather than a user-invoked one. Setting it to false registers the skill normally, and a description that
 * scopes itself to explicit requests was verified not to start a session on a passing mention of Rust.
 *
 * The consequence is that these files sit entirely inside the portable Agent Skills subset, so they validate
 * directly, need no field stripping, and remain usable by any Agent Skills-compatible client.
 *
 * Usage: node tests/validate-skills.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");

// Fields outside the portable spec. Present only to produce a clear message if one is reintroduced.
const NON_PORTABLE_FIELDS = ["disable-model-invocation", "user-invocable", "allowed-tools".replace("allowed-tools", "argument-hint")];

const failures = [];
const notes = [];

const skills = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (skills.length === 0) {
  console.error("No skills found under skills/.");
  process.exit(1);
}

try {
  for (const skill of skills) {
    const skillDir = join(SKILLS_DIR, skill);
    const text = readFileSync(join(skillDir, "SKILL.md"), "utf8");

    // Guard: no Claude Code-only field may reappear, since it would either break portable validation or, in the
    // case of disable-model-invocation, silently unregister the skill.
    for (const field of NON_PORTABLE_FIELDS) {
      if (new RegExp(`^${field}:`, "m").test(text)) {
        failures.push(
          `${skill}/SKILL.md uses \`${field}\`, which is outside the portable Agent Skills subset. ` +
            (field === "disable-model-invocation"
              ? "This flag also stops Claude Code registering the skill. Scope invocation in the description instead."
              : "Move it into `metadata`, or remove it.")
        );
      }
    }

    try {
      const output = execFileSync("npx", ["--yes", "skills-ref@0.1.5", "validate", skillDir], {
        encoding: "utf8",
        shell: process.platform === "win32",
        stdio: ["ignore", "pipe", "pipe"],
      });
      notes.push(output.trim());
    } catch (error) {
      const detail = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
      failures.push(`${skill}: Agent Skills specification validation failed\n${detail}`);
    }
  }
} catch (unexpected) {
  failures.push(String(unexpected && unexpected.message ? unexpected.message : unexpected));
}

for (const note of notes) console.log(`  ok  ${note}`);

if (failures.length) {
  console.error("");
  for (const failure of failures) console.error(`  FAIL  ${failure}`);
  console.error("\nSkill validation failed.");
  process.exit(1);
}

console.log(
  `\nAgent Skills validation passed for ${skills.length} skills, all within the portable subset.`
);
