#!/usr/bin/env node
/**
 * Verify the Pi adapter against a real Pi installation.
 *
 * Dev-only, and deliberately not part of `npm test`: Pi is not a repository dependency, so CI machines do not
 * have it. When Pi is missing this exits 0 with SKIP rather than failing.
 *
 * It registers this repository as a local Pi package in an isolated `PI_CODING_AGENT_DIR` and then asks Pi's
 * own resource loader to discover skills and prompt templates. That is the layout contract the adapters rely
 * on: `skills/` for the Agent Skills standard and `prompts/` for the thin command aliases.
 *
 * The `pi install <path>` command itself is exercised manually and recorded in docs/validation-status.md; it is
 * not spawned here because Windows cannot launch the `pi.cmd` shim without a shell, and this repository avoids
 * shell string concatenation.
 *
 * Usage: npm run verify:pi
 * Exit:  0 when Pi is absent (SKIP) or discovery matches; 1 when Pi is present and discovery does not.
 */

import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED = ["rust-learn-init", "rust-learn-continue", "rust-learn-status"].sort();

/** Locate Pi's public entry point, or null when Pi is not installed in this environment. */
function locatePiEntry() {
  const pkg = join("@earendil-works", "pi-coding-agent", "dist", "index.js");
  const roots = [];
  if (process.env.PI_PACKAGE_DIR) roots.push(process.env.PI_PACKAGE_DIR);
  if (process.env.NODE_PATH) roots.push(...process.env.NODE_PATH.split(delimiter));
  try {
    // Fixed command, no interpolation. `npm root -g` cannot be spawned without a shell on Windows.
    const npmRoot = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (npmRoot) roots.push(npmRoot);
  } catch {
    // npm absent; the built-in guesses below may still find a global install.
  }
  roots.push(
    join(dirname(process.execPath), "node_modules"),
    join(dirname(process.execPath), "..", "lib", "node_modules"),
    "/usr/local/lib/node_modules",
    "/usr/lib/node_modules",
  );
  return roots.map((root) => join(root, pkg)).find((entry) => existsSync(entry)) ?? null;
}

const entry = locatePiEntry();
if (!entry) {
  console.log("SKIP: Pi is not installed here. This check needs a real `pi` installation; nothing was verified.");
  process.exit(0);
}

const { DefaultResourceLoader } = await import(pathToFileURL(entry).href);

// The exact settings shape `pi install <path>` writes, isolated from the developer's real config.
const agentDir = mkdtempSync(join(tmpdir(), "rust-apprentice-pi-"));
writeFileSync(join(agentDir, "settings.json"), `${JSON.stringify({ packages: [ROOT] }, null, 2)}\n`);

const problems = [];
try {
  const loader = new DefaultResourceLoader({ cwd: ROOT, agentDir });
  await loader.reload();
  const { skills, diagnostics: skillDiagnostics } = loader.getSkills();
  const { prompts, diagnostics: promptDiagnostics } = loader.getPrompts();

  const summary = {
    pi: entry,
    agentDir,
    skills: skills.map((s) => s.name).sort(),
    prompts: prompts.map((p) => ({ name: p.name, argumentHint: p.argumentHint ?? null })).sort((a, b) => a.name.localeCompare(b.name)),
  };
  console.log(JSON.stringify(summary, null, 2));

  const skillNames = skills.map((s) => s.name).sort();
  if (JSON.stringify(skillNames) !== JSON.stringify(EXPECTED)) problems.push(`skills discovered: [${skillNames}]`);
  const promptNames = prompts.map((p) => p.name).sort();
  if (JSON.stringify(promptNames) !== JSON.stringify(EXPECTED)) problems.push(`prompt templates discovered: [${promptNames}]`);
  for (const diagnostic of [...skillDiagnostics, ...promptDiagnostics]) {
    problems.push(`diagnostic: ${diagnostic.type ?? "?"}: ${diagnostic.message ?? JSON.stringify(diagnostic)}`);
  }

  if (problems.length) {
    console.error(`\nPi adapter verification FAILED (${problems.length} problem(s)):`);
    for (const problem of problems) console.error(`  - ${problem}`);
  } else {
    console.log(`\nPi adapter OK: 3 skills and 3 prompt templates discovered, no diagnostics (${entry}).`);
  }
} finally {
  rmSync(agentDir, { recursive: true, force: true });
}

process.exit(problems.length ? 1 : 0);
