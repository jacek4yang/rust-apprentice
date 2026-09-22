# Context budget

An invoked skill's instructions stay in the conversation for the rest of the session. Every line loaded is paid
for again on every subsequent turn. Over a years-long apprenticeship, careless loading is the difference between
a mentor that stays sharp and one that drowns in its own curriculum.

This file defines the loading discipline. Treat it as an engineering constraint, not a preference.

## The hot / warm / cold model

| Tier | What | When to read | Typical cost |
| :--- | :--- | :--- | :--- |
| **Hot** | `rust-apprentice.yaml`, `state/progress.md`, `state/learner-model.md`, `state/review-queue.md`, last few `state/log.md` lines, newest `state/sessions/` entry | Every `/rust-learn-continue` invocation | A few hundred lines, bounded forever |
| **Warm** | Current domain's evidence file, older session summaries, the one domain reference the objective needs | When the session's objective requires it | One or two files |
| **Cold** | `notes/`, `archive/`, other domains' evidence, finished projects, old sessions | Rarely, on explicit need | Should not enter an ordinary session |

The bounded profile is also part of startup state. The hot tier must not grow with the age of the apprenticeship.
Use the limits and lossless rollup rules in [workspace.md](workspace.md): at most 400 hot-state lines per startup,
including one newest session, a 20-line log tail, and any pending-event pointer. Measure Skill/reference reads
separately. Read `state/pending.md` only if it exists; its specific evidence pointer is a recovery exception.

## The loading test

Before reading any file, answer internally:

> Will this materially change the learner's next action?

If the answer is no, do not read it. This single question prevents most waste. Typical correct answers:

| Situation | Read | Do not read |
| :--- | :--- | :--- |
| Ordinary continuation | Hot tier only | Curriculum, notes, other domains' evidence |
| Teaching an HTTP client objective | `curriculum/networking.md`, current project state | `curriculum/cryptography.md`, `design-patterns.md`, finished projects |
| Review due on borrows | Review queue entry, the learner's own earlier failing snippet | The whole ownership reference |
| Learner asks about lifetimes | The lifetimes section of `rust/ownership.md` | The whole file, plus `rust-language.md` |
| Status check | `state/learner-model.md` and the domain index | Every domain's evidence |

## Rules

1. **One domain reference per session, maximum**, plus one topic reference if the objective genuinely needs both.
   Two domain references in one session is a signal that the objective has not been narrowed enough.
2. **Load a section, not a file**, when the file covers more than the objective. Reference files are organised in
   `##` sections precisely so a section can be read alone.
3. **Never load a reference because it exists.** Existence is not relevance.
4. **Never load all notes.** `notes/` is the learner's durable knowledge base and will be large. Read a specific
   note only when reviewing that concept, updating it, or resolving a misconception about it.
5. **Never load history to establish current state.** That is what the hot tier is for. If the hot tier is
   insufficient, that is a signal to improve it, not to read the archive.
6. **Never re-derive what is already recorded.** If `state/progress.md` says the learner is on error propagation,
   do not read three evidence files to confirm it.
7. **Prefer a targeted excerpt to a whole document.** Quote the paragraph you need.
8. **Do not load a reference in order to summarise it.** If the learner needs the content, teach it; if they do
   not, do not load it.
9. **Drop material rather than carrying it.** Nothing in the references is required to remain in context after
   the objective it served is complete.
10. **Do not re-read a file you wrote earlier in the same session.** You already know what is in it.

## What the entrypoints may contain

`SKILL.md` files are routers and behavioural contracts. They contain:

- purpose and non-negotiable invariants
- the workflow, in steps
- state discovery rules
- routing instructions: how to choose an objective, and which reference to load for it
- pointers to the deeper files

They do **not** contain curriculum, teaching technique in detail, or domain material. If a paragraph would only
matter in some sessions, it belongs in a reference.

## What the state files may contain

Hot state carries an **index**, not a record:

- `state/progress.md` — the current objective, the active project, the next action, blockers
- `state/learner-model.md` — one line per domain with a mastery state, plus active weaknesses and current
  assistance level
- `state/review-queue.md` — what is due, bounded to roughly twenty items
- `state/log.md` — bounded, trimmed and rolled up

Detail lives in `learner/evidence/<topic>.md`, warm and read on demand. History lives in `archive/`, cold.

If the hot tier grows past a few hundred lines, move detail out rather than accepting the cost.

## Measuring it

During development, inspect what a typical session actually loads. For each of these workflows, the loaded set
should be small and predictable:

| Workflow | Should load | Must not load |
| :--- | :--- | :--- |
| Initialization | `rust-learn-init/SKILL.md`, bootstrap, initial assessment, state format | Any curriculum domain |
| Ordinary continue | Hot tier, one domain reference at most | Notes, archive, other domains |
| Review session | Hot tier, the specific concept's evidence | Whole domain references |
| Networking lesson | Hot tier, `networking.md` | Cryptography, OS, DSA references |
| Status check | `learner-model.md`, domain index | Domain evidence in bulk |
| Returning after months | Hot tier, possibly one session summary | The month's worth of sessions |
| A learner with one year of history | Same as ordinary continue | History, notes, completed projects |

If a workflow loads more than this, find the unnecessary load and remove it. Context efficiency is a quality
metric for this project, not an optimisation to consider later.

## Relationship to progressive disclosure

The skill format's progressive disclosure and this budget are the same idea at different scales:

- Level 0: the `SKILL.md` entrypoint (~100-200 lines, always loaded once invoked)
- Level 1: hot state (~200-400 lines, every session)
- Level 2: one domain reference (~120-180 lines, when the objective needs it)
- Level 3: one topic reference or note (~100 lines, when the objective needs it)
- Level 4: evidence, archive, deep reference (rarely, on explicit need)

Descend one level only when the level above is demonstrably insufficient. Never skip from level 0 to level 4.
