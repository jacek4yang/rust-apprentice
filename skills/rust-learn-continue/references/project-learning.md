# Project-based learning

Projects are where the apprenticeship stops being an exercise. This file covers choosing them, scoping them, and
turning a learner's ambition into a route.

## Why projects, and when

Syntax drills teach recognition. Projects teach design, debugging, integration, and the professional habits around
code — version control, tests, documentation, dependencies. Move to a project as soon as the learner can write a
function and run a test; do not wait for the fundamentals to be "finished", because they never are.

Keep small exercises running alongside for concepts that need isolation. A learner should rarely be blocked from
project work for more than one session.

## The progression

Not a required sequence — a default shape to reach for when nothing else is indicated.

| Stage | Example projects | What they teach |
| :--- | :--- | :--- |
| 1 | CLI utility: word count, file renamer, unit converter | `cargo new`, `main`, args, `Result`, `std::fs` |
| 2 | Text processing: log filter, CSV summariser, template filler | iteration, `String`/`&str`, parsing, tests |
| 3 | Filesystem tool: duplicate finder, directory tree printer, bulk renamer | `Path`/`PathBuf`, error handling, recursion |
| 4 | HTTP client: API fetcher, status checker, feed reader | HTTP concepts, `serde`, timeouts, retries |
| 5 | Concurrency: parallel downloader, concurrent scanner | threads, channels, `Arc`/`Mutex`, or async |
| 6 | Parser: config language, simple markup, binary format | state machines, error types, `nom`/`pest`/manual |
| 7 | Service: REST API, async web service | `axum`/`hyper`, routing, state, JSON, integration tests |
| 8 | Protocol or tool: own protocol, developer tool, CLI framework | layering, public API design, docs |
| 9 | Performance or systems: profiled library, memory-sensitive tool | benchmarks, profiling, unsafe, layout |
| 10 | Learner-designed substantial project | everything, without a syllabus |

Stage skips are fine when the learner's ability supports them. Stage changes should be recorded in
`plans/roadmap.md` when they happen.

## Choosing, and who chooses

Prefer projects the learner cares about. Ask what they would use, or what annoys them, or what they want to
understand from the inside. A dull project that is well-suited beats an exciting one that is three stages out of
reach.

Naming matters more than it looks: the learner names the crate (`cargo new <name>`), you discuss conventions
(`snake_case`, avoiding `-rs` suffixes, crates.io availability later). Run the command *with* them, do not run it
for them.

## Starting a project

1. Confirm the goal in one sentence, in the learner's words.
2. Have the learner run `cargo new` (or `cargo init`) themselves, after a one-line explanation of the difference.
3. Create the first vertical slice together — a working program that does something end to end, however small.
4. `cargo run` and see output. Then `cargo test` with one trivial test, so the loop exists from the start.
5. Commit. Discuss the message. This is the first Git lesson in the project's context.

Do not scaffold modules you are not about to use. Do not write a `lib.rs`/`main.rs` split until it is needed. Do
not add dependencies the first slice does not use.

## Working in slices

A slice is the smallest change that produces observable behaviour:

```
requirement (in words)
  -> expected result (in words)
  -> failing test                      (learner writes it)
  -> minimal implementation            (learner writes it)
  -> green                             (learner runs it)
  -> review of the implementation      (mentor asks questions)
  -> refactor if warranted             (learner)
  -> cargo fmt / clippy / test         (learner runs them)
  -> commit                            (learner writes the message)
```

One slice per session is a good target; two is a fast session. A slice that spans sessions is too big — split it
and record the remainder in `state/progress.md`.

The learner does every step. You discuss, question, and review. See [teaching.md](teaching.md) and
[tdd.md](tdd.md).

## Reducing scaffolding over time

Track how much structure you are providing and remove it as competence grows:

| Stage | Your scaffolding |
| :--- | :--- |
| First projects | Suggest the module layout; give function signatures; specify the slice. |
| Later | Ask what the modules should be; ask for the signature; ask them to propose the next slice. |
| Advanced | They propose the design and defend it. You challenge, review, and ask about edge cases. |

The last stage is the goal. A learner who still requires you to decompose the work into steps after a year has
been taught in a way that produced dependence.

## When the learner proposes a project

A learner saying "I want to build X" is the highest-value input the system gets. It also has a tempting wrong
answer: building X immediately.

Do this instead:

1. **Understand the outcome.** What would the finished thing do? Who uses it? What does "done" mean to them?
2. **Estimate the concepts.** List what X requires — language features, crates, protocols, architectural patterns,
   platform APIs.
3. **Compare against evidence.** Read `state/progress.md` and `learner/evidence/`. Which requirements are at
   `independently-demonstrated`? Which are `unseen`?
4. **Find the gap.** Name it explicitly, to the learner, in plain terms: "this needs async, and we have not done
   async yet — that is the real gap, not the parsing".
5. **Build a route.** Write `plans/<goal-slug>.md` with the ordering: prerequisites, stepping-stone exercises,
   one or two smaller projects that use the same skills, then the real project.
6. **Start where the route starts.** Not at the project. The first session is usually the first prerequisite.
7. **Reduce scaffolding as the project proceeds**, per the table above.

Example shape of a route file:

```markdown
# Goal: a CLI that indexes a directory and searches file contents

## Required concepts
- walking a directory tree (`std::fs`, `walkdir`)
- error handling across a fallible pipeline
- string searching, then regex
- CLI argument parsing (`clap`)
- performance: reading files efficiently, avoiding needless allocation

## Already demonstrated
- `std::fs` basics, `Result`, iterators — mostly-independent

## Gaps
- `clap` — unseen
- regex — unseen
- profiling and the performance work — unseen

## Route
1. Stepping stone: recursive directory lister with proper error handling (no crates) — Stage 3
2. Exercise: parse CLI args by hand with `std::env`, then replace with `clap` — Stage 2/4
3. Stepping stone: search one file for a literal string, tested
4. Project: `logscan`-style indexer with `clap` and regex
5. Later: profiling slice, then a second binary in the same workspace

## Notes
Learner wants this for their own log files — keep the data format realistic.
```

## Never say "too advanced"

If the project is far above current ability, say what it would take, and that you will build toward it. Preserve
the goal verbatim in `learner/goals.md` and keep the route visible. Learners abandon goals that a mentor dismisses;
they pursue goals that a mentor takes seriously.

The only honest reasons to decline a goal outright: it requires hardware or accounts they do not have, or it
depends on a domain where you cannot verify correctness at all. Say which, and propose the nearest thing that
works.

## When a project dies

Learners abandon projects. Handle it without drama:

- Ask once whether they want to park it or drop it.
- Park → move it to `projects/` as-is with a `PARKED.md` note recording where it stopped. No further ceremony.
- Drop → leave it in place, note it in `log.md`. Do not delete their work; deletion is theirs to choose.
- Then pick the next thing without treating the abandonment as a failure. Also worth checking whether the project
  was too large, too dull, or too far above level, and adjusting the next choice accordingly.
