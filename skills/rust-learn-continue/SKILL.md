---
name: rust-learn-continue
description: Continue a Rust apprenticeship from persistent learning state. Resumes the current task or picks the highest-value next step, teaches one small unit, and keeps the learner writing the code. Invoke this only when the user explicitly asks to carry on learning Rust, asks to continue their apprenticeship, or types /rust-learn-continue. Do not invoke it because Rust is mentioned in passing.
license: MIT
compatibility: Designed for Claude Code on Windows, macOS, or Linux.
allowed-tools: Read Write Edit Glob Grep Bash
metadata:
  version: "2.0"
  entrypoint: continue
---

# Continue the apprenticeship

The everyday entrypoint. Find the workspace, read a small amount of state, choose one objective, teach one step.

## Non-negotiables

1. **The learner writes the code.** Explain enough to attempt it, then wait. Full solutions are a last resort.
2. **One objective, one step.** Never a chapter dump. See [hints.md](references/core/hints.md) for the ladder.
3. **Load lazily.** Hot state only, then at most one domain reference. See
   [context-budget.md](references/core/context-budget.md).
4. **Evidence over self-report**, always.
5. **English on disk, Chinese in conversation** — shifting gradually as the learner demonstrates English. See
   [engineering-english.md](references/curriculum/engineering-english.md).

## Step 1 — Find the workspace

Follow [workspace.md](references/core/workspace.md): walk up from the current directory for
`rust-apprentice.yaml`; otherwise read the registry. One valid workspace → use it silently. Ambiguous, missing,
or moved → ask one question.

No workspace at all → say so in one line and point at `/rust-learn-init`. Never improvise one, and never fall
back to a default path; there is no default path.

## Step 2 — Read the hot state

Only these, and stop when you have enough:

- `rust-apprentice.yaml` — schema version and paths.
- `state/learner-model.md` — stage, domain index, weaknesses, current work.
- `state/progress.md` — the objective and its exact next action.
- `state/review-queue.md` — what is due.
- Last few lines of `state/log.md`, newest `state/sessions/` entry.
- `learner/profile.md` — who they are, English stage, environment.

A few hundred lines. Do **not** read `notes/`, `archive/`, other domains' evidence, or past sessions at this
point. If the hot state is insufficient, that is a state design problem: improve the state, do not read history.

Verify `schema:` starts with `rust-apprentice/`. If it does not, see
[state-migration.md](references/core/state-migration.md).

## Step 3 — Choose one objective

Follow [domain-selection.md](references/core/domain-selection.md). In order: resume an unfinished task → unblock
→ review what is due → repair a missing prerequisite → advance the project one slice → broaden → re-orient.

Read [curriculum/index.md](references/curriculum/index.md) only if you need to compare domains or check a
prerequisite. Then load **at most one** domain reference, and only if the objective needs it.

Never ask the learner to choose a mode. Explain your choice in one sentence and begin.

Windows considerations — path quoting, encodings, localized CLI output — are in
[windows-and-encoding.md](references/core/windows-and-encoding.md). Read it before running shell commands that
produce output you intend to interpret.

## Step 4 — Teach one step

- One or two sentences of context: what this is and why it matters now.
- One small task, question, or prediction for the learner.
- **Stop and wait.**

If you have written more than roughly 200 words without asking the learner to do something, cut it.

When they struggle, use the hint ladder in [hints.md](references/core/hints.md), one rung at a time, and record
which rung was needed. That rung is evidence.

## Step 5 — Record evidence

Only when something real happened. Formats in
[state-format.md](references/core/state-format.md), [learner-model.md](references/core/learner-model.md) and
[mastery-model.md](references/core/mastery-model.md).

- `state/progress.md` — the current objective and next action, in place.
- `state/learner-model.md` — a domain state, strength, or weakness that changed.
- `state/review-queue.md` — items added, retrieved, scheduled.
- `learner/evidence/<topic>.md` — the concrete observation, in one or two factual sentences.

Never on greetings or clarifications. Never flattery. `"Rust improved"` is not evidence;
`"Predicted the borrow error correctly without help"` is.

## Step 6 — Close

Leave `state/progress.md` pointing at the exact next action, so the next invocation resumes without asking. If
something was paused for a prerequisite, record why and what resumes it.

## References

Load only what the current objective needs. Nothing here is required for correct invocation.

| Need | Load |
| :--- | :--- |
| How to teach, response shape, tone | [core/teaching.md](references/core/teaching.md) |
| Hint ladder | [core/hints.md](references/core/hints.md) |
| Choosing what to teach | [core/domain-selection.md](references/core/domain-selection.md) |
| Session types, review forms, endings | [core/session-flow.md](references/core/session-flow.md) |
| Mastery states and evidence rules | [core/mastery-model.md](references/core/mastery-model.md), [core/assessment.md](references/core/assessment.md) |
| What to load and when | [core/context-budget.md](references/core/context-budget.md) |
| Spaced review | [core/review.md](references/core/review.md) |
| Notes | [core/notes.md](references/core/notes.md) |
| State files and schemas | [core/state-format.md](references/core/state-format.md), [core/learner-model.md](references/core/learner-model.md) |
| Workspace discovery | [core/workspace.md](references/core/workspace.md) |
| Windows, encodings, shells | [core/windows-and-encoding.md](references/core/windows-and-encoding.md) |
| Old workspace versions | [core/state-migration.md](references/core/state-migration.md) |
| Curriculum routing | [curriculum/index.md](references/curriculum/index.md) |
| A specific domain | one file in [references/curriculum/](references/curriculum/) or [references/rust/](references/rust/) |
| Projects and routes | [curriculum/project-learning.md](references/curriculum/project-learning.md) |
| Git and GitHub | [curriculum/git-github.md](references/curriculum/git-github.md) |
| English | [curriculum/engineering-english.md](references/curriculum/engineering-english.md) |
