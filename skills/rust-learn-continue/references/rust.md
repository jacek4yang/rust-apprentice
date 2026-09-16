# Rust guidance

How to teach the language: what to sequence, what to insist on, and which mistakes matter.

## Sequencing principles

- **Ownership early, but not first.** Learners need a few days of `let`, functions, and structs before the borrow
  checker can mean anything. Introduce ownership around the point where they first pass a `String` to a function
  and it stops working afterwards — the confusion is the teaching moment.
- **Revisit the core five repeatedly**: ownership, borrowing, error handling, traits, lifetimes. They are not
  topics to be completed; they are the substrate of everything later. Each return should be at a higher level:
  first "what is a move", later "why does this closure need `move`", later still "why does this `async` block need
  `Send` bounds".
- **Compilation errors are the curriculum.** Rust's diagnostics are the best teaching material available. Do not
  pre-empt them by writing code that avoids the learner's likely mistakes.
- **Prefer `std` before crates.** Understand `Result`, `Iterator`, and `Vec` before `anyhow`, `itertools`, and
  `serde` do the work invisibly. Once the standard version is understood, a crate that removes the boilerplate is
  a relief rather than a mystery.
- **Async last.** Do not introduce `async`/`await` before the learner is comfortable with threads, closures,
  `Send`/`Sync`, and `Arc`. Async Rust is hard mainly because it composes all of those.

## Concept notes

Short guidance on the topics that are most often taught badly.

### Ownership and borrowing

- Teach the *rule* before the *checker*: each value has one owner; a move transfers it; borrows are exclusive for
  `&mut` and shared for `&`.
- The productive framing is about lifetimes of access, not about "the compiler being picky".
- `.clone()` to make the compiler happy is the most common beginner anti-pattern. When you see it, ask what the
  clone is protecting against, and whether the function should take a reference instead.
- NLL and the 2024 edition borrow rules mean many examples from older material are wrong. Verify examples against
  the toolchain actually installed.

### `String` vs `&str`, slices, and `Path`

- Teach the ownership distinction, not the memory diagram: `String` owns, `&str` borrows; parameters usually take
  `&str`.
- `&[T]` and `Path`/`PathBuf`, `OsStr`/`OsString` follow the same pattern. Teach the pattern once and reuse it.

### `Option`, `Result`, and error handling

- `Option` before `Result`; `?` as soon as there is a function returning `Result`.
- Teach the difference between *recoverable* and *programmer* errors, and why `unwrap()` in library code is a
  design smell but fine in a scratch `main`.
- Custom error types: this is where traits become practical. `Display`, `std::error::Error`, `From`, then
  `thiserror`/`anyhow` once the manual version has been written once.
- `Box<dyn Error>` is a reasonable intermediate, not a destination.

### Traits, generics, and lifetimes

- Introduce traits as "shared behaviour", using `Iterator` and `Display` as the examples, before defining a
  custom trait.
- Teach `impl Trait` in argument position first; `dyn` later, with the performance/monomorphisation difference
  explained honestly rather than dogmatically.
- Associated types before generic trait parameters.
- Lifetimes: teach elision rules by example, and only write explicit lifetimes when the compiler demands them.
  Most learners write far too many lifetime annotations once they learn the syntax.

### Smart pointers and interior mutability

- `Box` for indirection and recursion; `Rc` for shared ownership in one thread; `Arc` for shared ownership across
  threads; `RefCell` and `Cell` for interior mutability; `Mutex`/`RwLock` for mutual exclusion.
- The most common confusion is `Arc` vs `Mutex`. State it plainly: `Arc` shares ownership, `Mutex` allows
  mutation. `Arc<Mutex<T>>` is both. Then give an example that fails with only `Arc`.

### Concurrency and async

- Threads and channels before async. `thread::spawn`, `move` closures, `JoinHandle`, `mpsc`.
- `Send`/`Sync` are about what can cross thread boundaries; teach them from a failing example, not a definition.
- Async: futures are lazy; `.await` drives them; a runtime (usually Tokio) provides the executor and I/O. Do not
  teach `Pin` until it is genuinely required.
- Repeatedly return to `Arc`/`Mutex` in async code, since tasks are not sequentially executed.

### Testing

- Unit tests in the same file, integration tests in `tests/`, `#[should_panic]`, `assert_eq!` with a message.
- Table-driven tests, and tests named as statements of behaviour.
- `cargo test -- --nocapture` when the learner needs output.
- Property testing and fuzzing only when a project has a natural place for them; a forced property test teaches
  nothing.

### Performance, profiling, unsafe

- Measure before optimising. `cargo bench`/criterion, `perf` or `cargo flamegraph` where available, and
  `std::time::Instant` for a crude first look.
- Teach allocation, bounds-checking, and cloning as the usual suspects.
- `unsafe` only after a project needs FFI or a data structure `std` does not provide. Always with a documented
  safety comment, and preferably with `miri` available. Teach soundness as the standard, not "it works".

## Modelling the process

When the learner is stuck, model how an engineer behaves rather than giving the answer:

- Read the error message from the top.
- Find the first diagnostic that is not a consequence of another one.
- Reduce the program until the error is minimal.
- Search the docs — and show them where and how you searched.
- Check `rustc --explain EXXXX` for anything unfamiliar.
- Write a test that reproduces the bug before changing the code.

Then hand the next step back to the learner.

## Tooling, introduced gradually

| Tool | When | Why you introduce it |
| :--- | :--- | :--- |
| `cargo check` | with the first compile | fastest feedback loop |
| `cargo test` | with the first test | tests as a habit, not an event |
| `cargo fmt` | second session | formatting is not a decision |
| `cargo clippy` | once code compiles reliably | lints teach idioms |
| `cargo doc --open` | when writing the first doc comment | docs are part of the API |
| `cargo bench` / criterion | first performance question | claiming without measuring |
| `tracing` | first background/async service | printing does not scale |
| `cargo audit`, `cargo deny` | first real dependency tree | dependencies are risk |
| `miri`, `cargo fuzz` | first unsafe or parsing code | correctness beyond tests |

Never introduce a tool because it is on this list. Introduce it because the learner's current problem needs it,
and say what problem it solves.

## Language editions

Check the installed toolchain (`cargo --version`, the edition in `Cargo.toml`) before relying on examples from
memory, and tell the learner which edition you are teaching against when it matters. When a snippet from a
tutorial does not compile, "that changed in the 2024 edition" is a useful lesson rather than an obstacle.
