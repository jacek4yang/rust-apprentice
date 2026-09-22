import { mkdirSync, writeFileSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { stringify } from "yaml";
import { catalog } from "./catalog.mjs";
import { validateModel, classifyMarker, ROOT } from "../../tests/lib/state-contracts.mjs";

export function fixtureFiles(name) {
  const spec = catalog[name];
  if (!spec) throw new Error(`Unknown fixture: ${name}`);
  const files = {};
  files[".eval/registry/workspaces.yaml"] = "schema: rust-apprentice/1\nworkspaces: []\n";
  if (spec.skill === "init" || spec.mode === "none") return files;
  const advanced = ["becoming-independent", "strong-git", "codebase-reading-unfamiliar", "context-year-of-history"].includes(name);
  const beginner = ["async-rust", "overly-advanced-project", "weak-git"].includes(name);
  const model = {
    schema: "rust-apprentice/1", updated: "2026-09-16", stage: advanced ? "D" : beginner ? "A" : "C",
    stage_since: "2026-08-01", independence: advanced ? "mostly-independent" : "guided", english_stage: "B",
    git_level: name === "strong-git" ? "independently-demonstrated" : "guided",
    current: { project: "logscan", domain: spec.domain, objective: spec.next, next_action: spec.next },
    domains: { "rust-language": { state: beginner ? "introduced" : "practiced" }, [spec.domain]: { state: beginner ? "introduced" : "practiced" } },
    weaknesses: [], blockers: [], goals: ["Build a CLI that parses log records reliably."],
  };
  if (name.startsWith("status-") || name.startsWith("context-")) {
    model.domains.networking = { state: "practiced", strengths: ["Explained HTTP request and response semantics unaided"], weak: ["Needed a hint about connection reuse under failure"] };
  }
  if (name === "forgot-old-concept") model.domains[spec.domain] = { state: "independently-demonstrated", strengths: ["Previously explained returned-reference lifetimes unaided"] };
  if (name === "ownership-observed-failure") model.weaknesses = ["Previously held a reference across a Vec mutation."];
  validateModel(model);
  const marker = { schema: "rust-apprentice/1", workspace: "rust-apprentice", name: "Isolated evaluation",
    created: "2025-09-01", learner: "learner/profile.md", state: "state/progress.md", learner_model: "state/learner-model.md", review_queue: "state/review-queue.md" };
  classifyMarker(marker, ROOT);
  files["rust-apprentice.yaml"] = stringify(marker);
  files["state/learner-model.md"] = stringify(model);
  files["state/progress.md"] = `# Progress\n\nupdated: 2026-09-16\nphase: project\nproject: logscan\ndomain: ${spec.domain}\n\n## Objective\n\n${spec.next}\nstarted: 2026-09-16\nstatus: awaiting-learner\n\n## Next action\n\n${spec.next}\n\n## Blockers\n\n- (empty)\n\n## Paused\n\n- (empty)\n`;
  const header = "| Concept | Due | Attempts | Last result | Clean streak | Last attempted | Last session |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
  files["state/review-queue.md"] = `# Review queue\n\nupdated: 2026-09-16\n\n## Due\n\n${header}\n## Scheduled\n\n${header}\n## Retired\n\n- (empty)\n`;
  files["state/log.md"] = "# Log\n\n- 2026-09-09 - Implemented the record parser with a light hint.\n- 2026-09-16 - Chose the next project slice from demonstrated work.\n";
  files["state/sessions/2026-09-16-a.md"] = `# 2026-09-16\n\nfocus: ${spec.domain}\ndid: learner predicted the previous test result\nevidence: explained the behaviour without a full solution\nleft: next project slice\nnext: ${spec.next}\n`;
  files["learner/profile.md"] = `# Learner profile\n\nupdated: 2026-09-16\nconversation language: Chinese\nenglish stage: B\nos: ${name.startsWith("windows-") ? "Windows 11; PowerShell 5.1" : "use the current test platform"}\n\n## Claims\n\n- Wants to build a reliable CLI.\n\n## Observations\n\n- ${advanced ? "Has resolved several project tasks independently." : "Wrote a record parser with a light hint."}\n\n## Provisional starting point\n\n- Stage ${model.stage}; recheck unfamiliar concepts.\n`;
  files["learner/evidence/networking.md"] = "# Networking evidence\n\n2026-09-09 - Explained HTTP request and response semantics unaided.\n2026-09-16 - Needed a hint to describe connection reuse under failure.\n";
  files["learner/evidence/ownership-memory.md"] = name === "forgot-old-concept"
    ? "# Ownership evidence\n\n2026-08-01 - Explained returned-reference lifetimes unaided in a new function.\n"
    : "# Ownership evidence\n\n2026-09-09 - Predicted a move correctly; needed a hint about overlapping borrows.\n";
  files["projects/logscan/Cargo.toml"] = '[package]\nname = "logscan"\nversion = "0.1.0"\nedition = "2021"\n';
  files["projects/logscan/src/main.rs"] = 'fn main() { println!("logscan"); }\n';
  if (name === "context-year-of-history" || name === "context-many-notes") {
    for (let i = 0; i < 365; i++) {
      const date = new Date(Date.UTC(2025, 8, 1 + i)).toISOString().slice(0, 10);
      files[`state/sessions/${date}-history.md`] = `# ${date}\n\nfocus: previous parser slice\ndid: wrote a test\nevidence: predicted one result\nleft: another slice\nnext: see current progress\n`;
      files[`notes/topic-${i}.md`] = `# Topic ${i}\n\n${"A learner-written note, not startup context.\n".repeat(20)}`;
    }
    files["archive/evidence-2025.md"] = Array.from({ length: 1200 }, (_, i) => `- historical-${i}: observed a past parser attempt.`).join("\n") + "\n";
    files["archive/log-2025.md"] = Array.from({ length: 1000 }, (_, i) => `- historical-event-${i}: past work.`).join("\n") + "\n";
    files["archive/retired-project/README.md"] = "# Completed project\n\nHistorical project; no current task here.\n";
  }
  return files;
}

export function buildFixture(name, directory) {
  const root = resolve(directory);
  const rel = relative(ROOT, root);
  if (!rel || (!rel.startsWith("..") && !isAbsolute(rel))) throw new Error("Fixtures must be outside the repository");
  mkdirSync(root, { recursive: true });
  if (readdirSync(root).length) throw new Error("Fixture target must be empty; refusing to overwrite files");
  const files = fixtureFiles(name);
  for (const [path, content] of Object.entries(files)) {
    const target = resolve(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, { encoding: "utf8", flag: "wx" });
  }
  const hashes = Object.fromEntries(Object.keys(files).map(path => [path, createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex")]));
  writeFileSync(resolve(root, ".eval/before.json"), JSON.stringify({ name, hashes }, null, 2), { flag: "wx" });
  return files;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildFixture(process.argv[2], process.cwd());
  console.log(`Fixture ready: ${process.argv[2]}; marker is at the run root when a workspace is required.`);
}
