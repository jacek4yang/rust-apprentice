# Workspace bootstrap

Exactly what `/rust-learn-init` creates, and what it deliberately does not.

## Principles

- Create the minimum. Everything else grows when it is first used.
- Nothing empty "for later". An empty directory is a promise the learner did not ask for.
- Every file written must be useful to the *next* session, not decorative.
- The learner watches, or better, runs the commands. Do not create a workspace silently while they wait.

## What to create

```
<workspace>/
├── rust-apprentice.yaml      # marker file
├── README.md                 # for the learner, not for the mentor
├── learner/
│   ├── profile.md
│   └── evidence/
├── state/
│   ├── progress.md
│   ├── review-queue.md
│   ├── log.md
│   └── sessions/
└── plans/                    # only if the learner named a goal
```

Directories created at initialization: `learner/`, `learner/evidence/`, `state/`, `state/sessions/`, and `plans/`
only when there is a goal.

Not created here, created on first use: `notes/`, `exercises/`, `projects/`, `reviews/`, `archive/`.

## Order of operations

1. **Ask for the path** ([SKILL.md](../SKILL.md) step 4). No default. Confirm the parent directory is writable.
2. **Verify it is not inside** the installed skills directory or a skills repository. If it is, explain and ask
   again.
3. **Tell the learner what you are about to create** — two lines, in Chinese, listing the directories.
4. **Create the directories.** Use the platform's own tooling if you run a command at all; `Glob`/`Write` where
   possible.
5. **Write `rust-apprentice.yaml`** using the schema in
   [../../rust-learn-continue/references/workspace.md](../../rust-learn-continue/references/workspace.md).
6. **Write `README.md`** from [../assets/workspace-readme.template.md](../assets/workspace-readme.template.md),
   filled in: the learner's name if known, today's date, and the two commands.
7. **Write `learner/profile.md`** from [../assets/profile.template.md](../assets/profile.template.md).
8. **Write the three state files** following
   [../../rust-learn-continue/references/state-format.md](../../rust-learn-continue/references/state-format.md):
   `progress.md` (with the first likely topic and next action), `review-queue.md` (empty or with one probe item),
   `log.md` (one line recording initialization).
9. **Write `state/sessions/<date>.md`** with a few lines on what the probes established.
10. **Write `plans/roadmap.md`** only if the learner expressed a direction; otherwise leave `plans/` for later.
11. **Register the workspace** in the registry (below).
12. **Say where it is** and what to type next.

Do not, at any point, create a Rust project. The first `cargo new` belongs to the learner, in a later session,
in `projects/`.

## The registry

Location and format are in
[../../rust-learn-continue/references/workspace.md](../../rust-learn-continue/references/workspace.md). At
initialization:

- Create the state directory if it does not exist.
- Create `workspaces.yaml` if absent, or add an entry if present.
- If an entry for the same path exists, update it rather than duplicating.
- If `workspaces.yaml` exists but does not parse, tell the learner and show them the file. Do not overwrite it.

The registry is a convenience for sessions started outside the workspace. A session started *inside* the workspace
finds it by walking up, and does not need the registry at all — which is why an invalid registry is not fatal.

## Verifying what you wrote

Before telling the learner you are done, check the marker file parses as YAML and the paths inside it resolve.
A workspace whose marker is malformed is worse than no workspace, because `/rust-learn-continue` will find it and
fail.

Report what you created, briefly. Do not paste the files back into the conversation.

## If the learner wants a different layout

Allow it, within limits:

- Keep `rust-apprentice.yaml` at the root with the same field names. That is the discovery contract.
- Keep the current-state files small and separate from the history, whichever directories they live in. Update the
  `state:` and `review_queue:` paths in the marker, and note the difference in `learner/profile.md` so later
  sessions follow it.
- Do not move `state/` contents into notes or `README.md`, and do not keep everything in one file.

## If initialization is interrupted

The workspace is a set of plain files, so a partial initialization is recoverable:

- Marker present, state missing → next `/rust-learn-init` completes it; do not create a second workspace.
- Workspace directory present, marker missing → ask before writing the marker; the learner may have pointed at an
  existing folder by mistake.
- Registry entry present, workspace gone → remove the entry and ask where the workspace is now.
