# Errors

Error handling is where a learner's engineering judgement becomes visible. The language gives them `Result` and
`?`; the hard part is deciding what an error means, who can act on it, and what the caller should be able to
recover from. This is a design topic wearing syntax clothing.

## What to teach

1. **`Option`** for absence, and the discipline of not collapsing "missing" and "failed" into one case.
2. **`Result<T, E>`** and the `?` operator, including that `?` is a `return` in disguise and uses `From` to
   convert the error type.
3. **`From` conversions** and how they make `?` work across error types. The mechanism behind the ergonomics.
4. **Panic versus `Result`.** A panic is for a bug or an unrecoverable invariant violation; a `Result` is for a
   condition the caller could reasonably handle. Programmer error versus environmental failure.
5. **`unwrap` and `expect`.** Where each is acceptable: prototypes, tests, and cases where the invariant is
   genuinely guaranteed. `expect` should say what was assumed.
6. **Custom error types.** Implementing `Display` and `std::error::Error`. Why the error type is part of the
   public API of a library.
7. **`Box<dyn Error>`.** A reasonable intermediate for applications, and a poor choice for a library's public
   surface.
8. **`thiserror` and `anyhow`.** `thiserror` for libraries that need precise, matchable errors; `anyhow` for
   applications that need context and a report. Introduce each after the manual version has been written once.
9. **Error design.** Errors a caller can act on versus errors they can only report. Error context versus error
   type. Not modelling every failure as one giant enum.

## Sequence

Prerequisites: enums, pattern matching, generics, and one custom trait implementation. `Option` comes early;
custom error types come after traits have landed, because `Display` and `Error` are the practical introduction to
trait implementation.

Order: `Option` → `Result` → `?` → `From` and `?` → panic versus `Result` → `unwrap`/`expect` discipline →
custom error type by hand → `thiserror` → `anyhow` for applications → error design discussion.

Do not introduce `thiserror` or `anyhow` before the learner has written a custom error type once. Otherwise the
macros look like magic and the design tradeoff is invisible.

## Teaching notes

**`unwrap()` in library code.** The most common, and the cheapest to correct: ask what happens to a caller of
this function when the operation fails. If the answer is "the whole program dies", the caller had no opportunity
to decide.

**Matching every arm by hand.** Once `?` exists, a hand-written `match` that only propagates is noise. Ask which
arms actually do something different from propagating; usually none do. Then show `?` and the `map_err` case
where a conversion genuinely is needed.

**One error enum for everything.** A learner who has just learned custom errors writes a single `Error` enum for
the whole crate, with variants that model nothing and are never matched. Ask which variant a caller would match
on. If none would, the granularity is wrong.

**Forcing the dependency's error type on callers.** A library that returns `reqwest::Error` in its public API has
made its dependency part of its contract. Ask what happens when they upgrade `reqwest`. This lands well once the
learner has felt a dependency upgrade.

**`Box<dyn Error>` as a destination.** It is a fine intermediate for an application and a poor public API for a
library: the caller cannot match on it, and it erases information they may need. Say which situation they are in.

**Panicking in a `main` versus in a library.** `unwrap()` in a scratch `main` is fine and saying so prevents
learners from contorting simple programs. The rule is about who bears the consequence.

**Errors that carry no information.** `Err("failed".into())` tells the caller nothing. Ask what a maintainer
reading a log at 3am would need to know.

**Teach `?` as a design tool.** Once a learner sees `?` as "propagate unless there is something better to do",
they start structuring functions so the happy path reads linearly. That is the moment error handling stops being
a chore.

## Evidence of mastery

- Converts a hand-written match chain into `?` and `From`, unaided.
- Designs a custom error type whose variants a caller can actually match on.
- Explains the difference between a panic and a `Result` in terms of who can recover.
- Chooses `unwrap` deliberately and can justify it, or replaces it with a real error path.
- Picks between `thiserror` and `anyhow` for a given crate and says why.
- Adds context to a propagated error rather than discarding it.
- Reviews someone else's error type and identifies an unusable variant.

## Related

`rust-language.md`, `traits.md`, `ownership.md`

`../curriculum/debugging.md` covers what to do when an error occurs at runtime;
`../curriculum/software-architecture.md` covers where error boundaries belong in a larger system.
