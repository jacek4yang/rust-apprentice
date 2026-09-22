#!/usr/bin/env node
// One case per child: write grants never leak into a read-only case.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "../evals/fixtures/catalog.mjs";
import { auditReport } from "../tests/lib/eval-audit.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
// Claude Code 2.1.270 on native Windows hands harness paths to Bash with the
// backslashes stripped (exit 127, zero model turns). Forward slashes survive.
const posixRoot = root.replaceAll("\\", "/");
const args = process.argv.slice(2);
const options = { runs: "1", case: "total-beginner" };
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--list") { console.log(Object.values(catalog).map(c => `${c.name}\t${c.skill}\t${c.mode}\t${c.next}`).join("\n")); process.exit(0); }
  if (!["--case", "--runs", "--model", "--judge-model"].includes(args[i]) || !args[i + 1]) throw new Error(`Unsupported argument: ${args[i]}`);
  options[args[i].slice(2)] = args[++i];
}
if (!/^[1-9]\d*$/.test(options.runs)) throw new Error("runs must be a positive integer");
const selected = options.case === "all" ? Object.values(catalog) : [catalog[options.case]];
if (selected.some(c => !c)) throw new Error(`Unknown case: ${options.case}`);
const checked = spawnSync(process.execPath, ["tests/eval-contracts.mjs"], { cwd: root, stdio: "inherit" });
if (checked.status !== 0) process.exit(2);
const cli = process.platform === "win32" ? "claude.exe" : "claude";
const version = spawnSync(cli, ["--version"], { encoding: "utf8" });
if (version.status !== 0) throw new Error("Infrastructure failure: Claude CLI is unavailable");
const stamp = new Date().toISOString().replaceAll(":", "-");
const output = resolve(root, "evals/results", stamp);
mkdirSync(output, { recursive: true });
const metadata = { created: new Date().toISOString(), cli: version.stdout.trim(), node: process.version,
  platform: process.platform, commit: spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout?.trim(),
  dirty: Boolean(spawnSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).stdout?.trim()),
  options, cases: [] };
let failed = false;
for (const spec of selected) {
  const command = ["plugin", "eval", posixRoot, "--case", spec.name, "--runs", options.runs, "--ablation", "none",
    "--trust-plugin", spec.mode === "none" || spec.skill === "init" ? "--no-scaffold" : "--scaffold", "--no-publish", "--keep-temp", "--threshold", "0.8", "--output-dir", join(output, spec.name).replaceAll("\\", "/")];
  if (options.model) command.push("--model", options.model);
  if (options["judge-model"]) command.push("--judge-model", options["judge-model"]);
  if (spec.mode === "write") command.push("--allow-tools", "Write", "Edit");
  const result = spawnSync(cli, command, { cwd: root, encoding: "utf8", timeout: 900000, maxBuffer: 16 * 1024 * 1024 });
  const log = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  writeFileSync(join(output, `${spec.name}.log`), log);
  process.stdout.write(log);
  let audit = { status: "infrastructure-failure", runs: [] };
  const reportPath = join(output, spec.name, "aggregate-result.json");
  try {
    if (!result.error && existsSync(reportPath)) audit = auditReport(JSON.parse(readFileSync(reportPath, "utf8")), spec, Number(options.runs));
  } catch (error) { audit.error = error.message; }
  metadata.cases.push({ name: spec.name, command, exitCode: result.status, error: result.error?.message, ...audit });
  writeFileSync(join(output, "run-metadata.json"), JSON.stringify(metadata, null, 2));
  if (result.status !== 0 || audit.status !== "passed") { failed = true; break; }
}
console.log(`Local report: ${output}. Inspect per-grader and run errors; an average score is not a safety gate.`);
process.exit(failed ? 1 : 0);
