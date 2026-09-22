import { readFileSync, existsSync } from "node:fs";
import { resolve, join, relative, posix } from "node:path";
import { fixtureFiles } from "../../evals/fixtures/build.mjs";
import { parseYaml, validateModel, classifyMarker } from "./state-contracts.mjs";

const normalize = path => String(path ?? "").replaceAll("\\", "/").toLowerCase();
export function auditTrace(events, spec) {
  const errors = [];
  const init = events.find(e => e.type === "system" && e.subtype === "init");
  const root = normalize(init?.cwd);
  if (!root) errors.push("missing trace cwd");
  const calls = events.flatMap(e => Array.isArray(e.message?.content) ? e.message.content.filter(c => c.type === "tool_use") : []);
  const allowed = ["Read", "Glob", "Grep", "Skill", ...(spec.mode === "write" ? ["Write", "Edit"] : [])];
  if (calls.some(c => !allowed.includes(c.name))) errors.push("unaccounted tool or delegated work in trace");
  if (!calls.some(c => c.name === "Skill" && String(c.input?.skill).includes(`rust-learn-${spec.skill}`))) errors.push("target skill was not loaded");
  if (spec.mode !== "write" && calls.some(c => ["Write", "Edit", "Bash", "PowerShell"].includes(c.name))) errors.push("read-only case used mutation tools");
  const bounded = spec.name.startsWith("context-") || spec.name.startsWith("status-") || spec.name === "curriculum-lazy-loading";
  const domains = new Set();
  const topics = new Set();
  const reads = [];
  let hotLines = 0;
  let referenceLines = 0;
  let readBytes = 0;
  for (const call of calls.filter(c => ["Read", "Grep"].includes(c.name))) {
    const raw = call.input?.file_path ?? call.input?.path ?? init?.cwd;
    const supplied = normalize(raw);
    const path = posix.normalize(supplied.startsWith("/") || /^[a-z]:\//.test(supplied) ? supplied : `${root}/${supplied}`);
    const results = events.flatMap(e => Array.isArray(e.message?.content) ? e.message.content.filter(c => c.type === "tool_result" && c.tool_use_id === call.id) : []);
    const text = results.map(c => typeof c.content === "string" ? c.content : JSON.stringify(c.content)).join("\n");
    const lines = text ? text.split(/\r?\n/).length : 0;
    readBytes += Buffer.byteLength(text);
    reads.push({ path: raw, tool: call.name, lines, bytes: Buffer.byteLength(text) });
    const isReference = path.includes("/skills/") && (path.includes("/references/") || path.endsWith("/skill.md") || path.includes("/assets/"));
    if (isReference) referenceLines += lines;
    else if (path.startsWith(root + "/") || (!path.includes(":") && !path.startsWith("/"))) hotLines += lines;
    if (!bounded) continue;
    if (/(^|\/)(notes|archive)\//.test(path)) errors.push(`cold content read: ${raw}`);
    if (call.name === "Grep" && path === root) errors.push("unbounded workspace Grep");
    if (/learner\/evidence\//.test(path) && !(spec.name === "status-detail-on-request" && path.endsWith("/networking.md"))) errors.push(`unexpected evidence read: ${raw}`);
    const reference = path.match(/\/references\/(curriculum|rust)\/([^/]+)\.md$/);
    if (reference && reference[2] !== "index") {
      if (reference[1] === "rust" && ["traits", "lifetimes", "errors", "async", "concurrency"].includes(reference[2])) topics.add(path);
      else domains.add(path);
    }
    if (spec.skill === "status" && reference) errors.push("status loaded curriculum");
  }
  if (bounded && hotLines > 400) errors.push(`hot-state read budget exceeded: ${hotLines}`);
  if (bounded && (domains.size > 1 || topics.size > 1)) errors.push("multiple domain/topic references loaded");
  return { errors, cwd: init?.cwd, model: init?.model, reads, hotLines, referenceLines, readBytes };
}

export function reportStatus(report, expectedRuns) {
  if (!report || report.partial || !report.cases?.length) return "infrastructure-failure";
  for (const entry of report.cases) {
    const runs = entry.arms?.with;
    if (!runs || runs.length !== expectedRuns || runs.some(r => r.error || r.skippedPaidGraders || !r.graders?.length)) return "infrastructure-failure";
    for (const run of runs) {
      if (run.score < 0.8 || !run.graders.some(g => g.name === "skill-loaded")) return "product-failure";
      if (run.graders.some(g => /^(skill-loaded|no-write|no-edit|no-bash|state-updated|workspace-created|no-invented-error|no-invented-state|no-solution-code)$/.test(g.name) && !g.passed)) return "product-failure";
    }
  }
  return "passed";
}

export function auditReport(report, spec, expectedRuns) {
  const result = { status: reportStatus(report, expectedRuns), runs: [] };
  if (result.status === "infrastructure-failure") return result;
  for (const run of report.cases.flatMap(c => c.arms.with)) {
    if (!run.tracePath || !existsSync(run.tracePath)) { result.status = "infrastructure-failure"; continue; }
    const events = readFileSync(run.tracePath, "utf8").trim().split(/\r?\n/).map(line => JSON.parse(line));
    const audit = auditTrace(events, spec);
    if (spec.mode !== "none") {
      if (!audit.cwd || (spec.skill !== "init" && !existsSync(join(audit.cwd, ".eval/before.json")))) {
        result.status = "infrastructure-failure";
        audit.errors.push("required fixture was not staged");
      } else {
        // Derive expected contents from source, not the model-editable snapshot.
        for (const [path, before] of Object.entries(spec.skill === "init" ? {} : fixtureFiles(spec.name))) {
          const target = resolve(audit.cwd, path);
          if (relative(audit.cwd, target).startsWith("..")) throw new Error("unsafe fixture path");
          const after = existsSync(target) ? readFileSync(target, "utf8") : undefined;
          if (spec.mode !== "write" && after !== before) audit.errors.push(`read-only fixture changed: ${path}`);
          if (path.startsWith("learner/evidence/") && (after === undefined || !after.startsWith(before))) audit.errors.push(`evidence overwritten: ${path}`);
        }
        if (spec.mode === "write") {
          const ws = spec.skill === "init" ? join(audit.cwd, "learner-workspace") : audit.cwd;
          try {
            const marker = parseYaml(readFileSync(join(ws, "rust-apprentice.yaml"), "utf8"));
            if (classifyMarker(marker, ws, { checkFiles: true }) !== "current") throw new Error("workspace is not current");
            const text = readFileSync(join(ws, marker.learner_model), "utf8");
            validateModel(parseYaml(text.match(/```yaml\r?\n([\s\S]*?)```/)?.[1] ?? text));
          } catch (error) { audit.errors.push(`invalid written state: ${error.message}`); }
        }
      }
    }
    if (audit.errors.length && result.status !== "infrastructure-failure") result.status = "product-failure";
    result.runs.push(audit);
  }
  return result;
}
