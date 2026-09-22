#!/usr/bin/env node
/**
 * Static repository checks for rust-apprentice.
 *
 * Validates the things CI must never let regress: exactly three skills, valid frontmatter, resolvable local
 * references, English-only source, and the absence of hardcoded workspace paths.
 *
 * Usage: node tests/repo-checks.mjs
 * Exit:  0 on success, 1 on any failure.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED_SKILLS = ["rust-learn-init", "rust-learn-continue", "rust-learn-status"];

const failures = [];
const passes = [];

function check(name, fn) {
  try {
    const problem = fn();
    if (problem) failures.push(`${name}: ${problem}`);
    else passes.push(name);
  } catch (error) {
    failures.push(`${name}: threw ${error.message}`);
  }
}

function walk(dir, predicate = () => true) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && ![".git", "node_modules", "results"].includes(entry.name)) out.push(...walk(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).split("\\").join("/");

/** Minimal YAML frontmatter parser: flat keys plus one level of nesting for `metadata`. */
function parseFrontmatter(text) {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = text.slice(text.indexOf("\n") + 1, end + 1);
  const data = {};
  let nestedKey = null;
  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indented = /^\s+\S/.test(rawLine);
    const match = rawLine.match(/^(\s*)([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) return { error: `unparsable frontmatter line: ${rawLine}` };
    const [, indent, key, rawValue] = match;
    const value = rawValue.trim().replace(/^["']|["']$/g, "");
    if (indented) {
      if (!nestedKey) return { error: `unexpected indented key: ${key}` };
      data[nestedKey][key] = value;
    } else if (value === "") {
      nestedKey = key;
      data[key] = {};
    } else {
      nestedKey = null;
      data[key] = value;
    }
  }
  return { data, body: text.slice(end + 4) };
}

const skillsDir = join(ROOT, "skills");

// ---------------------------------------------------------------------------
// Skill inventory
// ---------------------------------------------------------------------------

check("skills/ directory exists", () => (existsSync(skillsDir) ? null : "missing"));

const skillNames = existsSync(skillsDir)
  ? readdirSync(skillsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  : [];

check("exactly three skills are installable", () => {
  const expected = [...EXPECTED_SKILLS].sort().join(", ");
  const actual = skillNames.join(", ");
  return expected === actual ? null : `expected [${expected}], found [${actual}]`;
});

check("no extra slash commands or skills exist", () => {
  const stray = [];
  for (const dir of [join(ROOT, ".claude", "commands"), join(ROOT, ".claude", "skills")]) {
    if (existsSync(dir)) stray.push(rel(dir));
  }
  return stray.length ? `unexpected command directories: ${stray.join(", ")}` : null;
});

// ---------------------------------------------------------------------------
// SKILL.md frontmatter
// ---------------------------------------------------------------------------

for (const name of skillNames) {
  const skillFile = join(skillsDir, name, "SKILL.md");

  check(`${name}: SKILL.md exists`, () => (existsSync(skillFile) ? null : "missing"));

  if (!existsSync(skillFile)) continue;

  const text = readFileSync(skillFile, "utf8");
  const parsed = parseFrontmatter(text);

  check(`${name}: frontmatter parses`, () => {
    if (!parsed) return "no YAML frontmatter at the top of the file";
    if (parsed.error) return parsed.error;
    return null;
  });

  if (!parsed || parsed.error) continue;
  const fm = parsed.data;

  check(`${name}: name matches directory`, () => (fm.name === name ? null : `name is "${fm.name}"`));

  check(`${name}: name is spec-valid`, () => {
    if (!fm.name) return "missing";
    if (fm.name.length > 64) return "longer than 64 characters";
    if (/--/.test(fm.name)) return "contains consecutive hyphens";
    if (!/^[a-z0-9-]+$/.test(fm.name)) return "must be lowercase alphanumerics and hyphens";
    if (fm.name.startsWith("-") || fm.name.endsWith("-")) return "starts or ends with a hyphen";
    return null;
  });

  check(`${name}: description present and within 1024 characters`, () => {
    if (!fm.description) return "missing";
    if (fm.description.length > 1024) return `${fm.description.length} characters`;
    if (fm.description.length < 40) return "too short to be useful for model invocation";
    return null;
  });

  check(`${name}: allows explicit natural-language learning requests`, () => {
    // Keep natural-language explicit requests enabled by repository policy.
    const value = String(fm["disable-model-invocation"] ?? "").toLowerCase();
    return ["true", "yes", "on", "1"].includes(value)
      ? "manual-only invocation would disable the supported natural-language learning requests"
      : null;
  });

  check(`${name}: description scopes its own invocation`, () => {
    const description = String(fm.description ?? "");
    // The description is the only thing standing between a genuine request and an unwanted invocation, so it
    // must both invite an explicit ask and refuse a passing mention.
    if (!/Invoke this when the user explicitly/i.test(description)) {
      return "must state that it is invoked when the user explicitly asks";
    }
    if (!/Do not invoke it when Rust is (?:merely )?mentioned in passing/i.test(description)) {
      return "must state that a passing mention of Rust is not a trigger";
    }
    return null;
  });

  check(`${name}: declares an allowed-tools list`, () => {
    if (!fm["allowed-tools"]) return "missing";
    if (typeof fm["allowed-tools"] !== "string") return "must be a space-separated string";
    return null;
  });

  check(`${name}: uses only spec or Claude Code frontmatter keys`, () => {
    const allowed = new Set([
      "name",
      "description",
      "license",
      "compatibility",
      "metadata",
      "allowed-tools",
      "when_to_use",
      "argument-hint",
      "arguments",
      "disable-model-invocation",
      "user-invocable",
      "disallowed-tools",
      "model",
      "effort",
      "context",
      "agent",
      "background",
      "hooks",
      "paths",
      "shell",
    ]);
    const unknown = Object.keys(fm).filter((k) => !allowed.has(k));
    return unknown.length ? `unknown keys: ${unknown.join(", ")}` : null;
  });

  check(`${name}: stays under the 500-line guidance`, () => {
    const lines = text.split(/\r?\n/).length;
    return lines <= 500 ? null : `${lines} lines`;
  });

  check(`${name}: references only files that exist`, () => {
    const missing = [];
    const linkPattern = /\]\((?!https?:|#|mailto:)([^)]+)\)/g;
    for (const match of text.matchAll(linkPattern)) {
      const target = match[1].split("#")[0].trim();
      if (!target) continue;
      const resolved = resolve(dirname(skillFile), target);
      if (!existsSync(resolved)) missing.push(target);
    }
    return missing.length ? `broken links: ${[...new Set(missing)].join(", ")}` : null;
  });

  check(`${name}: body is substantial enough to guide behaviour`, () => {
    const body = parsed.body ?? "";
    return body.trim().length > 800 ? null : "body is suspiciously short";
  });
}

// ---------------------------------------------------------------------------
// Reference and asset hygiene
// ---------------------------------------------------------------------------

check("reference files are English and non-trivial", () => {
  const problems = [];
  for (const name of skillNames) {
    const dir = join(skillsDir, name, "references");
    for (const file of walk(dir, (f) => f.endsWith(".md"))) {
      const text = readFileSync(file, "utf8");
      if (hasChinese(text)) problems.push(`${rel(file)} contains Chinese text`);
      if (text.trim().length < 500) problems.push(`${rel(file)} is too small to justify a separate file`);
    }
  }
  return problems.length ? problems.join("; ") : null;
});

check("primary SKILL.md files are English-only", () => {
  const problems = [];
  for (const name of skillNames) {
    const text = readFileSync(join(skillsDir, name, "SKILL.md"), "utf8");
    // Quoted example dialogue in Chinese is allowed; it is a prompt for the mentor to speak.
    const prose = text
      .split(/\r?\n/)
      .filter((line) => !/^\s*>/.test(line))
      .join("\n");
    if (hasChinese(prose)) problems.push(`${name}/SKILL.md has Chinese outside quoted examples`);
  }
  return problems.length ? problems.join("; ") : null;
});

check("relative links from references resolve", () => {
  const problems = [];
  for (const file of walk(skillsDir, (f) => f.endsWith(".md"))) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/\]\((?!https?:|#|mailto:)([^)]+)\)/g)) {
      const target = match[1].split("#")[0].trim();
      if (!target) continue;
      if (target.includes("<") || target.includes("YYYY")) continue; // placeholder in a template
      if (!existsSync(resolve(dirname(file), target))) {
        problems.push(`${rel(file)} -> ${target}`);
      }
    }
  }
  return problems.length ? problems.join("; ") : null;
});

// ---------------------------------------------------------------------------
// Repository rules
// ---------------------------------------------------------------------------

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

check("no Chinese text in code, scripts, workflows, or skill files", () => {
  const problems = [];
  const codeExt = /\.(rs|toml|json|mjs|js|ts|sh|ps1|ya?ml)$/i;
  for (const file of walk(ROOT)) {
    const path = rel(file);
    if (path.startsWith(".git/") || path.includes("node_modules/")) continue;
    if (path.startsWith("evals/results/")) continue; // eval transcripts quote learner messages verbatim
    if (path === "skills/rust-learn-continue/references/curriculum/engineering-english.md") continue; // documents the rule
    if (path === "tests/repo-checks.mjs") continue; // contains CJK unicode-range escapes by design
    if (/\.(md)$/i.test(path) && path.startsWith("docs/")) continue; // docs explain the language policy
    if (!codeExt.test(path) && !path.endsWith("SKILL.md")) continue;
    if (hasChinese(readFileSync(file, "utf8"))) problems.push(path);
  }
  return problems.length ? problems.join(", ") : null;
});

check("no hardcoded learning workspace paths", () => {
  // Illustrative paths belong in the Windows guide and in templates, so those files are exempt. Everywhere
  // else, a concrete absolute path would mean someone baked in a real machine's layout.
  const exempt = new Set([
    "skills/rust-learn-continue/references/core/windows-and-encoding.md",
    "skills/rust-learn-continue/references/core/workspace.md",
  ]);
  const suspicious =
    /(?:[A-Za-z]:[\/]{1,2}(?:Workspace|Users|Learning)[\/][A-Za-z0-9_一-鿿]|\/home\/[a-z][a-z0-9_-]*\/|\/Users\/[A-Za-z][A-Za-z0-9_-]*\/)/;
  const problems = [];
  for (const file of walk(skillsDir, (f) => f.endsWith(".md"))) {
    const path = rel(file);
    if (exempt.has(path)) continue;
    if (suspicious.test(readFileSync(file, "utf8"))) problems.push(path);
  }
  return problems.length ? problems.join(", ") : null;
});

check("workspace.md documents every discovery mechanism", () => {
  const text = readFileSync(join(skillsDir, "rust-learn-continue", "references", "core", "workspace.md"), "utf8");
  const required = ["rust-apprentice.yaml", "workspaces.yaml", "APPDATA", "Library/Application Support", "XDG_STATE_HOME"];
  const missing = required.filter((token) => !text.includes(token));
  return missing.length ? `not documented: ${missing.join(", ")}` : null;
});

check("all skills preserve the explicit-request invocation policy", () => {
  const problems = [];
  for (const name of skillNames) {
    const text = readFileSync(join(skillsDir, name, "SKILL.md"), "utf8");
    if (/^disable-model-invocation:\s*(true|yes|on|1)\s*$/im.test(text)) problems.push(name);
  }
  return problems.length ? `${problems.join(", ")} would disable model invocation of explicit learning requests` : null;
});

check("SKILL.md files never instruct Claude to create a default workspace", () => {
  const problems = [];
  for (const name of skillNames) {
    const text = readFileSync(join(skillsDir, name, "SKILL.md"), "utf8");
    if (/default (?:learning )?workspace (?:path|location)/i.test(text) && !/no default/i.test(text)) {
      problems.push(name);
    }
  }
  return problems.length ? problems.join(", ") : null;
});

check("the three entrypoints are the only user-facing commands in the docs", () => {
  const commands = new Set();
  for (const file of walk(ROOT, (f) => f.endsWith(".md") || f.endsWith(".mjs"))) {
    const path = rel(file);
    if (path.startsWith(".git/") || path === "README.md") continue;
    if (path.startsWith("evals/")) continue; // eval cases quote learner messages, not commands
    for (const match of readFileSync(file, "utf8").matchAll(/(?:^|\s)\/(rust-learn-[a-z-]+)/g)) {
      commands.add(match[1]);
    }
  }
  const unexpected = [...commands].filter((c) => !EXPECTED_SKILLS.includes(c));
  return unexpected.length ? `unexpected commands: ${unexpected.join(", ")}` : null;
});

check("required repository files exist", () => {
  const required = ["README.md", "LICENSE", ".gitignore", "docs/architecture.md", "docs/state-schema.md"];
  const missing = required.filter((f) => !existsSync(join(ROOT, f)));
  return missing.length ? `missing: ${missing.join(", ")}` : null;
});

check("CI workflow exists and runs the checks", () => {
  const workflow = join(ROOT, ".github", "workflows", "ci.yml");
  if (!existsSync(workflow)) return "missing .github/workflows/ci.yml";
  const text = readFileSync(workflow, "utf8");
  const required = ["repo-checks.mjs", "validate-skills.mjs", "assert-discovery.mjs"];
  const packageScripts = text.includes("npm test")
    ? JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts.test : "";
  const missing = required.filter((script) => !`${text}\n${packageScripts}`.includes(script));
  return missing.length ? `CI does not run: ${missing.join(", ")}` : null;
});

check("eval suite covers the required learner situations", () => {
  const evalsDir = join(ROOT, "evals");
  if (!existsSync(evalsDir)) return "missing evals/";
  const cases = readdirSync(evalsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  // Behavioural cases and the Windows/encoding, curriculum and context-efficiency scenarios.
  const required = [
    "total-beginner",
    "experienced-new-to-rust",
    "overconfident-beginner",
    "ownership-struggle",
    "returning-after-a-week",
    "forgot-old-concept",
    "overly-advanced-project",
    "asks-claude-to-write-everything",
    "compiler-error",
    "weak-git",
    "strong-git",
    "chinese-code-comment",
    "poor-english-comment",
    "http-networking",
    "async-rust",
    "becoming-independent",
    "windows-chinese-path",
    "windows-gbk-console-output",
    "windows-powershell-5",
    "curriculum-lazy-loading",
    "context-year-of-history",
    "context-many-notes",
    "status-compact-summary",
    "status-detail-on-request",
    "codebase-reading-unfamiliar",
    "crypto-api-misuse",
    "init-impatient-learner",
  ];
  const missing = required.filter((r) => !cases.includes(r));
  return missing.length ? `missing eval cases: ${missing.join(", ")}` : null;
});

check("curriculum references exist for every indexed domain", () => {
  const index = join(skillsDir, "rust-learn-continue", "references", "curriculum", "index.md");
  if (!existsSync(index)) return "missing curriculum/index.md";
  const text = readFileSync(index, "utf8");
  const referenced = [...text.matchAll(/\]\((?!https?:)([^)#]+)\.md\)/g)].map((m) => m[1]);
  const missing = referenced.filter(
    (rel) => !existsSync(resolve(dirname(index), `${rel}.md`))
  );
  return missing.length ? `index points at missing files: ${[...new Set(missing)].join(", ")}` : null;
});

check("entrypoints stay thin", () => {
  const limits = { "rust-learn-init": 130, "rust-learn-continue": 180, "rust-learn-status": 120 };
  const problems = [];
  for (const [name, limit] of Object.entries(limits)) {
    const file = join(skillsDir, name, "SKILL.md");
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/).length;
    if (lines > limit) problems.push(`${name} is ${lines} lines (limit ${limit})`);
  }
  return problems.length ? problems.join("; ") : null;
});

check("no SKILL.md inlines curriculum content", () => {
  const problems = [];
  for (const name of skillNames) {
    const file = join(skillsDir, name, "SKILL.md");
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    const fences = (text.match(/^```/gm) ?? []).length;
    if (fences > 8) problems.push(`${name} has ${fences / 2} code blocks, suggesting inlined teaching content`);
  }
  return problems.length ? problems.join("; ") : null;
});

// ---------------------------------------------------------------------------
// Pi prompt aliases
//
// prompts/ is the Pi adapter: three thin wrappers that route to the shared
// skills. They must stay thin and must never grow teaching, state or
// curriculum content — that belongs in skills/ only.
// ---------------------------------------------------------------------------

const promptsDir = join(ROOT, "prompts");

check("exactly three Pi prompt aliases exist with matching filenames", () => {
  if (!existsSync(promptsDir)) return "prompts/ directory is missing";
  const actual = readdirSync(promptsDir, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name.replace(/\.md$/, ""))
    .sort();
  const expected = [...EXPECTED_SKILLS].sort();
  return JSON.stringify(actual) === JSON.stringify(expected)
    ? null
    : `expected [${expected.join(", ")}], found [${actual.join(", ")}]`;
});

for (const name of EXPECTED_SKILLS) {
  const file = join(promptsDir, `${name}.md`);
  check(`Pi alias ${name} is a thin wrapper`, () => {
    if (!existsSync(file)) return "missing";
    const text = readFileSync(file, "utf8");
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) return "missing frontmatter";
    if (!/^description: \S/m.test(fm[1])) return "frontmatter lacks a description";
    if (!/^argument-hint: \S/m.test(fm[1])) return "frontmatter lacks an argument-hint";
    const body = text.slice(fm[0].length).replace(/\r/g, "");
    if (!body.includes(`load and follow the \`${name}\` skill`)) {
      return `does not route to the ${name} skill`;
    }
    if (!body.includes("$ARGUMENTS")) return "does not pass $ARGUMENTS through";
    const meaningful = body.split(/\n/).filter((l) => l.trim() && l.trim() !== "$ARGUMENTS");
    if (meaningful.length > 3) return `has ${meaningful.length} content lines; aliases must stay thin`;
    return null;
  });
}

check("no duplicated teaching logic outside skills/", () => {
  // Anything in the adapters that looks like curriculum or state content is drift.
  const problems = [];
  for (const file of EXPECTED_SKILLS.map((n) => join(promptsDir, `${n}.md`))) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    if (/mastery|review queue|learner model|curriculum|hint ladder|```rust/.test(text)) {
      problems.push(`${rel(file)} contains teaching or state vocabulary`);
    }
  }
  return problems.length ? problems.join("; ") : null;
});

check("no Claude-specific duplicate of the core skills exists", () => {
  const duplicates = [join(ROOT, ".pi"), join(ROOT, ".claude", "skills")].filter((d) => existsSync(d));
  return duplicates.length ? `unexpected skill copies: ${duplicates.map(rel).join(", ")}` : null;
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const total = passes.length + failures.length;
console.log(`rust-apprentice repository checks: ${passes.length}/${total} passed\n`);

for (const p of passes) console.log(`  ok    ${p}`);
if (failures.length) {
  console.log("");
  for (const f of failures) console.log(`  FAIL  ${f}`);
  console.log(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}

console.log("\nAll checks passed.");
