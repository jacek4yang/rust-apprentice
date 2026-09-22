# Workspace: layout, discovery, and state

Authoritative for discovery and paths across all three skills. State shape belongs to
[state-format.md](state-format.md), vocabulary to [mastery-model.md](mastery-model.md), version handling to
[state-migration.md](state-migration.md), and review scheduling to [review.md](review.md).

## Principles

- The workspace is plain files in a plain directory. No database, no daemon, no index to rebuild.
- Everything is readable and editable by hand, in any editor, on any OS.
- The workspace is independent of the installed skills. Copying the workspace folder to another machine is the
  supported way to move it.
- State is split by how often it is read. Things read every session stay tiny; things read rarely can grow.

## Layout

Created by `/rust-learn-init` at a path the learner chooses. Grown lazily after that — no empty scaffolding.

```
<workspace>/
├── rust-apprentice.yaml      # marker file: identity, version, pointer to current state
├── README.md                 # what this folder is, written for the learner
├── learner/
│   ├── profile.md            # who they are, claims, English level, environment
│   ├── goals.md              # what they want to build and be able to do
│   └── evidence/<topic>.md   # dated factual observations, per topic
├── plans/
│   ├── roadmap.md            # long-term topic coverage and phase
│   └── <goal-slug>.md        # a route from current ability to a specific goal
├── state/
│   ├── learner-model.md      # domain index: the file that makes the curriculum loadable lazily
│   ├── progress.md           # the current objective and its exact next action
│   ├── review-queue.md       # what is due for retrieval, and when
│   ├── log.md                # one line per meaningful event, rolling
│   └── sessions/<date>.md    # short per-session summary
├── notes/<topic>.md          # the learner's engineering handbook
├── exercises/<name>/         # small focused practice, standalone
├── projects/<name>/          # real Cargo projects
├── reviews/<date>.md         # periodic review summaries
└── archive/                  # rolled-up history
```

Directories are created on first use, with two exceptions: `state/` and `learner/`, which exist from
initialization because the first session writes to them.

## The marker file

`rust-apprentice.yaml` at the workspace root:

```yaml
schema: rust-apprentice/1
workspace: rust-apprentice
name: Jian's Rust apprenticeship
created: 2026-09-16
learner: learner/profile.md
state: state/progress.md
learner_model: state/learner-model.md
review_queue: state/review-queue.md
```

`learner:`, `state:`, `learner_model:` and `review_queue:` are distinct file paths relative to the workspace root.
Always follow these pointers, not hardcoded example paths. Reject absolute paths, drive-relative paths,
`..` components, streams and symlinks/junctions that escape the workspace, including existing parents of a
missing file. Validate identity, schema and paths before following them. Do not put learner content in the marker.

## Discovery

`/rust-learn-continue` resolves the workspace in this exact order. Stop at the first success.

### 1. Walk up from the current directory

From `cwd`, check the directory and each parent up to the filesystem root for a file named `rust-apprentice.yaml`.

- Found → stop searching and classify it using [state-migration.md](state-migration.md), including exact
  version and required-file checks. A legacy or incomplete marker must not fall through to another workspace.
- Found but malformed or unsupported → explain the issue; do not follow unsafe pointers or silently reinitialize.

This makes "open a terminal inside the workspace and type `/rust-learn-continue`" always work, and it is the only
mechanism that survives a machine change with no registry present.

### 2. Registry

A YAML file listing every workspace this machine knows about.

Location — first match wins:

1. `$RUST_APPRENTICE_STATE_DIR` if set.
2. `$CLAUDE_SKILLS_STATE_DIR` if set.
3. Platform default:

| Platform | Path |
| :--- | :--- |
| Windows | `%APPDATA%\rust-apprentice\` |
| macOS | `~/Library/Application Support/rust-apprentice/` |
| Linux | `$XDG_STATE_HOME/rust-apprentice/`, else `~/.local/state/rust-apprentice/` |

Contents of `<state dir>/workspaces.yaml`:

```yaml
schema: rust-apprentice/1
workspaces:
  - path: "<workspace-1>"
    name: Jian's Rust apprenticeship
    last_active: 2026-09-16
  - path: "<workspace-2>"
    name: Work laptop
    last_active: 2026-08-02
```

Rules:

- Paths are stored as the platform writes them. On Windows use forward slashes; both separators resolve.
- `last_active` is a date, updated at the end of a session in which real work happened.
- One entry per workspace. If the same path appears twice, keep the newer `last_active` and drop the other.
- If the registry file is hand-edited into invalid YAML, do not overwrite it. Show the learner the problem.

### 3. Resolve from the registry

- **Exactly one entry whose directory exists and contains a valid marker** → use it, silently.
- **Several valid entries** → use the most recent `last_active` **if** it is at least 14 days newer than the next
  one, or if the learner's message implies their usual machine. Otherwise ask.
- **A listed path no longer exists** → do not use it. Ask the learner whether the workspace moved; if it did, take
  the new path, verify the marker, and update the registry. If it is genuinely gone, offer to remove the entry.
- **No valid entries** → ask whether to reinitialize or to point at an existing workspace folder.

### 4. Ask, minimally

When you must ask, ask one question: where the workspace is. Offer the registry's known paths as the options, not a
free-form interrogation. Then write what you learned back to the registry so the next session does not ask.

Never invent a path, never default to a plausible-looking one, and never create a workspace from
`/rust-learn-continue`. Only `/rust-learn-init` creates workspaces.

## What lives where, and why

The split exists so a session ten years from now reads the same small amount of state as the first one.

| File | Read | Written | Typical size |
| :--- | :--- | :--- | :--- |
| `rust-apprentice.yaml` | every session | on move or reinit | 7 lines, fixed |
| `state/learner-model.md` | every session | when a domain state or weakness changes | 40–90 lines, bounded |
| `state/progress.md` | every session | when current work changes | 30–60 lines, bounded |
| `state/review-queue.md` | every session | when items are added, retrieved, failed | 20–60 lines, bounded |
| `state/log.md` | last ~20 lines | one line per meaningful event | rolling, trimmed |
| `state/sessions/<date>.md` | last 1–2 | at session end | 5–15 lines each |
| `learner/profile.md` | every session | when English level or environment changes | 40–80 lines |
| `learner/evidence/<topic>.md` | on demand | when evidence appears | grows, append-only |
| `plans/roadmap.md` | monthly, or when planning | when the plan changes | 60–150 lines |
| `notes/<topic>.md` | on demand | when a note is worth keeping | grows |
| `archive/` | rarely, on request | during a rollup | grows |

Append logs oldest first, newest last. When `state/log.md` exceeds 150 lines, append all but the newest 100
event lines to `archive/log-<year>.md`, verify the archive, then remove those lines from hot state. The count
limit applies even if every event occurred today. Avoid duplicate event IDs when recovering interrupted rollups.

Keep progress at most 60 lines, learner model at most 120, profile at most 80, and active reviews at most 20.
Archive historical profile observations with a pointer; retain claims/observations separately and the current
environment/language summary. A session's hot reads total at most 400 lines, including 20 log-tail lines and
one newest session summary; Skill/reference material is measured separately. Retired reviews keep only five
recent entries, with the rest in the archive. Never delete evidence to meet a context budget.

## Cross-platform rules

- Claude Code may run shell commands through bash (Git Bash on Windows) or PowerShell. Do not assume either.
- Prefer tools that are the same everywhere: `Read`, `Write`, `Glob`, `Grep`, and `cargo` itself.
- When you must run a process, use `cargo` rather than shell built-ins. If a shell command is unavoidable, check
  which shell you have before relying on syntax.
- Never hardcode `\` or `/` into paths you generate for the learner. Build them from the paths they gave you.
- Paths with spaces and non-ASCII characters are normal on Windows. Quote them.
- Never assume a Unix home directory, a drive letter, or that `~` expands.

## Registry maintenance

- Add an entry during `/rust-learn-init`, after the workspace is successfully created.
- Update `last_active` at the end of a session that produced evidence.
- Remove an entry when the learner says the workspace is gone, or when they confirm a move.
- Never delete a workspace directory. Removing a registry entry is the only destructive registry action there is,
  and it is still reversible by hand.
