# State migration

Workspaces outlive releases of these skills. This file covers recognising an old workspace and moving it forward
without losing a learner's history.

## The version marker

`rust-apprentice.yaml` carries `schema:`. The current version is `rust-apprentice/1`.

Classify before reading pointed-to files or writing anything; a schema prefix is not a version check:

- Exact `rust-apprentice/1`, required fields present, safe paths resolving to distinct files → current.
- Exact `/1` with missing fields/files → incomplete; recover only missing material from existing evidence.
- Missing schema with `workspace: rust-apprentice` and a safe `state` path → recognized legacy layout;
  inspect the old progress format before using the migration below.
- Any other schema, including future `rust-apprentice/2` → unsupported. Stop writes, explain that a compatible
  release is needed; never downgrade it or assume an unknown older version can be migrated.
- Unparsable YAML, wrong workspace identity, unsafe paths, or conflicting field types → damaged. Explain the
  specific issue and offer repair; never silently initialize over it.

Status inspection is read-only: report an incomplete/legacy/damaged workspace and offer to continue with
init or continue for recovery. It never performs migration while reporting status.

## Current version, `rust-apprentice/1`

```yaml
schema: rust-apprentice/1
workspace: rust-apprentice
name: <label>
created: <date>
learner: learner/profile.md
state: state/progress.md
learner_model: state/learner-model.md
review_queue: state/review-queue.md
```

Paths are workspace-relative. `learner_model:` is newer than the original format; if it is absent but
`state/learner-model.md` exists, the marker predates it and should be updated.

## Migrating from the two-skill layout

An older workspace has no `state/learner-model.md`, and its `state/progress.md` carries a `Mastery` table of
individual concepts. To migrate:

1. **Back up first.** Copy the workspace to a new sibling `<workspace>-backup-<date>-<unique-id>`, without
   following symlinks outside the workspace. Verify the backup before modifying files, never reuse a backup
   name, and tell the learner. Record the backup path and pending steps in `state/migration.md`.
2. **Build the learner model.** Read the old `Mastery` table and the files in `learner/evidence/`. Group the
   concepts into domains from [curriculum/index.md](../curriculum/index.md), and assign each domain a state using
   [mastery-model.md](mastery-model.md). Where the old table is ambiguous, choose the *lower* state — an
   over-confident index is worse than a cautious one.
3. **Write `state/learner-model.md`** using [learner-model.md](learner-model.md).
4. **Trim `state/progress.md`.** Keep the objective, next action, blockers and paused work. Remove the mastery
   table, since it now lives in the learner model.
5. **Update the marker last**, after all target files validate, preserving custom relative paths. Add missing
   pointers and set `schema: rust-apprentice/1` only for the recognized legacy layout.
6. **Append one line to `state/log.md`** recording the migration, with the date.
7. **Tell the learner** in two sentences: what changed and that their history was preserved. Do not make it a
   ceremony.

Evidence files are **never** rewritten during migration. They are the record; the new index is derived from them.
On interruption, read `state/migration.md`, verify completed outputs and finish only pending steps. Never replay
evidence, duplicate the log entry, or overwrite a valid initialized profile. Mark the migration record complete
and archive it after verification. A second invocation of a complete workspace is a no-op.

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
