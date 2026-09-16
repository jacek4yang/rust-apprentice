# State migration

Workspaces outlive releases of these skills. This file covers recognising an old workspace and moving it forward
without losing a learner's history.

## The version marker

`rust-apprentice.yaml` carries `schema:`. The current version is `rust-apprentice/1`.

A workspace written by an earlier release of these skills has either no `schema:` line, or a different value. On
every invocation, check it:

- `schema: rust-apprentice/1` → current, proceed.
- Missing or different → migrate before doing anything else.
- Marker present but unparsable → do not silently rewrite it. Show the learner the problem and offer to repair.

## Current version, `rust-apprentice/1`

```yaml
schema: rust-apprentice/1
workspace: rust-apprentice
name: <label>
created: <date>
state: state/progress.md
learner_model: state/learner-model.md
review_queue: state/review-queue.md
```

Paths are workspace-relative. `learner_model:` is newer than the original format; if it is absent but
`state/learner-model.md` exists, the marker predates it and should be updated.

## Migrating from the two-skill layout

An older workspace has no `state/learner-model.md`, and its `state/progress.md` carries a `Mastery` table of
individual concepts. To migrate:

1. **Back up first.** Copy the whole workspace to `<workspace>-backup-<date>` before changing anything. This is
   not optional, and say so to the learner.
2. **Build the learner model.** Read the old `Mastery` table and the files in `learner/evidence/`. Group the
   concepts into domains from [curriculum/index.md](../curriculum/index.md), and assign each domain a state using
   [mastery-model.md](mastery-model.md). Where the old table is ambiguous, choose the *lower* state — an
   over-confident index is worse than a cautious one.
3. **Write `state/learner-model.md`** using [learner-model.md](learner-model.md).
4. **Trim `state/progress.md`.** Keep the objective, next action, blockers and paused work. Remove the mastery
   table, since it now lives in the learner model.
5. **Update the marker** to add `learner_model: state/learner-model.md` and bump `schema` if it is absent.
6. **Append one line to `state/log.md`** recording the migration, with the date.
7. **Tell the learner** in two sentences: what changed and that their history was preserved. Do not make it a
   ceremony.

Evidence files are **never** rewritten during migration. They are the record; the new index is derived from them.

## Principles

- **Migrate conservatively.** Move forward one version at a time. Do not invent a future state.
- **Back up before any non-trivial change.** A migration that loses evidence is worse than an un-migrated
  workspace.
- **Never discard a workspace because one file is damaged.** Reconstruct the minimum needed from the marker, the
  state files, the project directory and Git history. A missing `review-queue.md` is a regenerable file, not a
  reason to start over.
- **Do say when you migrate.** Silent changes to a learner's own records are unsettling.
- **Keep migrations rare and simple.** If a migration needs more than a page of instructions, the state design is
  too clever. Prefer adding a file and deriving it over restructuring what exists.

## Recovering a damaged workspace

| Symptom | Recovery |
| :--- | :--- |
| Marker missing, workspace present | Ask before writing it. The learner may have pointed at the wrong folder. |
| Marker unparsable | Show the file, offer to repair it from the paths that do exist. |
| `state/` missing entirely | Rebuild from `learner/evidence/` and ask the learner what they were last working on. |
| One state file missing | Regenerate from the others; note it in `log.md`. |
| Registry points at a path that no longer exists | Do not use it. Ask whether the workspace moved. |
| Files edited by hand into inconsistency | Prefer the evidence files over the summaries, since evidence is the source of truth. |

## What never happens

- A migration that deletes evidence.
- A migration that rewrites `notes/` prose.
- A silent version bump.
- Reinitialising a workspace that already exists. `/rust-learn-init` completes an interrupted initialization; it
  does not start a second one.
