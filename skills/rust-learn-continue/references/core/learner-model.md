# Learner model

The compact index that answers "what does this learner need right now?" without reading history. Read on every
`/rust-learn-continue` invocation and shown, summarised, by `/rust-learn-status`.

**Bounded by design.** This file must stay small enough to read in one pass for years. Domain summaries only —
no concept lists, no dates beyond `updated`, no evidence. Detail belongs in `learner/evidence/<topic>.md`.

## Format

```yaml
schema: rust-apprentice/1
updated: 2026-09-16

# Where the learner is overall.
stage: C                      # A..G, see mastery-model.md
stage_since: 2026-08-20
independence: mostly-independent   # how much help they normally need
english_stage: B              # A..E, see curriculum/engineering-english.md
git_level: practiced          # git and GitHub progression

# The active work. Mirrors state/progress.md; kept here so this file alone
# is enough to orient.
current:
  project: logscan
  domain: networking
  objective: make the HTTP client handle timeouts
  next_action: write the failing test for a request that exceeds the timeout

# One entry per domain. Only domains that have been touched appear.
# State values are exactly those in mastery-model.md.
domains:
  rust-language:
    state: mostly-independent
    strengths: [pattern matching, iterators, traits]
  ownership-memory:
    state: mostly-independent
    strengths: [moves, borrows]
    weak: [lifetime elision when returning references from methods]
  data-structures-algorithms:
    state: guided
    active: [hash map internals]
  networking:
    state: developing
    strengths: [TCP connection lifecycle, HTTP request and response semantics]
    active: [async socket programming]
    weak: [connection lifecycle under failure]
    next_review: [DNS resolution]
  testing:
    state: practiced
    strengths: [integration tests, table-driven tests]
  git-github:
    state: practiced
    active: [pull request workflow]
  engineering-english:
    state: guided
    active: [commit messages, code comments]

# At most five. See mastery-model.md.
weaknesses:
  - Confuses Arc (shared ownership) with Mutex (mutual exclusion). Seen twice.
  - Reaches for .clone() to silence borrow errors instead of restructuring.
  - Does not check exit codes before parsing command output.

# Anything in flight that is not a weakness.
blockers:
  - Waiting on GitHub account verification before the first PR.

# What the learner said they want, so direction is never lost.
goals:
  - Build a CLI that indexes and searches their own log files.
  - Contribute one pull request to a real Rust project.
```

## Rules

- **Domain states use the exact vocabulary** from [mastery-model.md](mastery-model.md). No numbers, ever.
- **At most five weaknesses.** A sixth retires the least relevant one to evidence.
- **At most three strengths per domain.** If a domain has more, it is strong; say so with the state and move on.
- **`next_review` holds at most three items** per domain. Full scheduling lives in `state/review-queue.md`.
- **Do not add a domain before it is touched.** Nineteen domains with `unseen` states is noise; absent is clearer.
- **Update in place.** Change the one line that changed. Never regenerate the file.
- **`updated` changes only when content changes**, not on every read.

## Reading it

For an ordinary session, this file plus `state/progress.md` and `state/review-queue.md` is enough to choose an
objective. If you find yourself wanting the full domain list, the learner's history, or their notes to make the
choice, the file is incomplete — fix the file, not the habit.

## Writing it

Update after meaningful evidence:

- a domain state changes
- a strength is newly demonstrated, or a weakness newly observed
- the current project or objective changes
- the stage changes (rare, and requires real evidence)
- the English or Git stage changes

Do not update on greetings, clarifications, or re-explanations.

## Relationship to other state

| File | Holds | Read |
| :--- | :--- | :--- |
| `state/learner-model.md` | Domain index, stage, weaknesses | Every session |
| `state/progress.md` | The current task and its exact next action | Every session |
| `state/review-queue.md` | Retrieval scheduling | Every session |
| `state/log.md` | One line per meaningful event | Last few lines |
| `learner/profile.md` | Who they are, claims, environment, interests | Every session |
| `learner/goals.md` | Durable goals in the learner's words | Occasionally |
| `learner/evidence/*.md` | The actual observations | On demand |
| `archive/*` | History | Rarely |

This file is a **summary of** the evidence, never a replacement for it. When a summary is challenged or looks
stale, go to the evidence.
