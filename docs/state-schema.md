# State schema

The complete on-disk state, in one page. The operational versions live in
[`core/workspace.md`](../skills/rust-learn-continue/references/core/workspace.md),
[`core/state-format.md`](../skills/rust-learn-continue/references/core/state-format.md) and
[`core/learner-model.md`](../skills/rust-learn-continue/references/core/learner-model.md); this file is the summary
you read when changing the format.

Authority: workspace.md owns identity/discovery/safe marker paths; state-migration.md owns version handling;
mastery-model.md owns state vocabulary; learner-model.md and state-format.md own file fields; review.md owns
scheduling. This page summarizes those contracts, not an alternative specification.

State is tiered by read frequency: **hot** (every session, bounded forever), **warm** (on demand), **cold**
(rarely). The tiering is the mechanism that keeps a years-old workspace cheap to start; see
[`core/context-budget.md`](../skills/rust-learn-continue/references/core/context-budget.md).

## Files

### Per-user registry (outside the workspace)

`<state dir>/workspaces.yaml`, where `<state dir>` is `$RUST_APPRENTICE_STATE_DIR`, else `$CLAUDE_SKILLS_STATE_DIR`,
else the platform default (Windows `%APPDATA%\rust-apprentice\`, macOS `~/Library/Application Support/rust-apprentice/`,
Linux `$XDG_STATE_HOME/rust-apprentice/` or `~/.local/state/rust-apprentice/`).

```yaml
schema: rust-apprentice/1
workspaces:
  - path: "<absolute path>"
    name: "<learner-visible label>"
    last_active: 2026-09-16      # date, updated when a session produces evidence
```

### Workspace marker

`<workspace>/rust-apprentice.yaml`:

```yaml
schema: rust-apprentice/1
workspace: rust-apprentice
name: "<workspace label>"
created: 2026-09-16
learner: learner/profile.md
state: state/progress.md
learner_model: state/learner-model.md
review_queue: state/review-queue.md
```

`learner`, `state`, `learner_model` and `review_queue` are workspace-relative. The marker is the discovery contract: it must stay
at the workspace root with these field names.

### Current state

| File | Required keys |
| :--- | :--- |
| `state/learner-model.md` | `schema`, `updated`, `stage`, `independence`, `english_stage`, `git_level`, `current`, `domains`, `weaknesses` (max 5), `blockers`, `goals` |
| `state/progress.md` | `updated`, `phase`, `project`, `domain`, `Objective`, `Next action`, `Blockers`, `Paused` |
| `state/review-queue.md` | `updated`, `Due` table, `Scheduled` table, `Retired` list |
| `state/log.md` | dated single lines |
| `state/sessions/<YYYY-MM-DD>.md` | `focus`, `did`, `evidence`, `left`, `next` |

`status` is one of `in-progress`, `blocked`, `awaiting-learner`, `done`.
`stage` is one of `A`..`G`, defined in [`core/mastery-model.md`](../skills/rust-learn-continue/references/core/mastery-model.md).

### Learner

| File | Required keys |
| :--- | :--- |
| `learner/profile.md` | `updated`, `conversation language`, `english stage`, environment, `Claims`, `Observations`, `Provisional starting point` |
| `learner/goals.md` | one section per goal: outcome, why, status |
| `learner/evidence/<topic>.md` | dated factual entries, append-only |

### Plans and knowledge

`plans/roadmap.md`, `plans/<goal-slug>.md`, `notes/<topic>.md`, `projects/<name>/`, `exercises/<name>/`,
`reviews/<date>.md`, `archive/` — free-form Markdown with no schema beyond being English and being useful to the
learner.

## Mastery states

The complete vocabulary. Nothing else is valid, and there are no numbers anywhere in the system.

`unseen` → `introduced` → `guided` → `practiced` → `mostly-independent` → `independently-demonstrated` →
`transferable`, plus `review-needed` as a demotion.

Domains use this vocabulary in `state/learner-model.md`. Concept-level evidence uses it in
`learner/evidence/<topic>.md`.

Definitions and the evidence required for each transition are in
[`core/mastery-model.md`](../skills/rust-learn-continue/references/core/mastery-model.md) and
[`core/assessment.md`](../skills/rust-learn-continue/references/core/assessment.md).

## Review intervals

| Last result | Next due |
| :--- | :--- |
| fail | 1 day; reset clean streak |
| partial | 3 days; reset clean streak |
| pass, clean streak 1–2 in distinct sessions | 7 days |
| pass, clean streak 3+ | 21 days |
| clean pass in a later session after a ≥ 30 day gap | retire |

`Attempts` is total observed retrievals, not successful streaks. Queue rows also carry `Clean streak`,
`Last attempted` and `Last session`; same-session retries do not advance the streak. See core/review.md.

## English stages

`A` Chinese conversation with English code → `B` Chinese with English artefacts → `C` mixed → `D` mostly English →
`E` English. Advancement requires consistent evidence across at least three sessions and is recorded in
`learner/profile.md` with the date. See
[`curriculum/engineering-english.md`](../skills/rust-learn-continue/references/curriculum/engineering-english.md).

## Invariants

These are what the checks in `tests/repo-checks.mjs` and the model's instructions both protect:

1. Every file the mentor writes to disk is English, in every workspace, in every session.
2. The hot tier stays small enough to read in one pass, forever. Anything that would grow without bound goes to
   `learner/evidence/` or `archive/`.
3. No percentage, score, grade, or decimal point is ever recorded about the learner.
4. Claims and observations are never merged in `learner/profile.md`.
5. The registry is advisory; the marker file in the workspace is authoritative. A workspace with a valid marker is
   usable even if the registry is missing or corrupt.
6. No file in the workspace is required for the workspace to be *found* except `rust-apprentice.yaml`.
7. `notes/` is never loaded automatically. It is the learner's knowledge base, read only on a specific need.
8. Domains are reported, not concepts. Nineteen lines at most, in any summary.

## Migration

The `schema:` field is `rust-apprentice/1`. If the format ever changes incompatibly:

- Bump the suffix.
- `/rust-learn-continue` classifies the exact version and required fields before following marker paths. Only
  recognized legacy layouts migrate; unknown versions, including future versions, are never rewritten.
- Same-version missing fields/files require recovery. Status is read-only and reports the need for recovery.
- Preserve a unique verified backup and an interruption record; update the marker last. Repeating recovery
  must not duplicate evidence or replace valid files.
- Never rewrite a workspace without saying so, and never migrate by discarding evidence.

The full procedure, including recovering a half-damaged workspace, is in
[`core/state-migration.md`](../skills/rust-learn-continue/references/core/state-migration.md).
