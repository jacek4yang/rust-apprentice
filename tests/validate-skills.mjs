#!/usr/bin/env node
/**
 * Validates both SKILL.md files against the Agent Skills specification using the official reference
 * implementation (`skills-ref validate`).
 *
 * Why this is not just `npx skills-ref validate skills/*` in the workflow:
 *
 * These skills set `disable-model-invocation: true` and `user-invocable: true`. Those are Claude Code
 * frontmatter fields, documented for exactly this purpose, and they are what stops Claude opening a learning
 * session just because the user mentioned Rust. They are not part of the portable Agent Skills subset, so the
 * reference validator rejects them — as do claude.ai uploads and `package_skill.py`, which hard-error on any
 * field outside `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
 *
 * Encoding the intent in `metadata` instead was measured, not assumed: with the flags in `metadata`, Claude Code
 * exposes the skill to the model again and the restriction is silently lost. Verified by installing both
 * variants and observing whether the skill appeared in the model's skill listing.
 *
 * So the portable spec is validated against a copy of each SKILL.md with the two Claude Code fields removed,
 * and the presence of those fields in the real files is asserted separately. That keeps both properties honest:
 * the portable subset is spec-clean, and the Claude Code behaviour is present and deliberate.
 *
 * Usage: node tests/validate-skills.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");

// Claude Code extensions used by this repository, and the behaviour each one buys.
const CLAUDE_CODE_FIELDS = [
  {
    key: "disable-model-invocation",
    required: "true",
    why: "Stops Claude starting a learning session unprompted.",
  },
  {
    key: "user-invocable",
    required: "true",
    why: "Keeps both skills visible in the / menu.",
  },
];

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

const scratch = mkdtempSync(join(tmpdir(), "rust-apprentice-validate-"));

try {
  for (const skill of skills) {
    const source = join(SKILLS_DIR, skill, "SKILL.md");
    const text = readFileSync(source, "utf8");

    // Assert the Claude Code behaviour is present in the real file.
    for (const field of CLAUDE_CODE_FIELDS) {
      const pattern = new RegExp(`^${field.key}:\\s*${field.required}\\s*$`, "m");
      if (!pattern.test(text)) {
        failures.push(
          `${skill}/SKILL.md must set \`${field.key}: ${field.required}\`. ${field.why}`
        );
      }
    }

    // Build the spec-portable copy: same content, Claude Code fields removed.
    let portable = text;
    for (const field of CLAUDE_CODE_FIELDS) {
      portable = portable.replace(new RegExp(`^${field.key}:.*\\r?\\n`, "m"), "");
    }

    const staged = join(scratch, skill);
    mkdirSync(staged, { recursive: true });
    writeFileSync(join(staged, "SKILL.md"), portable, "utf8");

    try {
      const output = execFileSync("npx", ["--yes", "skills-ref@0.1.5", "validate", staged], {
        encoding: "utf8",
        shell: process.platform === "win32",
        stdio: ["ignore", "pipe", "pipe"],
      });
      notes.push(output.trim().replace(staged, `skills/${skill}`));
    } catch (error) {
      const detail = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
      failures.push(`${skill}: Agent Skills specification validation failed\n${detail}`);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

for (const note of notes) console.log(`  ok  ${note}`);

if (failures.length) {
  console.error("");
  for (const failure of failures) console.error(`  FAIL  ${failure}`);
  console.error("\nSkill validation failed.");
  process.exit(1);
}

console.log(
  `\nAgent Skills validation passed for ${skills.length} skills, ` +
    `with ${CLAUDE_CODE_FIELDS.length} Claude Code fields asserted separately.`
);
