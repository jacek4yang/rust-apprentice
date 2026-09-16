# Design patterns

Design patterns teaches the learner pattern names as a shared vocabulary for reasoning about structure —
and, more importantly, teaches them to check whether Rust makes the pattern unnecessary before writing
it.

## What to teach

For every pattern, the mentor must be able to answer five questions. Teach the learner to ask them too.

| Question | What it is really testing |
| :--- | :--- |
| What problem does this solve here? | Whether the pattern has a current need or is decorative |
| Is a trait required? | Whether the variation point needs to be open or closed |
| Would an enum be simpler? | Whether the set of cases is closed and known |
| Would generics be better? | Whether the choice is made at build time or at runtime |
| Would composition alone be enough? | Whether a field would do instead of a type |
| How does ownership change the design? | Who holds it, who borrows it, who may mutate it |

Patterns to cover, with the Rust-native alternative stated up front:

- **Builder.** Useful for many optional fields or validated construction. Often `Default` plus struct
  update syntax (`..Default::default()`) is enough. A builder whose `build()` returns `Result` is
  genuinely valuable; one that just sets fields on a three-field struct is not.
- **Newtype.** A one-field tuple struct that makes a unit or an invariant explicit and prevents argument
  swaps. One of the highest-value patterns in Rust, because the compiler enforces it at zero runtime cost.
- **Typestate.** Encoding a state machine in a type parameter so illegal transitions do not compile.
  Strong, but expensive when the state must be decided at runtime — say that cost honestly.
- **RAII.** Resource acquisition tied to a value's lifetime, released in `Drop`. Rust does this by
  default; it is why there is no `try/finally`.
- **Strategy.** Swappable behaviour. A generic parameter gives static dispatch and no allocation; an
  `enum` gives a closed exhaustive set; `Box<dyn Trait>` gives runtime choice and open extension.
- **Adapter.** One type's interface presented as another's. Usually a thin wrapper implementing the trait
  the caller wants.
- **Decorator.** Behaviour wrapped around a value: a struct holding `Box<dyn Trait>` or a generic `T`. The
  interesting question is whether it forwards by value or by reference.
- **Command.** An action represented as data, so it can be queued, logged, or undone. In Rust this is an
  `enum` of commands far more often than a trait object per command.
- **State.** Behaviour changing with state. An `enum` plus `match` is the default answer; typestate is the
  compile-time answer; `Box<dyn State>` is almost never the right first move.
- **Observer / event.** A subject notifying observers. Channels are the Rust-native form; a `Vec` of
  callbacks runs into borrow-checker friction the moment a callback touches the subject.
- **Iterator.** Lazy, composable traversal as a trait. Rust's own iterators are the canonical example;
  custom `Iterator` impls are a pattern in their own right.
- **Visitor.** An operation over a closed set of nodes. An `enum` and a `match` is the direct equivalent;
  classic double dispatch exists to work around the absence of sum types.
- **Factory concepts.** Constructing a value without exposing the concrete type: an associated function
  (`Type::new`), a function returning `impl Trait`, or an enum of variants.
- **Repository concepts.** A trait at the domain edge that hides storage. Valuable, and the place where
  return types (`Result`, borrowing, async) do most of the design work.
- **Actor model.** Independent tasks with private state, communicating by messages. Ownership makes this
  natural: the actor owns its state, and messages transfer ownership in.
- **Pipeline.** Stages connected by a typed flow. Ownership moves through the stages; the failure question
  is where backpressure lives.
- **Middleware.** A composable chain wrapping a handler. In Rust, usually `tower`-style: a service trait, a
  generic wrapper, and possibly a `dyn` boundary.
- **Dependency inversion.** The domain defines the trait; infrastructure implements it. As much an
  ownership decision as an abstraction one — the domain must not own the adapter.

## Sequence

1. **Newtype and RAII first.** Cheap, no ceremony, and they teach that a pattern can be one line of code.
   Everything later is compared against this baseline.
2. **Builder, and when not to use it.** Introduce it after the learner has written a six-argument
   constructor, so the pain is theirs. Then show `Default` plus struct update and let them choose.
3. **Strategy, in three forms.** Generic parameter, enum, `dyn`. Static first, closed dynamic second, open
   dynamic last. The learner should then be able to say which one a given call site needs.
4. **Adapter and decorator.** Both wrappers; teach together, and let the learner see that the only
   difference is whether the wrapper adds behaviour or changes shape.
5. **Enums as state and as command.** The pivot point. Once the learner accepts that an `enum` and a
   `match` replace State and Command in most cases, they have stopped translating.
6. **Iterator.** Custom impls, `impl Iterator<Item = ...>` as a return type, and why returning a boxed
   iterator is a fallback rather than the default.
7. **Repository and dependency inversion.** Needs the trait boundary from `software-architecture`; lands
   well once there is a real database call to hide.
8. **Observer via channels, then actor.** Teach message passing before callback registries, so the
   learner's default is the one that compiles.
9. **Middleware and pipeline.** Where generic wrappers, traits, and occasionally `dyn` meet.
10. **Visitor, last and briefly.** Present it as history: what you write when you lack sum types. Show the
    `enum` version, then classic double dispatch, and let the line count speak.

Unlocks: `software-architecture` boundaries must exist before repository or middleware makes sense;
`concurrency` and `async-rust` unlock actor-style designs; `performance` decides whether `dyn` at a given
seam is acceptable.

## Teaching notes

**Do not translate Gang-of-Four patterns into Rust mechanically.** This is the single most common failure
in this domain, and it is worse than not knowing the patterns at all, because the translation produces
code that fights the language. Name the substitutions explicitly and repeat them:

| Pattern as commonly taught | Rust-native alternative |
| :--- | :--- |
| Builder with a chained setter for every field | `Default` plus struct update syntax `..Default::default()` |
| Strategy via an interface and an implementation class | A generic parameter, or an enum when the set is closed |
| Observer with a `Vec` of registered callbacks | Channels (`std::sync::mpsc`, `crossbeam`, `tokio::sync`) |
| Visitor with `accept` and double dispatch | An `enum` plus an exhaustive `match` |
| State with one struct per state and a `Box<dyn State>` | A typestate, or an `enum` with a `match` per transition |
| Command as a trait object per action | An `enum` of commands, which also gives free `serde` support |
| Singleton with a global accessor | An owned value passed in, or `OnceLock` when truly global |
| Template method with an abstract base class | A trait with a default method, or a generic parameter |
| Factory method returning a base-class pointer | An associated function, or a function returning `impl Trait` |

**A pattern is a reasoning tool, not a checklist item.** The learner who says "this needs a strategy
pattern" has skipped the useful part of the thinking. The useful part is: what varies, who decides the
variant, must new variants be addable without touching this code, and would a plain function parameter do
instead. Redirect every pattern name back to those questions. The correct answer is frequently "no pattern
needed", and the mentor should say so plainly and, when appropriate, celebrate it.

**The three-way choice, stated once and clearly.** When behaviour must vary, the learner has exactly three
Rust options, each with a distinct consequence:

- *Generic parameter* — static dispatch, no allocation, monomorphised code, the type is part of the
  caller's signature. Choose when the variant is known at the call site.
- *Enum* — closed set, exhaustive checking, all variants in one file, no allocation; adding a variant is a
  breaking change for exhaustive matchers. Choose when the set is known and small.
- *`dyn Trait`* — open set, runtime dispatch, one pointer indirection, object-safety rules apply, and new
  implementations can arrive from anywhere. Choose when implementations are genuinely open, or when the
  generic version causes code bloat or prohibitive compile times.

Ask which of the three applies before allowing any pattern discussion, and require the learner to name
the consequence of their choice.

**Ownership changes the design of every pattern.** The classic patterns assume freely shared mutable
objects. In Rust:

- An observer storing callbacks cannot easily notify them while the subject holds `&mut self`; the
  channel version sidesteps this, which is why it wins.
- A decorator holding `Box<dyn Trait>` owns it; one holding `&T` does not. The choice shows up in the
  caller's signature and in whether the wrapper can be mutated.
- A builder taking `self` by value is chainable and consuming; one taking `&mut self` allows reuse. Both
  are legitimate; they must be chosen deliberately.
- A command queue must own its commands or hold referents that outlive it — a lifetime decision, not a
  pattern decision.

**Warn about pattern-induced indirection.** Each layer of wrapping costs a reader one jump. If the learner
cannot say what a wrapper is for in one sentence, it is probably not earning its place. The test: "if I
delete this and inline it, what breaks?" If nothing, it should go.

**Iterator deserves its own session, not a mention.** Learners fluent in `map`/`filter`/`fold`/`collect`
and custom `Iterator` impls write dramatically better code everywhere else. Prefer hands-on work —
implement `Iterator` for a custom type, chain adapters, and study laziness with a `println!` inside an
adapter.

## Evidence of mastery

- Designs a construction path with `Default` plus struct update syntax instead of a builder, and states
  why the builder was unnecessary.
- Designs a validated builder whose `build()` returns `Result`, and names the invariant it enforces.
- Chooses between a generic parameter, an enum, and `dyn Trait` for a described variation, and defends the
  choice with its dispatch, allocation, and extension consequences.
- Designs a typestate for a described protocol and demonstrates a call that does not compile because the
  state is wrong.
- Replaces a proposed callback registry with a channel and explains the borrow-checker problem avoided.
- Replaces a proposed visitor with an `enum` and a `match`, and reduces the line count doing it.
- Designs a repository trait whose method signatures show whether the domain owns or borrows the result.
- Implements `Iterator` for a custom type and returns it as `impl Iterator<Item = _>` without boxing.
- Rejects a pattern by name in a code review, in writing, and proposes the simpler structure.
- Reads a Rust codebase and identifies where a pattern was translated from another language unnecessarily.

## Projects that teach this

- **Configuration loader, twice.** Once with a hand-written builder, once with `Default` plus struct
  update, then a written comparison of the call sites. The point is not that the builder loses; it is that
  the learner can say when each is right.
- **Protocol state machine.** A connection lifecycle (disconnected, connecting, ready, closed) as an
  `enum` with per-transition functions, then as a typestate. Compare what the compiler rejects in each.
- **Pluggable command tool.** A CLI whose subcommands are an `enum` of parsed commands, dispatched by
  `match`, with an undo stack requiring commands to own their data. No trait objects.
- **Middleware chain.** A service trait plus wrappers (logging, timing, retry), first generic, then with
  one `dyn` boundary, plus a written justification of where the boundary sits.
- **Actor-style counter or chat room.** Tasks with private state, messages over channels, and a shutdown
  message. Teaches observer, command, and state together.

## Related

`software-architecture`, `concurrency`, `async-rust`, `testing`, `data-structures-algorithms`.

See [index.md](index.md) for routing and [testing.md](testing.md) for tests that hold patterns honest,
[performance.md](performance.md) for the cost of `dyn` and boxing, and
[../rust/ownership.md](../rust/ownership.md) for why ownership decides these questions.