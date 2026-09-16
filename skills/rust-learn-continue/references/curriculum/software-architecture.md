# Software architecture

Software architecture teaches the learner to decide where the boundaries in a Rust codebase go, and to
justify each boundary by something it buys — a testable seam, a compile-time guarantee, an independent
release — rather than by resemblance to a diagram.

## What to teach

Generic structural concepts, then how Rust changes each one.

- Separation of concerns: what a module is responsible for, and what must not leak into it.
- Cohesion: whether the things inside a boundary change together, and for the same reason.
- Coupling: afferent and efferent, and the difference between coupling to a type and coupling to
  behaviour.
- Module boundaries: `mod`, `pub`, `pub(crate)`, `pub(super)`, and re-exports as a deliberate facade.
- Dependency direction: which way arrows point, and why the stable side must not depend on the volatile
  side.
- Layering: what a layer may call, and the cost of the shortcut everyone takes once.
- Ports and adapters concepts: a domain core with traits at its edges, and adapters behind them.
- Domain boundaries: where the vocabulary changes, which is usually where the boundary belongs.
- Library versus application boundaries: who controls `main`, who commits to a version, who owns
  `std::process::exit`.
- API stability: semver, additive change, the cost of `pub`, and why a public field is a permanent
  promise.
- State ownership: exactly one owner per piece of mutable state, and who is allowed to mutate it.
- Error boundaries: which layer converts, which layer logs, which layer decides to abort or retry.
- Configuration: file, environment, CLI flags, precedence, defaults, and validation at startup.
- Dependency injection concepts: passing a collaborator in rather than constructing it inside.
- Plugin architectures: registered handlers behind a trait or a function table.
- Event-driven design: events as data, decoupled producers and consumers, and the failure modes of an
  unbounded queue.
- Pipeline architectures: typed stages, ownership transfer between stages, and where backpressure lives.
- Client/server and protocol boundaries: what crosses the wire, and what must not.

Rust-specific, and the part learners most often miss:

| Concern | Rust mechanism | Why it changes the design |
| :--- | :--- | :--- |
| Crate boundaries | `Cargo.toml`, path dependencies | Compile-time and coherence boundary, not just a folder |
| Workspace structure | `[workspace]`, shared `Cargo.lock` | One lockfile, many independently testable crates |
| Public/private API | `pub`, `pub(crate)` | The public surface is a contract the compiler enforces |
| Ownership across layers | `&`, `&mut`, owned, `Arc` | Signature tells you whether a layer mutates or observes |
| Error type design | `thiserror`, `anyhow` | Each layer decides: enum for callers, opaque for binaries |
| Trait boundaries | `trait`, `impl Trait`, `dyn Trait` | A trait is an abstraction cost; a concrete type is often enough |
| Generic versus dynamic dispatch | monomorphisation vs `dyn` | Generics for hot paths, `dyn` for plugin edges and compile time |
| Feature flags | `[features]`, `default-features = false` | Optional behaviour without optional correctness |
| Optional dependencies | `optional = true` | The dependency graph is part of the architecture |
| Facade crates | Re-export crate, thin `lib.rs` | Lets internal crates move without breaking callers |
| Internal crates | Unpublished workspace members | Enforced encapsulation across the whole workspace |
| Binary/library split | `src/lib.rs` plus `src/main.rs` | The binary becomes testable when it is a thin wrapper |
| Build scripts | `build.rs`, `cargo:rustc-cfg` | Generated code belongs in the build, not in `main` |
| Platform-specific modules | `#[cfg(target_os = ...)]` | Same public API, different implementations |
| Unsafe isolation | Small `unsafe` modules with safe wrappers | The unsafe surface is a boundary like any other |
| FFI boundary isolation | One crate owns `extern "C"`, `repr(C)`, raw pointers | Keeps C's vocabulary from spreading into the domain |
| Testability seams | Traits, function parameters, injected clocks and paths | A seam that is not injectable is not a seam |

## Sequence

1. **One binary, then many modules.** Start inside a single crate. Teach `mod`, `pub(crate)`, and moving
   code into files when a file gets a second reason to change. Nothing here requires a new crate.
2. **Signatures as interfaces.** Because ownership is in the type signature, reading `fn handle(&mut self)`
   versus `fn handle(&self)` versus `fn handle(self)` is a design statement. This unlocks everything else.
3. **Error boundaries.** `Result` with a per-layer enum, `?` for propagation, `From` for conversion, and
   the rule that a library never decides to print. Unlocks honest layering.
4. **Crate boundaries.** When compile times or reuse demand it, split the crate *along the boundary the
   learner can already articulate*. A split is a claim about encapsulation; if the new crate re-exports
   everything, the claim was false.
5. **Workspaces.** Multiple crates, one lockfile, shared dependencies. Introduce `[workspace.dependencies]`
   when the third member crate appears, not before.
6. **Ports and adapters.** Extract a trait for the thing the domain needs, then implement it with the real
   database or filesystem in an adapter crate. This is where dependency direction becomes visible.
7. **Configuration and startup.** Build the whole object graph in `main`, validate it, then hand the
   constructed pieces to the core. Unlocks dependency injection without a framework.
8. **Dispatch decisions.** Generic versus `dyn` at the seams just drawn. Build-time versus runtime
   trade-offs become concrete once there is an edge to put them on.
9. **Feature flags and optional dependencies.** Now that boundaries exist, make some of them optional.
10. **Events and pipelines.** Once two components must talk without knowing each other, channels and stage
    types are the natural next step.

Unlocks: `design-patterns` presupposes that the learner can see boundaries; `testing` presupposes seams;
`concurrency` presupposes that state ownership has been decided before threads arrive.

## Teaching notes

**Teach architecture by reading real repositories, never from diagrams.** Diagrams are the output of the
reasoning, not the lesson. Take a crate the learner already uses, open its `src/`, and ask: where is
`pub` used, what is re-exported from `lib.rs`, which module never imports which, what would break if this
module moved. Then ask the same questions of the learner's own project. Architecture is discovered in the
`use` statements of real code.

**Two failure modes, and they are equally bad.**

- *Over-engineering.* A trait for everything, a `dyn` registry with one implementation, five crates for a
  two-thousand-line tool. This happens when a learner mechanically transfers structure from Java or C++
  without asking what the structure was buying there. Ask: "how many implementations of this trait
  exist? If the answer is one, what does the trait make easier *today*?" Often the answer is "nothing",
  and that is the lesson.
- *Under-designing.* One `main.rs` of two thousand lines, `pub` on everything, the database called
  directly from the argument parser, configuration read from `std::env::var` in eleven places. Ask where
  the code would need to be cut if a second binary had to reuse half of it.

The correct target is the minimum structure that makes the next change cheap. Say that out loud, because
learners oscillate between the two failure modes for months.

**Say explicitly which Rust features changed the design space.** Learners arrive with assumptions from
other languages and do not notice they are carrying them:

- **Class hierarchies become enums.** Where another language reaches for an abstract base class and
  subclasses, Rust closes the set with an `enum` and exhaustive `match`. The compiler then proves the
  learner handled every case, including the ones added later.
- **Interfaces and inheritance become traits.** Traits describe capability, not identity. There is no
  inheritance, and therefore no diamond, no virtual base, no fragile base class problem. Composition with
  a field beats inheritance with a superclass, always.
- **Ownership replaces garbage collection and shared mutable state.** A layer that takes `&mut self` is
  declaring that it mutates; a layer that takes `&self` cannot. This is architectural information that
  other languages hide behind mutable objects passed around freely, and it makes the borrow checker an
  architecture reviewer rather than an obstacle.
- **Modules replace packages.** A module is not a deployment unit. Cargo workspaces are. Confusing the
  two produces either a folder structure pretending to be a release boundary, or a crate-per-file
  explosion.

**Do not let unsafe or FFI leak upward.** One crate owns `extern "C"`, `#[repr(C)]`, and the raw pointer
arithmetic; everything above it sees safe types and normal `Result`s. If a `*const c_char` appears in a
function the domain calls, the boundary is in the wrong place. The same discipline applies to platform
code under `#[cfg(windows)]`.

**Testability seams are the honest test of a boundary.** If the learner cannot write a test for the core
logic without touching the filesystem, the network, or the clock, the boundary does not exist yet — it is
only drawn. This is the concrete question to ask, and it beats any discussion of "loose coupling".

## Evidence of mastery

- Designs a workspace in which each crate has one stated responsibility and a named consumer, and can say
  what would break if any single crate were deleted.
- Reads an unfamiliar repository's `lib.rs` and `Cargo.toml` and sketches its dependency direction without
  running a diagram tool.
- Diagnoses a layering violation in someone else's code and names the specific import responsible.
- Chooses `enum` over trait, or trait over enum, and defends the choice on the grounds of who is allowed
  to add a case.
- Designs an error type per layer and states which layer converts, which logs, and which decides to abort.
- Justifies a generic parameter over `dyn` (or the reverse) with a concrete consequence for binary size,
  compile time, or the ability to load implementations at runtime.
- Places platform-specific code behind `#[cfg]` so that callers see one API, and cannot name a call site
  that mentions a platform.
- Isolates `unsafe` or FFI into a wrapper module and demonstrates that no raw pointer appears in any
  safe signature above it.
- Splits a library out of a binary so that the core can be tested without spawning a process, and adds a
  feature flag that keeps the optional dependency out of the default build.

## Projects that teach this

- **CLI tool split into a library and a thin binary.** Argument parsing in `main.rs`, all logic in
  `src/lib.rs`, integration tests against the library, one or two `assert_cmd` tests at the edge. The
  learner feels the moment the code becomes testable.
- **Refactor a 1500-line `main.rs`.** Take a real script the learner wrote, inventory its responsibilities
  on paper, then cut it into modules with an explicit public surface. Success is measured by the size of
  `main.rs` and the number of `pub` items, not by the number of files.
- **Ports-and-adapters service.** A domain crate with `trait Repository` and `trait Clock`; an adapter
  crate with a SQLite implementation; an in-memory adapter for tests. Compare test runtime and read the
  diff.
- **Plugin registry.** A program that discovers handlers behind one trait, with at least two genuinely
  different implementations and a `dyn` dispatch point, plus a written justification of why dispatch is
  dynamic there.
- **Pipeline with error and backpressure boundaries.** Stages exchanging owned messages over channels,
  with a typed error per stage and a written answer to "what happens when the slowest stage is the
  bottleneck?"

## Related

`design-patterns`, `testing`, `async-rust`, `concurrency`, `distributed-systems`, `databases-storage`,
`security`, `performance`.

See [index.md](index.md) for routing, [testing.md](testing.md) for seams and test doubles,
[../rust/ownership.md](../rust/ownership.md) for why ownership constrains layering, and
[debugging.md](debugging.md) for reading a repository when the structure is what is broken.
