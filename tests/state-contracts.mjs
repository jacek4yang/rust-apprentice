import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { ROOT, STATES, DOMAINS, parseYaml, validateModel, classifyMarker, containedPath } from "./lib/state-contracts.mjs";

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
}
let checked = 0;
let sample;
for (const file of [...walk(resolve(ROOT, "skills")), ...walk(resolve(ROOT, "docs")), ...walk(resolve(ROOT, "evals"))]) {
  if (file.includes(`${process.platform === "win32" ? "\\" : "/"}results`)) continue;
  if (!/\.(md|sh|yaml)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  const blocks = [...text.matchAll(/```yaml\r?\n([\s\S]*?)```/g), ...text.matchAll(/<<'YAML'\r?\n([\s\S]*?)\r?\nYAML/g)];
  for (const match of blocks) {
    const body = match[1].replaceAll("YYYY-MM-DD", "2026-09-22");
    const value = parseYaml(body);
    if (value?.schema === "rust-apprentice/1" && value?.domains !== undefined) {
      try { validateModel(value); } catch (error) { throw new Error(`${file}: ${error.message}`); }
      sample ??= value;
      checked++;
    }
    if (value?.workspace === "rust-apprentice" && !body.includes("<")) {
      assert.equal(classifyMarker(value, ROOT), "current", file);
      checked++;
    }
    // Also validate standalone domain examples such as the mastery-model snippet.
    for (const [key, entry] of Object.entries(value ?? {})) {
      if (DOMAINS.includes(key) && entry?.state) assert.ok(STATES.includes(entry.state), `${file}: illegal state ${entry.state}`);
    }
  }
}
assert.ok(sample && checked >= 3, "state examples must be exercised");
assert.equal(STATES.length, 8);
for (const mutate of [
  m => { m.domains.networking = { state: "developing" }; },
  m => { delete m.current; },
  m => { m.stage = "H"; },
  m => { m.updated = "2026-02-30"; },
  m => { m.current.domain = "unknown"; },
  m => { m.weaknesses = Array(6).fill("weakness"); },
  m => { m.independence = "expert"; },
]) {
  const invalid = structuredClone(sample);
  mutate(invalid);
  assert.throws(() => validateModel(invalid));
}
const marker = { schema: "rust-apprentice/1", workspace: "rust-apprentice", name: "Test", created: "2026-09-22",
  learner: "learner/profile.md", state: "state/progress.md", learner_model: "state/learner-model.md", review_queue: "state/review-queue.md" };
assert.equal(classifyMarker(marker, ROOT), "current");
assert.equal(classifyMarker({ ...marker, schema: "rust-apprentice/2" }, ROOT), "unsupported");
assert.equal(classifyMarker({ ...marker, schema: "unrelated/1" }, ROOT), "unsupported");
assert.equal(classifyMarker({ ...marker, schema: undefined }, ROOT), "legacy");
assert.equal(classifyMarker({ ...marker, learner_model: undefined }, ROOT), "incomplete");
assert.equal(classifyMarker(marker, ROOT, { checkFiles: true }), "incomplete");
assert.throws(() => classifyMarker({ ...marker, review_queue: marker.state }, ROOT));
for (const path of ["../outside.md", "state/../../outside.md", "C:\\outside.md", "C:outside.md", "/outside.md", "\\\\server\\share", ".", "state/x:stream"])
  assert.throws(() => containedPath(ROOT, path), path);
assert.throws(() => parseYaml("schema: one\nschema: two"));
console.log(`State contracts passed: ${checked} examples plus invalid-state, version, path and YAML counterexamples.`);
