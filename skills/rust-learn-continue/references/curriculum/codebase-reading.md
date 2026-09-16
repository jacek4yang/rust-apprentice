# Codebase reading

Codebase reading teaches the learner to enter an unfamiliar Rust repository and build a useful mental model of
it unaided — a distinct skill from writing small programs, and the one that separates a competent programmer
from a senior engineer.

## What to teach

**The method.** Reading a repository is not reading a book front to back. It is a directed search for a small
number of answers, in a deliberate order. Steps 1–6 should become reflex; the rest are pulled in as needed.

| Step | Question | Where to look |
| :--- | :--- | :--- |
| 1 | What is this project for? | `README`, docs, the crate description, the project website |
| 2 | What is the shape? | Workspace layout, directory tree, crate names |
| 3 | What is built? | `Cargo.toml` `[[bin]]`, `src/main.rs`, `src/lib.rs`, `src/bin/` |
| 4 | What does it depend on? | `Cargo.toml`, `Cargo.lock`, `cargo tree` |
| 5 | Where does execution start? | The binary's `main`, recursively to the first real work |
| 6 | What is the one important path? | The feature the user asked about, traced end to end |
| 7 | What is the data? | The central structs, the types that flow through the system |
| 8 | How does it fail? | The error enum, `?` sites, panic sites, `unwrap` density |
| 9 | How does it run concurrently? | `thread`, `spawn`, `Arc`, `Mutex`, channels, `async`, runtime setup |
| 10 | What are the seams? | Major traits, their implementors, and who depends on the abstraction |
| 11 | Where does it touch the world? | File, network, process, clock, environment I/O |
| 12 | Where is it unsafe? | `unsafe` blocks, `unsafe fn`, `unsafe impl`, FFI boundaries |
| 13 | What is platform-specific? | `#[cfg(target_os = ...)]`, `cfg(windows)`, build scripts |
| 14 | How is it tested? | `#[cfg(test)]`, `tests/`, fixtures, doc tests, how to run one test |
| 15 | How is it shipped? | CI config, feature flags, MSRV, release workflow |
| 16 | What is changing? | Recent commits, recent pull requests, open issues, changelog |

**Tooling.** Teach the tool to the question it answers, not as a catalogue.

| Tool | Answers |
| :--- | :--- |
| `rg` | Where does this identifier, string or attribute appear? |
| `git grep` | The same, scoped to tracked files at a revision — useful on tags and old branches |
| `git log -S`, `git log -p <path>` | When and why did this line appear? |
| `git blame` | Who last touched this line, in which commit — a pointer to a message, not a verdict |
| `git log --oneline -- <dir>` | How active is this module, and what has been churning? |
| `cargo metadata --format-version 1` | The workspace graph: targets, dependencies, paths |
| `cargo tree -i <crate>` / `cargo tree -d` | Who pulls this dependency in / which versions are duplicated |
| `cargo doc --open` | The public API as the maintainers describe it |
| rust-analyzer | Go to definition, find references, call hierarchy, hover for inferred types |
| `cargo expand` | What a macro actually produced, when a `derive` hides the code |
| `cargo test -- --list`, `cargo clippy` | What tests exist / which lints the project tolerates or denies |

**The five mental maps.** The learner should be able to draw these on paper from memory after a reading session,
even if imperfectly. They are the deliverable, not a summary of the code.

1. **Module map** — crates, modules, what is public, which direction dependencies flow.
2. **Dependency map** — external crates grouped by role (parsing, async, HTTP, CLI, logging), and the internal
   crate graph. Which dependency is load-bearing?
3. **Execution-path map** — one concrete path from `main` to a meaningful effect, naming the module at each hop.
4. **Data-flow map** — the central type as it is created, transformed, stored and returned, and where ownership
   changes hands.
5. **Ownership map** — what is owned versus borrowed at the boundaries, where `Arc` appears and why, where
   lifetimes are declared, and where the design is shaped by the borrow checker rather than by the domain.

**Reading in large steps, not in lines.** Teach the learner to read signatures, type definitions and module
structure before reading any function body. A Rust codebase is unusually legible at that altitude: the trait
definitions and the public structs often describe the architecture, and the bodies are detail.

## Sequence

Stage the difficulty deliberately. Do not skip a stage; the failures at each stage are the curriculum.

1. **20–50 line snippets.** Single functions with no context. Ask: what does this do, what can it assume, what
   can it not assume, what happens on bad input? Inference from incomplete information starts here.
2. **A single module.** Two to four files with internal structure. Ask for the module map and the public surface.
3. **A small crate.** One `Cargo.toml`, one `lib.rs`, a handful of modules, some tests. Ask for all five maps.
4. **A multi-crate workspace.** Ask first which crate depends on which, then which crate owns the entrypoint,
   then for the execution-path map across a crate boundary.
5. **A large, mature project.** A real published crate or application. The goal is not completeness; it is
   answering a specific question, quickly, with evidence.

Unlocks: after stage 2 the learner can navigate their own projects more effectively. After stage 3 they can read
a dependency's source instead of guessing from its docs. After stage 4 they can be dropped into an unfamiliar
workplace repository. `open-source-engineering` depends on stage 4 being solid.

## Teaching notes

**The method must be taught as a method.** The instinct of an experienced reader is invisible to a beginner.
Narrate your own process out loud: "I am looking at `Cargo.toml` first, because I want to know whether this is a
library or a binary before I read any code." The learner copies the narration, then the habit.

**Do not summarise a codebase the learner should be reading.** This is the most important instruction in this
document. When the learner asks "what does this repository do?", the wrong answer is a paragraph of description.
The right answer directs their attention: "What does the README say the project is for? Start there and tell me
what you find." A mentor who explains the codebase robs the learner of the exact skill they need. Resist the urge
to be helpful in this specific way. Redirect, ask, and wait.

**The goal, stated to the learner: enter a large repository and form a useful mental model without asking an
agent or a colleague to "explain the whole repository".** Explain why: the explanation would be someone else's
model, shaped by their interests rather than the learner's question, and unavailable during an interview, an
incident, or a first day on a new team. Reading ability is portable; explanations are not.

**The unknown code challenge.** Present code the learner has never been taught — a crate using features outside
their syllabus, or an unfamiliar style — and ask only: "What can you infer?" This trains inference from
incomplete information, which is what senior engineers actually do all day. The rules:

- State what they *know*, what they *infer*, and what they *cannot tell* — three buckets, kept separate.
  Conflating the second with the first is the failure mode to catch.
- For every inference, ask for the evidence. "Why do you think this is a CLI tool?" — "because `Cargo.toml`
  declares a `[[bin]]` and the dependency set includes `clap`."
- Do not correct a wrong inference immediately. Let the learner propose a cheap check — a `rg`, a `cargo tree`,
  a look at the tests — and run it. A falsified inference teaches more than a supplied fact.
- Choose code genuinely outside their current syllabus. If everything is familiar, the exercise is reading, not
  inference.

Run this challenge regularly, at every stage. It is the single best predictor of whether the learner can operate
in an unfamiliar codebase.

**Common mistakes, in the order they appear:**

| Mistake | Correction |
| :--- | :--- |
| Reading `main` first and following calls linearly | Read the README, `Cargo.toml` and module tree first. Structure before flow. |
| Trying to understand everything | Ask what question they are answering. A session with no question has no end. |
| Reading function bodies before signatures | Signatures are the summary; bodies are the detail. |
| Ignoring tests | Tests are the only code that states intent. Read them early; they run. |
| Trusting `unwrap` counts as a quality signal | Judgement, not grep counts — though the grep is a good prompt. |
| Treating `unsafe` as automatically wrong | Ask what the safety comment claims, then check that claim. |
| Skipping `Cargo.toml` feature flags | Features change what is compiled. A `cfg`-gated path may be the whole story. |
| Assuming the docs match the code | Docs describe intent, and drift. `cargo doc` for API, source for behaviour. |
| Asking an agent to explain the repository | Redirect to a specific question and a specific search. |

**Teach one path end to end, exhaustively.** Ask the learner to trace a single concrete operation — "what
happens when I run `tool parse input.txt`?" — from `main` to the effect, naming the file and function at every
hop, including the error path when the input is bad. One path traced properly beats five skimmed. When they can
do this in an unfamiliar repository, the domain is essentially learned.

**Teach `rg` as a first-class skill, not a fallback.** Learners read files one by one. Instead: search for the
identifier, read its use sites, and let the pattern of uses tell you what the type means. Patterns worth teaching
directly: `impl` blocks, a trait name, `todo!()` and `unimplemented!()`, `TODO` and `FIXME`, `#[cfg(test)]`,
`panic!` and `unwrap` outside tests, and `unsafe`.

**Git history is part of reading, used selectively.** `git log` on a module tells you whether it is stable or
churning, and churn predicts where the interesting design decisions are. `git blame` on a confusing line leads
to a commit message that often explains the constraint. Recently merged pull requests are the fastest way to
learn a project's current conventions and its reviewers' standards. Do not read history exhaustively — it is a
targeted tool for when a line does not make sense.

**Say plainly that reading has an output.** A reading session is not done when the learner "feels oriented". It
is done when they can produce the maps, answer the question they set out with, cite file and line as evidence,
and state what they still do not know. Require the written artefact — a page of notes, a diagram, a short answer
— or the session leaves no trace and the skill does not compound.

**Rust-specific reading cues to teach explicitly:**

- `lib.rs` is the crate root and the public surface; `main.rs` is a thin shell. Read `lib.rs`.
- `mod.rs` versus the modern `foo.rs` + `foo/` layout — the same thing in two eras. Recognise both.
- `#[cfg(feature = "...")]` changes what exists. Check the feature list before concluding a code path is dead.
- A `prelude` module is the crate's intended import surface; it reveals the intended vocabulary.
- A trait with one implementor is often a seam for testing, not for extension. Ask which.
- `Arc<Mutex<T>>` in a struct signature tells you the concurrency model almost by itself.
- A large number of `From`/`TryFrom` impls usually marks the conversion boundary between layers.
- `build.rs` can generate code, set cfg flags, or link native libraries. Read it before blaming the source.
- `unsafe` in a wrapper crate is where the real contract lives; the safe API around it is the claim being made.

## Evidence of mastery

- Given an unfamiliar repository, produces the module map and dependency map from `Cargo.toml`, the directory
  tree and `cargo metadata`, without opening a function body.
- Traces one complete execution path from `main` to an observable effect, naming file and function at each hop,
  including the error path, unaided.
- Identifies the central data structures and explains the lifecycle of one of them through the system.
- Locates the error type, names its variants' meaning, and points to where the boundary conversion happens.
- States the concurrency model — threads, async, actor, none — with the evidence that establishes it.
- Identifies the major traits, the number of implementors, and whether the abstraction is a seam or a design.
- Finds every I/O boundary and every `unsafe` block in a given crate, and judges each `unsafe` block's safety
  comment against what the code does.
- Distinguishes what they know from what they infer from what they cannot tell, and gives evidence per claim.
- Answers a specific question about a 10k+ line repository within a session, citing files and lines.
- Reads the test suite and says what behaviour the maintainers considered worth protecting.
- Uses recent commits and pull requests to explain a confusing design decision.

## Projects that teach this

- **Annotated reading report.** Pick a well-regarded crate and produce a written report: purpose, structure, the
  five maps, one traced path, and three unanswered questions. The report is the artefact; the reading is the
  exercise. Repeat with a workspace-sized project.
- **Behaviour reimplementation from reading.** Read a small crate's source, close it, and reimplement one
  function or module from the mental model. Then diff the behaviour against the original. Reveals exactly which
  parts of the model were guesses.
- **Question-driven archaeology.** Give the learner one specific question — "how does this project handle a
  malformed config file?", "where does it retry?" — and a time box. The answer must cite files and lines. This is
  the closest approximation to real engineering work.
- **Dependency audit and map.** Take a project with a large dependency tree, run `cargo tree`, group the
  dependencies by role, identify the load-bearing ones, find the duplicated versions, and explain what would
  break if one were removed.
- **Unknown code challenge set.** A curated set of snippets and small crates using features the learner has not
  been taught. For each: infer, state evidence, state uncertainty, then verify with one cheap check.

## Related

`open-source-engineering`, `software-architecture`, `design-patterns`, `debugging`, `testing`, `git-github`,
`engineering-english`.

See [index.md](index.md) for where this domain sits and what it depends on, [testing.md](testing.md) for reading
a test suite as intent, [debugging.md](debugging.md) for the diagnosis skills that reading supports,
[performance.md](performance.md) for finding hot paths in unfamiliar code, and
[../rust/rust-language.md](../rust/rust-language.md) with [../rust/ownership.md](../rust/ownership.md) for the
Rust constructs the learner must already recognise while reading.
