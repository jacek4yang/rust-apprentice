import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync, cpSync, symlinkSync, chmodSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib/state-contracts.mjs";

const temporary = mkdtempSync(join(tmpdir(), "rust-apprentice-install-"));
const names = ["rust-learn-init", "rust-learn-continue", "rust-learn-status"];
const shell = process.platform === "win32" ? (process.env.EVAL_POWERSHELL || "powershell.exe") : "sh";
const extension = process.platform === "win32" ? "ps1" : "sh";
const source = join(temporary, "source checkout");
const target = join(temporary, "skills [literal] \u5b66\u4e60");
const installer = join(source, "scripts", `install.${extension}`);
function run({ uninstall = false, fail = false, destination = target } = {}) {
  const env = { ...process.env };
  let args;
  if (process.platform === "win32") {
    args = ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", fail ? join(ROOT, "tests/helpers/fail-install.ps1") : installer];
    if (fail) args.push("-Installer", installer);
    args.push("-Target", destination);
    if (uninstall) args.push("-Uninstall");
  } else {
    args = [installer, ...(uninstall ? ["--uninstall"] : [])];
    env.CLAUDE_SKILLS_DIR = destination;
    if (fail) { env.PATH = `${join(temporary, "mock-bin")}:${env.PATH}`; env.EVAL_FAIL_FILE = join(temporary, "failure-injected"); }
  }
  const result = spawnSync(shell, args, { encoding: "utf8", env });
  if (result.error) throw result.error;
  return result;
}
function success(options) {
  const result = run(options);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
try {
  mkdirSync(join(source, "scripts"), { recursive: true });
  cpSync(join(ROOT, "scripts", `install.${extension}`), installer);
  cpSync(join(ROOT, "skills"), join(source, "skills"), { recursive: true });
  mkdirSync(join(target, "unrelated"), { recursive: true });
  writeFileSync(join(target, "unrelated/keep.txt"), "preserve");
  writeFileSync(join(temporary, "learning-workspace.txt"), "preserve");
  success();
  for (const name of names) assert.equal(readFileSync(join(target, name, "SKILL.md"), "utf8"), readFileSync(join(source, "skills", name, "SKILL.md"), "utf8"));
  for (const name of names) writeFileSync(join(target, name, "old-version.txt"), `old ${name}`);
  if (process.platform !== "win32") {
    mkdirSync(join(temporary, "mock-bin"));
    cpSync(join(ROOT, "tests/helpers/fail-mv.sh"), join(temporary, "mock-bin/mv"));
    chmodSync(join(temporary, "mock-bin/mv"), 0o755);
  }
  const failed = run({ fail: true });
  assert.notEqual(failed.status, 0, "fault injection must fail");
  assert.match(failed.stderr + failed.stdout, /Injected failure/);
  for (const name of names) assert.equal(readFileSync(join(target, name, "old-version.txt"), "utf8"), `old ${name}`, "rollback must restore ALL old skills");
  success();
  for (const name of names) assert.ok(!existsSync(join(target, name, "old-version.txt")), "update must remove obsolete installed files");
  success();
  // Missing source fails before changing the old installation.
  const missing = join(source, "skills/rust-learn-status/SKILL.md");
  const contents = readFileSync(missing);
  rmSync(missing);
  assert.notEqual(run().status, 0);
  for (const name of names) assert.ok(existsSync(join(target, name, "SKILL.md")));
  writeFileSync(missing, contents);
  assert.notEqual(run({ destination: source }).status, 0, "source overlap must be rejected");
  const linked = join(temporary, "linked-target");
  symlinkSync(target, linked, process.platform === "win32" ? "junction" : "dir");
  assert.notEqual(run({ destination: linked }).status, 0, "linked targets must be rejected");
  success({ uninstall: true });
  success({ uninstall: true });
  for (const name of names) assert.ok(!existsSync(join(target, name)));
  assert.equal(readFileSync(join(target, "unrelated/keep.txt"), "utf8"), "preserve");
  assert.equal(readFileSync(join(temporary, "learning-workspace.txt"), "utf8"), "preserve");
  const backups = readdirSync(temporary).filter(n => n.startsWith(".rust-apprentice-backup-"));
  assert.ok(backups.some(b => names.every(n => existsSync(join(temporary, b, "old", n, "SKILL.md")))), "uninstalled files must be recoverable");
  assert.ok(!readdirSync(target).some(n => n.startsWith(".rust-apprentice-backup-")), "backups must not be rediscovered as installed skills");
  console.log(`Installer lifecycle passed (${shell}): literal Unicode paths, repeat/update, mid-switch rollback, preflight failure, overlap/links, recoverable uninstall and isolation.`);
} finally {
  assert.ok(resolve(temporary).startsWith(resolve(tmpdir(), "rust-apprentice-install-")));
  rmSync(temporary, { recursive: true, force: true });
}
