// Development-only oracle. The installed skills have no Node runtime dependency.
import { readFileSync, realpathSync, existsSync, statSync } from "node:fs";
import { resolve, relative, isAbsolute, win32, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const SCHEMA = "rust-apprentice/1";
const mastery = readFileSync(resolve(ROOT, "skills/rust-learn-continue/references/core/mastery-model.md"), "utf8");
export const STATES = [...mastery.matchAll(/^\| `([a-z-]+)` \|/gm)].map(m => m[1]);
const index = readFileSync(resolve(ROOT, "skills/rust-learn-continue/references/curriculum/index.md"), "utf8");
export const DOMAINS = [...index.matchAll(/^\| `([a-z-]+)` \|/gm)].map(m => m[1]).concat(["git-github", "engineering-english"]);

export function parseYaml(text) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length) throw new Error(doc.errors.map(e => e.message).join("; "));
  return doc.toJS();
}
function requireValue(condition, message) { if (!condition) throw new Error(message); }
function object(value) { return value && typeof value === "object" && !Array.isArray(value); }
function string(value) { return typeof value === "string" && value.trim().length > 0; }
function date(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function strings(value, max, label) {
  requireValue(Array.isArray(value) && value.length <= max && value.every(string), `${label}: expected at most ${max} strings`);
}

export function validateModel(model) {
  requireValue(object(model), "learner model must be a mapping");
  requireValue(model.schema === SCHEMA, "unsupported model schema");
  requireValue(date(model.updated), "invalid updated date");
  requireValue(/^[A-G]$/.test(model.stage), "invalid stage");
  requireValue(/^[A-E]$/.test(model.english_stage), "invalid english_stage");
  for (const key of ["independence", "git_level"]) requireValue(STATES.includes(model[key]), `invalid ${key}`);
  if (model.stage_since !== undefined) requireValue(date(model.stage_since), "invalid stage_since");
  requireValue(object(model.current), "missing current");
  for (const key of ["project", "objective", "next_action"]) requireValue(string(model.current[key]), `missing current.${key}`);
  requireValue(DOMAINS.includes(model.current.domain), "unknown current.domain");
  requireValue(object(model.domains), "missing domains mapping");
  for (const [key, entry] of Object.entries(model.domains)) {
    requireValue(DOMAINS.includes(key), `unknown domain: ${key}`);
    requireValue(object(entry) && STATES.includes(entry.state), `invalid state for ${key}`);
    for (const field of ["strengths", "active", "weak", "next_review"]) {
      if (entry[field] !== undefined) strings(entry[field], 3, `${key}.${field}`);
    }
  }
  strings(model.weaknesses, 5, "weaknesses");
  strings(model.blockers, 5, "blockers");
  strings(model.goals, 5, "goals");
  return model;
}

export function containedPath(root, value) {
  requireValue(string(value) && !/[\x00-\x1f]/.test(value), "invalid marker path");
  requireValue(!isAbsolute(value) && !win32.isAbsolute(value) && !value.includes(":"), "marker path must be relative");
  const normalized = value.replaceAll("\\", "/");
  requireValue(!normalized.split("/").includes(".."), "marker path traversal");
  const target = resolve(root, normalized);
  const inside = (base, path) => {
    const rel = relative(base, path);
    return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
  };
  requireValue(inside(resolve(root), target), "marker path escapes workspace");
  // Follow existing parents as well, so a missing file below a junction cannot escape.
  if (existsSync(root)) {
    let ancestor = target;
    while (!existsSync(ancestor)) ancestor = resolve(ancestor, "..");
    const realRoot = realpathSync(root);
    const realAncestor = realpathSync(ancestor);
    requireValue(realAncestor === realRoot || inside(realRoot, realAncestor), "marker symlink escapes workspace");
  }
  return target;
}

export function classifyMarker(marker, root, { checkFiles = false } = {}) {
  requireValue(object(marker) && marker.workspace === "rust-apprentice", "unrecognized marker");
  if (marker.schema !== undefined && marker.schema !== SCHEMA) return "unsupported";
  for (const field of ["learner", "state", "learner_model", "review_queue"]) {
    if (marker[field] !== undefined) containedPath(root, marker[field]);
  }
  if (marker.schema === undefined) {
    requireValue(string(marker.state), "legacy marker missing state");
    return "legacy";
  }
  requireValue(string(marker.name) && date(marker.created), "invalid marker identity");
  if (["learner", "state", "learner_model", "review_queue"].some(key => marker[key] === undefined)) return "incomplete";
  const targets = ["learner", "state", "learner_model", "review_queue"].map(key => containedPath(root, marker[key]));
  requireValue(new Set(targets.map(p => process.platform === "win32" ? p.toLowerCase() : p)).size === 4, "marker paths must be distinct");
  if (checkFiles && targets.some(p => !existsSync(p) || !statSync(p).isFile())) return "incomplete";
  return "current";
}
