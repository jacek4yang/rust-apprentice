# Curriculum map

The long-term coverage check. Not a syllabus, not a sequence to follow, and never shown to the learner as a list.

Purpose: after a few months, be able to answer "what have we actually covered, and what is still thin?" — and to
make sure nothing important is missed because the learner's projects happened not to touch it.

Read this when planning a phase, roughly monthly. Do not read it at the start of an ordinary session.

## How to use it

1. Read `plans/roadmap.md` and `learner/evidence/` filenames.
2. Compare against the areas below.
3. Anything still `unseen` after a long time and not blocked by a prerequisite becomes a candidate for the next
   broadening session.
4. Anything the learner has demonstrated well gets left alone.

Coverage is a check, not a target. A learner who has built three excellent projects and never used `Rc` is not
behind; a learner who has memorised `Rc` and built nothing is.

## Language fundamentals

| Area | Introduced by |
| :--- | :--- |
| variables, `let`, `mut`, shadowing | first exercises |
| expressions vs statements, blocks as values | first functions |
| functions, parameters, return values | first exercises |
| primitive types, tuples, arrays | first exercises |
| `if`, `loop`, `while`, `for` | first exercises |
| structs, methods, `impl` | first program with data |
| enums and pattern matching | first program with variants |
| `Option` | first "might be missing" case |
| `Result` and error propagation | first fallible operation |
| modules, `pub`, crate structure | first multi-file project |
| `Vec`, `HashMap`, `String`, `&str`, slices | first data-processing project |
| iterators and closures | first loop that wants to be an iterator |
| generics | first duplicated function |
| traits, `impl Trait`, `dyn` | second crate, or first abstraction |
| lifetimes | first borrow error you cannot elide away |
| associated types | first custom trait over an `Iterator`-like thing |
| `Debug`, `Display`, `From`, `TryFrom`, `Default` | first custom type |
| `?` with custom error types | first real error handling |
| `thiserror`, `anyhow` | once the manual version is understood |
| `#[derive]`, attributes, cfg | as needed |
| testing: unit, integration, doc tests | from the first project |
| `cargo fmt`, `clippy`, `check`, `doc` | habitually, early |

## Ownership and memory, revisited over time

| Area | Typically revisited at |
| :--- | :--- |
| moves, copies, `Drop` | first month |
| borrows, NLL, aliasing rules | second month |
| `Clone` vs `Copy`, when cloning is acceptable | first performance concern |
| `Box`, recursion, indirection | first tree or large enum |
| `Rc`, `RefCell`, interior mutability | first shared graph, or a GUI/parser AST |
| `Arc`, `Mutex`, `RwLock` | first concurrency |
| `Cell`, `OnceCell`, `lazy` statics | first configuration or cache |
| memory layout, `repr`, padding | performance or FFI work |
| `unsafe`, soundness, safety comments | FFI, or a data structure `std` lacks |
| `Pin` | only if writing a future or `self-referential` type |

## Concurrency and async

| Area | Introduced by |
| :--- | :--- |
| `thread::spawn`, `move` closures | first parallel work |
| `JoinHandle`, scoped threads | first result-collecting |
| channels (`mpsc`, crossbeam) | producer/consumer shape |
| `Send`, `Sync` | first failing bound |
| shared state with `Arc<Mutex<T>>` | first counter/queue across threads |
| atomics, `Ordering` | only when a real need appears |
| `async`/`await`, futures, laziness | first I/O-bound concurrency |
| Tokio (tasks, `join!`, `select!`, timeouts) | first async service |
| cancellation, timeouts, backpressure | first production-shaped service |
| `tracing` | first service with more than one moving part |

## Engineering practice

| Area | Introduced by |
| :--- | :--- |
| TDD loop, red/green/refactor | first testable behaviour |
| reading compiler errors and `rustc --explain` | first error |
| debugging by reduction and hypothesis | first real bug |
| reading std docs and `docs.rs` | first unfamiliar API |
| reading crate source and examples | first under-documented crate |
| dependency selection and version constraints | first third-party crate |
| semver and breaking changes | first dependency upgrade |
| feature flags, `cfg` | first optional dependency |
| public API design, doc comments | first library crate |
| README, examples, changelog, releases | first published crate |
| benchmarking (criterion) | first performance claim |
| profiling (`perf`, flamegraph) | first measured bottleneck |
| fuzzing, property testing | first parser or protocol |
| `cargo audit`, `cargo deny` | first substantial dependency tree |
| workspace layout, multiple crates | second related crate |

## Domains and crates

Taught only when a project needs them, but tracked so gaps are visible:

- CLI: `clap`, `std::env`, exit codes, `--help` design
- filesystem: `std::fs`, `Path`/`PathBuf`, `walkdir`, temp files, permissions
- text: `regex`, `str` methods, encodings, `csv`, `serde_json`
- HTTP: request/response, methods, headers, status codes, `reqwest`, `hyper`, retries, timeouts
- networking: TCP/UDP, sockets, DNS, protocols, `tokio::net`
- serialization: `serde`, `toml`, `bincode`, schema evolution
- databases: `sqlx`/`rusqlite`, migrations, transactions
- async services: `axum`, routing, middleware, state, graceful shutdown
- error/reporting: `anyhow`, `thiserror`, `eyre`, logging vs tracing
- parsing: hand-written state machines, `nom`/`pest`/`winnow`, binary formats
- systems: processes, signals, FFI, `nix`/`windows` crates
- performance: allocation, cache behaviour, SIMD concepts, `rayon`

## Git and GitHub

| Area | Introduced by |
| :--- | :--- |
| `status`, `diff`, `add`, `commit`, `log` | first project |
| `.gitignore`, `add -p` | first stray file |
| branches, `switch`, fast-forward merge | first separate change |
| `restore`, `revert`, `stash`, reset levels | first mistake |
| remotes, `push`, `pull`, `fetch` | first GitHub repo |
| rebase, conflict resolution | first divergence |
| issues, branches, PRs, CI | first substantial change |
| squash merge, protected `main`, releases | once PRs are habitual |
| `reflog`, `bisect`, `blame` | first "what happened here?" |
| outside contributions, forks, code review | once confident |

## English

| Area | Introduced by |
| :--- | :--- |
| identifiers, English terms in Chinese discussion | session one |
| code comments | first comment |
| commit messages | first commit |
| test names | first test |
| issue titles, PR titles | first PR |
| PR descriptions | second or third PR |
| documentation and README writing | first published crate |
| code review comments | first review of someone else's work |
| design explanation, technical discussion | advanced stage |

## What "coverage" does not mean

- A topic does not need to be *finished*; it needs to have been *used*.
- Advanced areas are not a checklist to march through. Most learners will never need `Pin` or atomics directly,
  and that is a fine outcome.
- The order is set by the project, not by this page. This page exists so nothing important is invisible.
- Revisit the core five — ownership, borrowing, error handling, traits, lifetimes — at every stage, one level
  deeper each time. They are never "done".
