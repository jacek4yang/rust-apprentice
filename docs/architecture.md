# Architecture

How `rust-apprentice` is put together, and why.

## The shape of the product

Three user-facing skills, one persistent learning workspace, and a small per-user registry.

```
Claude Code
  ├── /rust-learn-init      (personal skill, user-invoked only)
  ├── /rust-learn-continue  (personal skill, user-invoked only)
  └── /rust-learn-status    (personal skill, user-invoked only)

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
plus three Node scripts used only by tests and CI.

## Why exactly three skills

The three-command interface is a design constraint, not a simplification for its own sake. Every additional
command is a decision the learner has to make, and every decision is a place where the apprenticeship stops
feeling like returning to a mentor.

| Command | Responsibility |
| :--- | :--- |
| `/rust-learn-init` | Interview, probe, choose a workspace path, create initial state. Runs once. |
| `/rust-learn-continue` | Discover the workspace, read current state, decide the next objective, teach, record evidence. Runs forever. |
| `/rust-learn-status` | Report progress compactly from the learner model. Occasional. |

There is deliberately no `/learn-networking`, `/learn-crypto`, `/learn-algorithms` or similar. The curriculum is
large, and exposing it as modes would transfer the routing problem to the learner — which is precisely the
cognitive overhead this project exists to remove. `/rust-learn-continue` chooses the domain.

Everything that other systems would model as separate commands — review, projects, Git, quizzes, status, notes —
is a *decision* made by `/rust-learn-continue`, not a command the learner types. See
`skills/rust-learn-continue/references/core/domain-selection.md`.

Invocation control is handled in the `description` rather than with a frontmatter flag, for a measured reason.

### Why there is no `disable-model-invocation` here

The obvious way to guarantee "the learner controls when learning begins" is `disable-model-invocation: true`. On
Claude Code, for a personal skill in `~/.claude/skills/`, that flag does something different from what its
documentation implies: the skill is **not registered at all**. The `/rust-learn-init` command does not resolve, and
the skill is absent from the model's skill listing. The result is an uninstalled skill, not a user-invoked one.

Verified by installing both variants and inspecting a session:

| Frontmatter | `/rust-learn-init` resolves | Present in the model's listing |
| :--- | :--- | :--- |
| `disable-model-invocation: true` | no | no |
| `disable-model-invocation: false` | yes | yes |

With the flag absent, the skill registers normally. The remaining question — does the model start a learning
session merely because Rust was mentioned? — was tested directly: a session whose prompt mentioned thinking about
learning Rust someday, then asked an unrelated question about hash maps, answered the hash map question and did not
touch the apprenticeship. What prevents the unwanted invocation is the description, which states that the skill is
invoked only when the user explicitly asks and that a passing mention of Rust is not a trigger.

Both properties are therefore enforced by checks that fail loudly if either drifts:

- `tests/repo-checks.mjs` rejects any skill that sets `disable-model-invocation`, and requires each description to
  scope its own invocation in those words.
- `tests/validate-skills.mjs` rejects any field outside the portable Agent Skills subset, so the previous
  portability problem cannot return.

A useful side effect: with no Claude Code-only frontmatter, all three `SKILL.md` files validate directly against
the Agent Skills specification, and remain usable by any compatible client.

## Progressive disclosure and the context budget

Each `SKILL.md` is a router: small, always-loaded when invoked, and pointing at reference files that load only
when the current objective needs them. An invoked skill's instructions persist in context for the rest of the
session, so every always-loaded line has a recurring cost.

Levels, descended one at a time and never skipped:

| Level | What | When |
| :--- | :--- | :--- |
| 0 | `SKILL.md` entrypoint (~100–180 lines) | On invocation |
| 1 | Hot state: learner model, progress, review queue, log tail (~200–400 lines) | Every session |
| 2 | One domain reference (~120–180 lines) | When the objective needs it |
| 3 | One topic reference or note (~100 lines) | When the objective needs it |
| 4 | Evidence, archive, deep reference | Rarely, on explicit need |

Three deliberate choices:

- **Shared policy lives in `rust-learn-continue`.** `rust-learn-init` and `rust-learn-status` link across to
  `../rust-learn-continue/references/core/...` rather than duplicating. All three are installed together, so the
  relative path always resolves. Duplication would mean two copies of the state schema drifting apart.
- **References are coherent domain documents, not fragments.** One file per domain, 110–180 lines, each covering
  what to teach, in what order, the mistakes learners make, and what counts as mastery. Fragmenting further would
  multiply the paths a session must consider without reducing what it reads.
- **The curriculum index is separate from the curriculum.** `curriculum/index.md` is a routing table — domains,
  what each covers, and the prerequisite graph. It is small enough to read when choosing an objective, and it
  means the mentor never has to load a domain reference simply to find out whether it is relevant.

`references/core/context-budget.md` states the loading discipline, including the single test applied before
reading anything: *will this materially change the learner's next action?*

## State architecture

The state is split by read frequency — hot, warm and cold — which is what keeps a ten-year-old workspace as cheap
to start as a new one.

| Tier | Files | Read | Growth |
| :--- | :--- | :--- | :--- |
| Hot | `rust-apprentice.yaml`, `state/learner-model.md`, `state/progress.md`, `state/review-queue.md`, `state/log.md` tail | every session | bounded by design |
| Warm | `learner/profile.md`, `learner/goals.md`, `learner/evidence/*.md`, `state/sessions/*`, `plans/*`, `notes/*` | on demand | grows |
| Cold | `archive/*` | rarely | grows |

The critical file is `state/learner-model.md`: a compact index of nineteen domains with a mastery state, plus the
current stage, active weaknesses and the current objective. It is what allows `/rust-learn-continue` to choose an
objective and `/rust-learn-status` to report progress **without reading any evidence at all**.

`notes/` is the learner's durable knowledge base and is never loaded automatically. Reading a note is a decision,
not a default.

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

- exactly three skills, with the exact expected names;
- valid frontmatter, and never `disable-model-invocation`;
- every description scoping its own invocation;
- every relative link inside the skills resolving;
- no Chinese in code, scripts, workflows or skill prose;
- no hardcoded workspace path outside the files that legitimately show illustrative ones;
- entrypoints under a line budget, and no inlined curriculum;
- an eval case for every required learner situation and scenario;
- `curriculum/index.md` pointing only at files that exist.

`tests/validate-skills.mjs` runs `skills-ref validate` against each skill and rejects any field outside the
portable Agent Skills subset.

`tests/assert-discovery.mjs` runs the real Skills CLI against the repository and asserts it finds exactly the
three skills, which catches layout changes that would break `npx skills add <owner>/rust-apprentice`.

`tests/fix-links.mjs` is a maintenance aid, not a check: it repairs relative links after a file is moved, when the
target's new location is unambiguous.

Behavioural evaluation lives in `evals/` and runs with `claude plugin eval`.
