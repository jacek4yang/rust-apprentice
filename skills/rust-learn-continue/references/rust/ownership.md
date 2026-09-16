# Ownership and memory

The centre of the language. Everything else in Rust is downstream of this: traits, lifetimes, concurrency and API
design all take their shape from ownership. Taught badly, it becomes a compiler obstacle the learner fights for
months. Taught well, it becomes the design tool they reach for first.

## What to teach

1. **Values and moves.** A value has one owner. Assignment, passing by value, and returning all move it. After a
   move the original binding is unusable. Show the compiler error rather than pre-empting it.
2. **`Copy` versus `Clone`.** `Copy` is an implicit bitwise duplication for types where it is indistinguishable
   from a move; `Clone` is explicit and may allocate. Which primitive types are `Copy`, why `String` is not, and
   why `Clone` must be visible in the code.
3. **Borrows.** `&T` and `&mut T`. The aliasing rule: any number of shared borrows, or exactly one exclusive
   borrow, never both. The rule is about access, not about memory being freed.
4. **Slices.** `&[T]` and `&str` borrow a region of something else. Why `&str` parameters are usually right and
   `&String` almost never is.
5. **`Drop` and RAII.** Destructors run at a statically known point. This is what makes locks, files and
   connections safe by construction, and it is the reason Rust needs no `finally`.
6. **Non-lexical lifetimes.** A borrow ends at its last use, not at the end of the block. Most older tutorial
   examples are wrong about this, so verify against the installed toolchain.
7. **Interior mutability.** `Cell` and `RefCell` move the borrow check to runtime. When that is legitimate
   (graphs, caches, observers) and when it is a sign the design is wrong.
8. **Shared ownership.** `Rc` and `Weak` within one thread; `Arc` across threads. `Arc` shares ownership and does
   nothing else — it is not a lock.
9. **Mutual exclusion.** `Mutex` and `RwLock`. How they compose with `Arc`, and why `Arc<Mutex<T>>` means two
   separate things that are frequently conflated.
10. **Indirection.** `Box` for recursive types and for shrinking large enum variants.
11. **Layout basics.** `size_of`, alignment, padding, and why field order can matter.
12. **Ownership-oriented API design.** Taking `&str` rather than `&String`, returning owned data rather than
    borrowing from a local, accepting `impl Into<T>`, and choosing where the ownership boundary belongs.

## Sequence

Prerequisites: variables, functions, structs, and enough `enum` to know what a value is. Introduce ownership at
the moment the learner first passes a `String` to a function and finds it unusable afterwards — the confusion is
the teaching moment, not an obstacle to it.

Order: moves → `Copy`/`Clone` → borrows → the aliasing rule → slices → lifetimes (only
when the compiler demands them, and see `lifetimes.md`) → `Drop` → `Box` → interior mutability → `Rc`/`Arc` →
`Mutex`/`RwLock`.

Do not introduce `Arc` or `Mutex` before the learner has a problem that needs them.

## Teaching notes

**The `.clone()` reflex.** The single most common beginner anti-pattern. When the compiler complains, add a
clone, and the error goes away without understanding it. When you see it, ask what the clone is protecting
against and whether the function should have taken a reference instead. Do not simply forbid it: cloning is
sometimes correct, and a learner who is told "never clone" will contort code to avoid it.

**`&String` parameters.** Learners who have just learned references write `fn f(s: &String)`. Ask what happens if
the caller has a `&str`, then let them discover that `&str` accepts both.

**`Arc` versus `Mutex`.** The most consequential early confusion. State it plainly and repeat it: `Arc` shares
ownership, `Mutex` allows mutation, `Arc<Mutex<T>>` does both. Then give an example that fails with `Arc` alone —
mutating through an `Arc` requires interior mutability of some kind.

**Expecting a move to copy.** Coming from a language where assignment duplicates, a learner expects `s1` to stay
usable after `let s2 = s1;`. Let the compiler say it, and make them explain it back.

**Returning a reference to a local.** A recurring error with a genuinely enlightening diagnostic. Do not fix it
for them; ask where the data lives and who owns it after the function returns.

**The framing matters.** A learner who believes the borrow checker is an adversary will write worse code and
learn more slowly. Reframe at every opportunity: the compiler is proving properties about the program, and every
error is a class of bug that cannot happen at runtime. The goal, stated explicitly to the learner, is to move
from "how do I get this to compile" to "who should own this".

**Do not teach the memory diagram first.** Stack and heap diagrams are useful later; they are a poor first
explanation of moves because they describe the implementation rather than the rule.

## Evidence of mastery

- Predicts, without running it, that `let s2 = s1;` makes `s1` unusable, and says why.
- Writes a function taking `&str` rather than `&String` without being told.
- Resolves a borrow-checker error by restructuring rather than cloning.
- Explains when a borrow ends, referencing last use rather than the end of a block.
- Chooses `Arc<Mutex<T>>` for shared mutable state across threads and can say what each half contributes.
- Reaches for `Box` unprompted when a recursive type requires it.
- Explains an existing function's ownership choices in a codebase they did not write.
- Designs a function's signature around ownership deliberately, and defends the choice.

## Related

`rust-language.md`, `lifetimes.md`, `traits.md`, `concurrency.md`, `errors.md`

Systems context for the memory model lives in `../curriculum/computer-architecture.md` and
`../curriculum/operating-systems.md`.
