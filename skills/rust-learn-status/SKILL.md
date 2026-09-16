---
name: rust-learn-status
description: 'Show a compact summary of Rust apprenticeship progress — current stage, domain mastery, active weaknesses, the current project, recent evidence, and an approximate trajectory. Invoke this only when the user explicitly asks to see their progress, asks where they are in their Rust learning, or types /rust-learn-status. Do not invoke it because Rust is mentioned in passing.'
license: MIT
compatibility: Designed for Claude Code on Windows, macOS, or Linux.
allowed-tools: Read Glob Grep
metadata:
  version: "1.0"
  entrypoint: status
---

# Report progress

Occasional progress inspection. Compact by default; detail only when asked for.

## Non-negotiables

1. **Read the learner model, not the evidence.** `state/learner-model.md` is the source for the summary. Reading
   domain evidence to produce it defeats the purpose and costs context for nothing.
2. **Domains, not concepts.** At most nineteen lines, and only the domains actually touched.
3. **No numbers.** Mastery states only. No percentages, scores, grades, or streaks.
4. **No promised dates.** Horizons as ranges, justified by evidence.
5. **One command.** Detail is shown conversationally, in this session, on request.

## Step 1 — Find the workspace

Follow [workspace.md](../rust-learn-continue/references/core/workspace.md). Same discovery as
`/rust-learn-continue`. No workspace → say so in one line and point at `/rust-learn-init`.

## Step 2 — Read only the hot state

- `rust-apprentice.yaml`
- `state/learner-model.md` — the whole summary lives here
- `state/progress.md` — the exact next action
- The last few lines of `state/log.md` — recent events

Stop there. Do not read `learner/evidence/`, `notes/`, `archive/`, past sessions, or the curriculum.

## Step 3 — Report

Follow [status-reporting.md](../rust-learn-continue/references/core/status-reporting.md) for the exact shape.
Roughly one screen:

- stage, and how much help they normally need
- domain mastery, one line per touched domain
- strongest areas, with the observation behind each
- highest-value weaknesses, stated concretely
- current project and the next action
- recent evidence, two or three items
- an approximate trajectory

Omit any section with nothing in it. A new learner gets three lines, not a page.

## Step 4 — Detail on request

If the learner asks about a specific area, read that one domain's file in `learner/evidence/` and summarise
strengths, active items and weaknesses with the observations behind them. Then say in one sentence what would
move that domain's state up.

Load nothing else. Do not expand into other domains because they look related.

## Step 5 — Hand back

If the learner wants to continue, do not make them retype anything — continue the work directly, since the
objective is already loaded.

If the report surfaced a due review or an active weakness worth working on now, say so in one line and offer to
start there.

## What not to do

- Do not print the curriculum, a roadmap, or a topic checklist.
- Do not show mastery for domains the learner has not worked on.
- Do not compare them to a schedule, another learner, or a target date.
- Do not soften a weakness into vagueness. `"Confused Arc with Mutex twice"` beats `"still developing in
  concurrency"`.
- Do not report hint-ladder rungs or internal state vocabulary. "Needed a rung-2 hint" and "will reach
  practiced" are the mentor's bookkeeping, and the rung number reads as a rating. Say what happened in plain
  language instead.
- Do not offer to run an assessment. Assessment is continuous; there is nothing to run.
- Do not end with encouragement. End with the next action, or with the answer to what was asked.

## References

| Need | Load |
| :--- | :--- |
| Exact output shape, trajectory rules | [core/status-reporting.md](../rust-learn-continue/references/core/status-reporting.md) |
| What the mastery states mean | [core/mastery-model.md](../rust-learn-continue/references/core/mastery-model.md) |
| Learner model schema | [core/learner-model.md](../rust-learn-continue/references/core/learner-model.md) |
| Milestone stages | [core/mastery-model.md](../rust-learn-continue/references/core/mastery-model.md) |
