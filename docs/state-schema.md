# State schema

The complete on-disk state, in one page. The operational versions live in
[`workspace.md`](../skills/rust-learn-continue/references/workspace.md) and
[`state-format.md`](../skills/rust-learn-continue/references/state-format.md); this file is the summary you read
when changing the format.

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
review_queue: state/review-queue.md
```

`learner`, `state`, and `review_queue` are workspace-relative. The marker is the discovery contract: it must stay
at the workspace root with these field names.

### Current state

| File | Required keys |
| :--- | :--- |
| `state/progress.md` | `updated`, `stage`, `phase`, `topic`, `task`, `status`, `Next action`, `Mastery` table, `Active weaknesses`, `Blockers` |
| `state/review-queue.md` | `updated`, `Due` table, `Scheduled` table, `Retired` list |
| `state/log.md` | dated single lines |
| `state/sessions/<YYYY-MM-DD>.md` | `focus`, `did`, `evidence`, `left`, `next` |

`status` is one of `in-progress`, `blocked`, `awaiting-learner`, `done`.
`stage` is one of `beginner`, `developing`, `intermediate`, `advanced`.

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

Definitions and the evidence required for each transition are in
[`assessment.md`](../skills/rust-learn-continue/references/assessment.md).

## Review intervals

| Last result | Next due |
| :--- | :--- |
| fail | 1–2 days |
| partial | 3 days |
| pass, 1st–2nd attempt | 7 days |
| pass, 3rd attempt | 21 days |
| pass after a ≥ 1 month gap | retire |

## English stages

`A` Chinese conversation with English code → `B` Chinese with English artefacts → `C` mixed → `D` mostly English →
`E` English. Advancement requires consistent evidence across at least three sessions and is recorded in
`learner/profile.md` with the date. See
[`english.md`](../skills/rust-learn-continue/references/english.md).

## Invariants

These are what the checks in `tests/repo-checks.mjs` and the model's instructions both protect:

1. Every file the mentor writes to disk is English, in every workspace, in every session.
2. `state/` stays small enough to read in one pass, forever. Anything that would grow without bound goes to
   `learner/evidence/` or `archive/`.
3. No percentage, score, grade, or decimal point is ever recorded about the learner.
4. Claims and observations are never merged in `learner/profile.md`.
5. The registry is advisory; the marker file in the workspace is authoritative. A workspace with a valid marker is
   usable even if the registry is missing or corrupt.
6. No file in the workspace is required for the workspace to be *found* except `rust-apprentice.yaml`.

## Migration

The `schema:` field is `rust-apprentice/1`. If the format ever changes incompatibly:

- Bump the suffix.
- `/rust-learn-continue` reads the version from the marker and migrates forward in place, telling the learner what
  changed.
- Never rewrite a workspace without saying so, and never migrate by discarding evidence.
