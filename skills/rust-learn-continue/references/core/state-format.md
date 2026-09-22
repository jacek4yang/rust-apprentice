# State format

Every learner-written file the mentor maintains. Keep these schemas; do not restructure state in passing.

Rule of thumb: if a file is read every session, its size must be bounded. If it grows without bound, it is not a
current-state file and belongs in `learner/evidence/` or `archive/`.

State is split into a hot tier (read every session, bounded forever), a warm tier (read on demand), and cold
history. [context-budget.md](context-budget.md) explains the loading discipline; this file is the schemas.

| File | Tier | Read |
| :--- | :--- | :--- |
| `rust-apprentice.yaml` | hot | every session |
| `state/learner-model.md` | hot | every session |
| `state/progress.md` | hot | every session |
| `state/review-queue.md` | hot | every session |
| `state/log.md` | hot | last few lines |
| `state/sessions/<date>.md` | warm | newest one or two |
| `learner/profile.md` | warm | every session |
| `learner/goals.md` | warm | occasionally |
| `learner/evidence/<topic>.md` | warm | on demand |
| `plans/*.md`, `notes/*.md` | warm | on demand |
| `archive/*` | cold | rarely |

## `state/progress.md`

The work in flight: the current objective, its exact next action, blockers, and anything paused. Keep it under
~60 lines. Domain-level mastery lives in [learner-model.md](learner-model.md), not here.

```markdown
# Progress

updated: 2026-09-16
phase: applied
project: logscan
domain: rust-language

## Objective

Implement `parse_record` so it returns `Result<Record, ParseError>` instead of panicking.
started: 2026-09-15
status: in-progress

## Next action

Rewrite `parse_record` to propagate errors with `?` instead of matching every arm by hand.
Then discuss mapping the error type with `map_err`.

## Blockers

- (empty)

## Paused

- async downloader — paused 2026-09-12 to repair `Send`/`Sync` understanding. Resumes when
  concurrency reaches `practiced`.
```

Notes:

- `phase` is one of `fundamentals`, `applied`, `project`, `systems`.
- `project` is a name or `(none yet)`; `domain` is a curriculum ID (including Git and English).
  This file owns current work. The learner model's `current` mirrors these fields and the objective/next action.
- `status` is one of `in-progress`, `blocked`, `awaiting-learner`, `done`.
- `Next action` must be concrete enough to start without thinking. It is the most important line in the
  workspace.
- Domain mastery is **not** recorded here. Two copies will drift.
- `Paused` exists so an advanced objective interrupted for a prerequisite can be resumed rather than quietly
  abandoned. Record what resumes it.
- When an objective finishes: move the detail to `learner/evidence/`, update the domain in the learner model, and
  append one line to `log.md`.

## `state/learner-model.md`

The compact index: stage, domain mastery, weaknesses, current work. Schema and rules are in
[learner-model.md](learner-model.md). Read every session; it is what makes loading the full curriculum
unnecessary.

## `state/review-queue.md`

Active recall scheduling. [review.md](review.md) is the single authority for spacing and retirement.

```markdown
# Review queue

updated: 2026-09-16

## Due

| Concept | Due | Attempts | Last result | Clean streak | Last attempted | Last session |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| borrowing rules | 2026-09-16 | 2 | pass | 2 | 2026-09-09 | 2026-09-09-a |
| `String` vs `&str` | 2026-09-16 | 1 | partial | 0 | 2026-09-13 | 2026-09-13-a |
| module visibility | 2026-09-14 | 1 | fail | 0 | 2026-09-13 | 2026-09-13-a |

## Scheduled

| Concept | Due | Attempts | Last result | Clean streak | Last attempted | Last session |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ownership and moves | 2026-10-06 | 3 | pass | 3 | 2026-09-15 | 2026-09-15-a |
| pattern matching | 2026-09-19 | 1 | pass | 1 | 2026-09-12 | 2026-09-12-a |

## Retired

- `let`/`mut` basics — clean recall after a 30-day gap, retired 2026-09-02.
```

Use the exact rules in [review.md](review.md); do not derive successful streaks from `Attempts`.

- Keep at most 20 active items. Defer low-priority overflow to a linked cold backlog, with its due date;
  deferring is not successful retirement. Review that backlog only when capacity becomes available.
- Keep at most five recent retirements and archive older ones without losing records.
- Retrieval is active recall, never rereading. Forms are in [review.md](review.md).

## `state/log.md`

One line per meaningful event. Rolling; trim as described in [workspace.md](workspace.md).

```markdown
# Log

- 2026-09-12 — First commit by the learner, message written unaided.
- 2026-09-14 — Project `logscan` created with `cargo new`; learner chose the name.
- 2026-09-16 — Session: implemented `parse_record` error propagation with a rung-2 hint.
- 2026-09-16 — Added `Result`/`?` to the review queue after a partial explanation in session.
```

Rules: date, then a fact. No evaluation, no summary paragraphs. If a line needs more than ~120 characters, the
detail belongs in evidence.
Append in chronological order, oldest first, newest last. Read only the last 20 lines during ordinary startup.

## `state/sessions/<date>.md`

Written at the end of a session that produced something. Five to fifteen lines.
Use `<date>-<unique-id>.md` when a date already exists; never replace an earlier session that day.

```markdown
# 2026-09-16

focus: error propagation in `parse_record`
did: learner rewrote the match chain using `?`; needed rung 2 (naming the `From` conversion)
evidence: `Result` moved `guided` -> `practiced`; wrote a clean commit message unaided
left: `map_err` on the custom error type — signature is in `notes/error-handling.md`
next: finish `map_err`, then add a failing test for an invalid record
```

## `learner/profile.md`

Who the mentor is teaching. Read every session, updated rarely. Template in
[../rust-learn-init/assets/profile.template.md](../../../rust-learn-init/assets/profile.template.md).

Key fields: language of conversation, English level, environment, and the claims/observation split from
initialization. Claims stay labelled as claims until evidence replaces them.

## `learner/goals.md`

What the learner wants. Concrete outcomes, not topics. "Write a CLI tool that parses pcap files" beats "learn
networking". Each goal gets a route file in `plans/` when work begins on it.

## `learner/evidence/<topic>.md`

Append-only, one topic per file. Dated, factual, one or two sentences per entry. Format and examples are in
[assessment.md](assessment.md). This is where nuance lives; it is not read at the start of a session.

## `plans/roadmap.md`

The long-term shape. Updated monthly, not per session. See
[../rust-learn-init/references/curriculum-map.md](../../../rust-learn-init/references/curriculum-map.md) for the
coverage check and [project-learning.md](../curriculum/project-learning.md) for the project progression.

## Update etiquette

- Update only on real evidence: a task solved, a task failed, a hint rung recorded, a misconception discovered, a
  project milestone, a Git operation performed, an English artefact written.
- Not on: greetings, questions answered by you, clarifications, re-explanations.
- Never regenerate a whole file when one row changed. Edit in place.
- If you are unsure whether something is evidence, it is not. Leave it out.

## Interrupted updates

For a meaningful observation, assign a stable event ID and keep a short pending record in `state/pending.md`
with that ID, the specific evidence file, and remaining updates. Append factual evidence once, then update
progress (current-work authority), the learner-model mirror, and any review item. Finish the event by appending
its ID to the log and session summary, updating registry activity, and clearing the pending record.

On resume, inspect this one pending record and its pointed-to evidence only. Complete missing updates using
the same ID; do not count a retrieval twice or invent new observations. If no pending record exists but
progress and the learner model disagree, repair only the mirror from progress. If capability evidence is
unclear, leave the capability unchanged and ask a focused probe. Never scan all history to reconstruct a guess.

Status does not perform these writes; report a pending update and hand it to continue when requested.
