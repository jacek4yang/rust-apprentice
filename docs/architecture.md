# Architecture

How `rust-apprentice` is put together, and why.

## The shape of the product

Two user-facing skills, one persistent learning workspace, and a small per-user registry.

```
Claude Code
  ├── /rust-learn-init      (personal skill, user-invoked only)
  └── /rust-learn-continue  (personal skill, user-invoked only)

rust-apprentice registry  (~/.local/state/rust-apprentice/workspaces.yaml ...)
  └── points at one or more workspaces

Learning workspace  (<learner-chosen path>)
  ├── rust-apprentice.yaml    marker: identity + paths to current state
  ├── learner/                who they are, what they demonstrated
  ├── plans/                  roadmap and goal routes
  ├── state/                  the small files read every session
  ├── notes/  exercises/  projects/  reviews/  archive/
  └── ...
```

Nothing else runs. There is no service, no database, no build step, no runtime dependency. The skills are Markdown
plus two Node scripts used only by tests and CI.

## Why two skills

The two-command interface is a design constraint, not a simplification for its own sake. Every additional command
is a decision the learner has to make, and every decision is a place where the apprenticeship stops feeling like
returning to a mentor.

| Command | Responsibility |
| :--- | :--- |
| `/rust-learn-init` | Interview, probe, choose a workspace path, create initial state. Runs once. |
| `/rust-learn-continue` | Discover the workspace, read current state, decide the next action, teach, record evidence. Runs forever. |

Everything that other systems would model as separate commands — review, projects, Git, quizzes, status, notes —
is a *decision* made by `/rust-learn-continue`, not a command the learner types. See
`skills/rust-learn-continue/references/session-flow.md`.

Both set `disable-model-invocation: true`, so Claude never starts a learning session because Rust happened to come
up in conversation. Both set `user-invocable: true` explicitly.

## Progressive disclosure

Each `SKILL.md` is a router: small, always-loaded when invoked, and pointing at reference files that load only when
relevant. The split is deliberate:

| Skill | `SKILL.md` role | References |
| :--- | :--- | :--- |
| `rust-learn-init` | The onboarding script | workspace bootstrap, initial assessment, curriculum map |
| `rust-learn-continue` | The session loop | teaching, assessment, review, projects, TDD, Git/GitHub, English, notes, workspace, state format |

Two deliberate choices:

- **Shared policy lives in `rust-learn-continue`.** `rust-learn-init` links across to
  `../rust-learn-continue/references/state-format.md` and `.../english.md` rather than duplicating them. Both skills
  are installed together, so the relative path always resolves. Duplication here would mean two copies of the state
  schema drifting apart.
- **References are coherent documents, not fragments.** Roughly nine files, each 100–250 lines, each covering one
  domain end to end. Fragmenting further would multiply the paths a session has to consider without reducing the
  tokens it actually reads.

Context budget for a normal `/rust-learn-continue` session: one `SKILL.md` (~180 lines) plus two or three
reference files loaded on demand, plus a few hundred lines of workspace state. It does not grow with the age of
the apprenticeship, which is the point.

## State architecture

The state is split by read frequency, which is what keeps a ten-year-old workspace as cheap to start as a new one.

| Layer | Files | Read | Growth |
| :--- | :--- | :--- | :--- |
| Identity | `rust-apprentice.yaml` | every session | fixed |
| Current | `state/progress.md`, `state/review-queue.md` | every session | bounded by design |
| Recent | `state/log.md`, `state/sessions/*` | tail only | trimmed and rolled up |
| Profile | `learner/profile.md` | every session | near-fixed |
| Evidence | `learner/evidence/*.md` | on demand | append-only |
| Plan | `plans/*.md` | monthly | slow |
| Knowledge | `notes/*.md` | on demand | grows |
| History | `archive/*` | rarely | grows |

Full schemas are in [`state-schema.md`](state-schema.md).

## Workspace discovery

Resolution order, implemented by instruction to the model rather than by code — there is nothing to install and
nothing to run:

1. Walk up from the current directory for `rust-apprentice.yaml`.
2. Otherwise read the registry.
3. One valid entry → use silently; several → most recently active, if unambiguous.
4. Ambiguous, missing, or moved → ask one question, then record the answer.

The walk-up check is the mechanism that works with no local state at all, which is what makes copying a workspace
to another machine sufficient. The registry exists only to make sessions started outside the workspace work.

## Non-goals

Recorded so future changes can be judged against them:

- Not a course platform. There is no content pipeline, no exercises library, no grading service.
- Not an autonomous coder. The anti-dependency rules in `teaching.md` are the product, not a limitation of it.
- Not a multi-learner system. One workspace, one learner. A mentor teaching several people gets several
  workspaces.
- Not a scoring system. Mastery is a small set of named states, never a number.

## Testing

`tests/repo-checks.mjs` enforces the structural invariants that matter, including the ones that are easy to break
by accident:

- exactly two skills, with the exact expected names;
- valid, spec-conformant frontmatter, with `disable-model-invocation: true`;
- every relative link inside the skills resolving;
- no Chinese in code, scripts, workflows, or skill prose;
- no hardcoded workspace path;
- the two expected commands, and no others, mentioned across the skills and docs.

`tests/assert-discovery.mjs` runs the real Skills CLI against the repository and asserts it finds exactly the two
skills, which catches layout changes that would break `npx skills add <owner>/rust-apprentice`.

Behavioural evaluation lives in `evals/` and runs with `claude plugin eval`.
