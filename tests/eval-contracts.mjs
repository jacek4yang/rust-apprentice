import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdtempSync, rmSync, existsSync, symlinkSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, parseYaml, validateModel, classifyMarker, containedPath } from "./lib/state-contracts.mjs";
import { fixtureFiles, buildFixture } from "../evals/fixtures/build.mjs";
import { catalog } from "../evals/fixtures/catalog.mjs";

export function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, "missing frontmatter");
  return parseYaml(match[1]);
}
const actual = readdirSync(join(ROOT, "evals"), { withFileTypes: true })
  .filter(e => e.isDirectory() && existsSync(join(ROOT, "evals", e.name, "prompt.md"))).map(e => e.name).sort();
assert.deepEqual(actual, Object.keys(catalog).sort(), "catalog and case directories drifted");
const temporary = mkdtempSync(join(tmpdir(), "rust-apprentice-contracts-"));
try {
  for (const spec of Object.values(catalog)) {
    const dir = join(ROOT, "evals", spec.name);
    const prompt = frontmatter(readFileSync(join(dir, "prompt.md"), "utf8"));
    const config = parseYaml(readFileSync(join(dir, "case.yaml"), "utf8"));
    assert.equal(config.name, spec.name);
    assert.equal(config.context.scaffold_script, "scaffold.sh");
    assert.ok(prompt.allowed_tools.includes("Skill"), `${spec.name}: Skill tool missing`);
    assert.ok(prompt.append_system_prompt.includes(".eval/registry/workspaces.yaml"), "registry must be isolated");
    assert.equal(prompt.allowed_tools.includes("Write"), spec.mode === "write", spec.name);
    assert.equal(prompt.allowed_tools.includes("Edit"), spec.mode === "write", spec.name);
    assert.ok(!prompt.allowed_tools.includes("Bash"), "these cases do not require shell access");
    const loaded = frontmatter(readFileSync(join(dir, "graders/skill-loaded.md"), "utf8"));
    assert.equal(loaded.tool, "Skill");
    assert.equal(loaded.input_match, `rust-learn-${spec.skill}`);
    // A leading slash command is expanded by the client (command-message injection) and
    // never produces a Skill tool call, so the skill-loaded grader could not observe it.
    // Natural-language requests are a supported invocation path and do produce one.
    const body = readFileSync(join(dir, "prompt.md"), "utf8").slice(prompt.index).replace(/\r/g, "");
    assert.doesNotMatch(body, /^\s*\/rust-learn/, `${spec.name}: eval prompts invoke via natural language, not slash commands`);
    assert.match(body, /\S/, `${spec.name}: prompt body must be non-empty`);
    const files = fixtureFiles(spec.name);
    if (spec.skill !== "init" && spec.mode !== "none") {
      validateModel(parseYaml(files["state/learner-model.md"]));
      assert.equal(classifyMarker(parseYaml(files["rust-apprentice.yaml"]), temporary), "current");
      assert.ok(files["state/progress.md"].includes(spec.next));
      assert.ok(files["state/progress.md"].includes(`domain: ${spec.domain}`));
      const hot = ["rust-apprentice.yaml", "state/learner-model.md", "state/progress.md", "state/review-queue.md", "state/log.md", "learner/profile.md", "state/sessions/2026-09-16-a.md"];
      assert.ok(hot.reduce((sum, path) => sum + files[path].split("\n").length, 0) <= 400);
    } else assert.ok(!files["rust-apprentice.yaml"]);
    for (const graderName of readdirSync(join(dir, "graders"))) {
      const grader = frontmatter(readFileSync(join(dir, "graders", graderName), "utf8"));
      assert.equal(grader.criteria, undefined, "Markdown grader body owns the rubric; frontmatter criteria would shadow it");
      assert.notEqual(grader.focus, "files", "use trace or file contents, not new file names");
      if (grader.focus?.source === "file") assert.equal(spec.mode, "write", "file mutation grading needs write access");
    }
  }
  const large = fixtureFiles("context-year-of-history");
  assert.equal(Object.keys(large).filter(p => p.startsWith("state/sessions/")).length, 366);
  assert.equal(Object.keys(large).filter(p => p.startsWith("notes/")).length, 365);
  assert.ok(large["archive/evidence-2025.md"].split("\n").length > 1000);
  const ws = join(temporary, "workspace");
  buildFixture("context-year-of-history", ws);
  assert.equal(classifyMarker(parseYaml(readFileSync(join(ws, "rust-apprentice.yaml"), "utf8")), ws, { checkFiles: true }), "current");
  assert.throws(() => buildFixture("context-year-of-history", ws), /empty/);
  assert.throws(() => buildFixture("total-beginner", ROOT), /outside/);
  const outside = join(temporary, "outside");
  mkdirSync(outside);
  symlinkSync(outside, join(ws, "escaped"), process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => containedPath(ws, "escaped/not-created.md"), /escapes/);

  // Exercise the actual Bash-to-Node adapter separately from the model harness.
  let bash = process.env.EVAL_BASH || "bash";
  if (process.platform === "win32" && !process.env.EVAL_BASH) {
    const git = spawnSync("git", ["--exec-path"], { encoding: "utf8" });
    let parent = git.stdout?.trim();
    bash = undefined;
    while (parent) {
      bash = [join(parent, "bin/bash.exe"), join(parent, "usr/bin/bash.exe")].find(existsSync);
      if (bash || dirname(parent) === parent) break;
      parent = dirname(parent);
    }
    assert.ok(bash, "Git Bash or EVAL_BASH is required for scaffold contract checks");
  }
  const shellWorkspace = join(temporary, "shell-workspace");
  mkdirSync(shellWorkspace);
  const scaffold = spawnSync(bash, [join(ROOT, "evals/context-many-notes/scaffold.sh").replaceAll("\\", "/")], { cwd: shellWorkspace, encoding: "utf8" });
  assert.equal(scaffold.status, 0, `${scaffold.stdout}\n${scaffold.stderr}`);
  assert.equal(classifyMarker(parseYaml(readFileSync(join(shellWorkspace, "rust-apprentice.yaml"), "utf8")), shellWorkspace, { checkFiles: true }), "current");

  // Compile the actual snippets, not a handwritten approximation of them.
  for (const [name, shouldCompile] of [["ownership-struggle", true], ["ownership-observed-failure", false]]) {
    const prompt = readFileSync(join(ROOT, "evals", name, "prompt.md"), "utf8");
    const source = prompt.match(/```rust\r?\n([\s\S]*?)```/)[1];
    const result = spawnSync("rustc", ["--edition=2021", "--crate-type=lib", "--crate-name", "fixture", "--emit=metadata", "-o", join(temporary, `${name}.rmeta`), "-"], { input: source, encoding: "utf8" });
    if (result.error) throw new Error(`rustc is required for eval contract checks: ${result.error.message}`);
    assert.equal(result.status === 0, shouldCompile, result.stderr);
    if (!shouldCompile) assert.match(result.stderr, /E0502/);
  }
  console.log(`Eval contracts passed: ${actual.length} cases, isolated fixtures, history scale, path containment and Rust diagnostics.`);
} finally {
  // Only the exact directory created above, never a caller-supplied workspace.
  assert.ok(temporary.startsWith(join(tmpdir(), "rust-apprentice-contracts-")));
  rmSync(temporary, { recursive: true, force: true });
}
