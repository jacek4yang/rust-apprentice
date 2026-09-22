#!/usr/bin/env node
/**
 * Validate all three SKILL.md files using the pinned reference CLI.
 * This repository uses portable frontmatter. Client-specific invocation behaviour
 * is a separate compatibility concern, not proven by this syntax check.
 */

import { packageCli } from "./lib/package-cli.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");

// Fields outside the portable spec. Present only to produce a clear message if one is reintroduced.
const NON_PORTABLE_FIELDS = ["disable-model-invocation", "user-invocable", "argument-hint"];

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

    // Enforce the portable distribution policy independently of client behaviour.
    for (const field of NON_PORTABLE_FIELDS) {
      if (new RegExp(`^${field}:`, "m").test(text)) {
        failures.push(
          `${skill}/SKILL.md uses \`${field}\`, which is outside this repository's portable frontmatter policy. ` +
            "Review client-specific configuration separately from portable validation."
        );
      }
    }

    try {
      const output = packageCli("skills-ref", ["validate", skillDir], {
        encoding: "utf8",
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
