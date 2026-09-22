# Behavioural evaluations

Run development checks first: `npm ci --ignore-scripts`, then `npm test`. Node 20+ and Rust are required
for development checks only. The installed teaching skills remain Markdown-only.

## Running

```sh
npm run eval -- --list
npm run eval -- --case total-beginner --runs 1
npm run eval -- --case ownership-observed-failure --runs 3
npm run eval -- --case all --runs 3
```

The runner invokes cases separately, grants Write/Edit only for write cases, enables scaffolding whenever a
workspace is required, and always uses `--no-publish`. Initialization and missing-workspace cases deliberately
use `--no-scaffold`: an empty workspace is their actual precondition. It stops on the first unsuccessful run;
use a single case to resume. CLI version, commit, dirty status, options and local reports are recorded under
`evals/results/`. Model and judge overrides are optional; record explicit versions for release comparisons.

Raw invocation for an initialized workspace (after `npm ci`):

```sh
claude plugin eval . --case context-year-of-history --runs 1 --ablation none --trust-plugin --scaffold --no-publish
```

Pass forward-slash paths (`D:/repo` not `D:\repo`) on Windows: Claude Code 2.1.270 native Windows stripped
backslashes from harness script paths (exit 127, zero model turns). Forward slashes avoid that path handling.

For a write case, add `--allow-tools Write Edit`. Do not grant these globally to a mixed suite. No current case
requires granting Bash to the model. Scaffolding itself executes reviewed Bash/Node on the host before the
model starts; it must target only the empty temporary cwd supplied by the harness.

## Invocation style

Case prompts address the mentor in natural language ("Let's continue my Rust apprenticeship."), never with a
leading `/rust-learn-*` slash command. A slash command is expanded by the client into a command-message
injection, so the skill loads without a Skill tool call and the mandatory `skill-loaded` grader cannot observe
it — the early smoke runs scored 0.75–0.88 on otherwise-correct teaching turns for exactly this reason.
Natural-language requests are a documented invocation path and produce a verifiable Skill call. The contract
checks reject any prompt body that starts with `/rust-learn`.

## Case inventory and fixtures

[fixtures/catalog.mjs](fixtures/catalog.mjs) is the inventory of all 29 cases: target skill, read/write mode,
domain and concrete next action. `npm run eval -- --list` prints it. Each directory has the learner input in
`prompt.md`, a scaffold pointer in `case.yaml`, and its individual pass/fail criteria under `graders/`.

All scenarios use [fixtures/build.mjs](fixtures/build.mjs). Continue/status fixtures have a marker at the run
root, matching the real upward discovery algorithm; no recursive child search is needed. The registry is
redirected by an evaluation-only system instruction to `.eval/registry/workspaces.yaml`. Host registries
must never be read. Initialization targets `./learner-workspace`, never a real user path.

The history cases include 365 historical sessions plus the latest session, 365 notes, 1,200 evidence entries
and archived logs. Every built fixture stores a SHA256 baseline in `.eval/before.json` for post-run checks.
The fixture builder rejects nonempty targets and the repository itself.

## What the graders measure

Every case requires the intended Skill call. Read-only cases assert no Write/Edit/Bash use; write cases
receive explicit tool grants. State updates are graded against file contents, retaining original evidence.
A valid Rust snippet and a real E0502 snippet are compiled by the contract checks, so the judge cannot reward
invented compiler errors. Reported forgetting alone calls for a probe, not a capability demotion. The first
natural-language smoke runs after the invocation fix: total-beginner 1.00 (8/8), async-rust 1.00 (8/8),
init-impatient-learner 1.00 (4/4, workspace written), status-compact-summary 0.88 — the mentor listed only the
domains it judged relevant instead of one line per domain, a genuine product failure to re-run against, not a
grader artifact.

Markdown rubric bodies contain the actual PASS/FAIL criteria. Do not also set a short `criteria` frontmatter
field: the client may use it instead of the detailed body. Do not use `focus: files` for reading or updates:
it contains only newly created filenames. Use trace for actions and `{source: file, path: ...}` for contents.
LLM trace graders see a limited excerpt. The runner also audits the full trace, checks cold-file reads and
hot-state line budgets, rejects unexpected tools/delegation, compares read-only fixture contents, and checks
preserved evidence and written state. Its audit has negative regression tests; actual recovery still needs
multi-session model tests.
These semantics were checked against [the official eval reference](https://code.claude.com/docs/en/plugin-evals).

## Release evidence

A score of 0.8 alone is insufficient. Infrastructure errors, unrun cases and skipped graders must remain
separate from product failures. Skill loading, no fabricated evidence, read-only isolation and preservation
of history are hard gates. Inspect every run and retain actual model/CLI versions and grader verdicts.
The full 29-case three-run suite and multi-session recovery/retention scenarios are not yet certified.
