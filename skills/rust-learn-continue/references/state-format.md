# State format

Every learner-written file the mentor maintains. Keep these schemas; do not restructure state in passing.

Rule of thumb: if a file is read every session, its size must be bounded. If it grows without bound, it is not a
current-state file and belongs in `learner/evidence/` or `archive/`.

## `state/progress.md`

The single most important file. Read first, written whenever current work changes. Keep it under ~80 lines.

```markdown
# Progress

updated: 2026-09-16
stage: beginner | developing | intermediate | advanced
phase: fundamentals | applied | project | systems

## Current

topic: Result and the ? operator
task: Implement `parse_record` so it returns `Result<Record, ParseError>`
started: 2026-09-15
status: in-progress | blocked | awaiting-learner | done
blocked_on: (empty, or one line)

## Next action

Rewrite `parse_record` to propagate errors with `?` instead of matching every arm by hand.
Then we look at mapping the error type with `map_err`.

## Mastery

| Concept | State | Last evidence |
| :--- | :--- | :--- |
| ownership and moves | independently-demonstrated | 2026-09-10 |
| borrowing rules | practiced | 2026-09-14 |
| Result and ? | guided | 2026-09-15 |
| iterators | introduced | 2026-09-07 |

## Active weaknesses

- Confuses `Arc` (shared ownership) with `Mutex` (mutual exclusion). Seen twice.
- Reaches for `.clone()` to silence borrow errors instead of restructuring.

## Blockers

- (empty)

## Recently retired

- `match` exhaustiveness — retrieved correctly three times, 2026-08-29.
```

Notes:

- `Mastery` holds only concepts that are currently being worked on or recently demonstrated. Everything else
  lives in evidence. Aim for 8–20 rows; if it exceeds 25, retire rows.
- States are exactly those in [assessment.md](assessment.md). No numbers.
- `Next action` is what the next session does first. It must be concrete enough to start without thinking.
- When a topic is finished, move its rows out to `learner/evidence/` and record a one-line summary in `log.md`.

## `state/review-queue.md`

Active recall scheduling. Bounded: an item leaves after three successful retrievals across separate sessions.

```markdown
# Review queue

updated: 2026-09-16

## Due

| Concept | Due | Attempts | Last result |
| :--- | :--- | :--- | :--- |
| borrowing rules | 2026-09-16 | 2 | pass |
| `String` vs `&str` | 2026-09-16 | 1 | partial |
| module visibility | 2026-09-14 | 1 | fail |

## Scheduled

| Concept | Due | Attempts | Last result |
| :--- | :--- | :--- | :--- |
| ownership and moves | 2026-09-22 | 3 | pass |
| pattern matching | 2026-09-19 | 1 | pass |

## Retired

- `let`/`mut` basics — 3 clean retrievals, retired 2026-09-02.
```

Scheduling rules:

| Result | Next interval |
| :--- | :--- |
| fail | 1–2 days, and re-teach if it fails twice |
| partial | 3 days |
| pass, first or second attempt | 7 days |
| pass, third attempt or clean after a long gap | 21 days |
| clean pass after a month | retire, note it in evidence |

- Anything failing twice in a row is an active weakness, not a review item. Move it to `progress.md`.
- Keep the queue under ~20 items. A queue nobody finishes is a queue that gets ignored; if it is longer, retire
  the least relevant items and say so.
- Retrieval is active recall, never rereading. Forms are in [review.md](review.md).

## `state/log.md`

One line per meaningful event. Rolling; trim as described in [workspace.md](workspace.md).

```markdown
# Log

- 2026-09-16 — Added `Result`/`?` to the review queue after a partial explanation in session.
- 2026-09-16 — Session: implemented `parse_record` error propagation with a rung-2 hint.
- 2026-09-14 — Project `logscan` created with `cargo new`; learner chose the name.
- 2026-09-12 — First commit by the learner, message written unaided.
```

Rules: date, then a fact. No evaluation, no summary paragraphs. If a line needs more than ~120 characters, the
detail belongs in evidence.

## `state/sessions/<date>.md`

Written at the end of a session that produced something. Five to fifteen lines.

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
[../rust-learn-init/assets/profile.template.md](../../rust-learn-init/assets/profile.template.md).

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
[../rust-learn-init/references/curriculum-map.md](../../rust-learn-init/references/curriculum-map.md) for the
coverage check and [project-learning.md](project-learning.md) for the project progression.

## Update etiquette

- Update only on real evidence: a task solved, a task failed, a hint rung recorded, a misconception discovered, a
  project milestone, a Git operation performed, an English artefact written.
- Not on: greetings, questions answered by you, clarifications, re-explanations.
- Never regenerate a whole file when one row changed. Edit in place.
- If you are unsure whether something is evidence, it is not. Leave it out.
