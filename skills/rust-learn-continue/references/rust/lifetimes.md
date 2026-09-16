# Lifetimes

Lifetimes have a reputation for being the hardest part of Rust. They are not, once the central insight lands:
**lifetimes describe, they do not control.** You cannot make a borrow live longer with an annotation. You can only
tell the compiler about a relationship it could not work out for itself.

A learner who internalises that sentence finds lifetimes straightforward. A learner who does not spends months
adding annotations until the errors stop.

## What to teach

1. **The concept.** A lifetime is the region of code during which a borrow is valid. It is a property of a
   borrow, not of a value.
2. **Elision.** The rules for functions and methods, taught by example before any syntax. Most lifetimes in real
   code are elided; the learner should not see an annotation for a long time.
3. **When an annotation is required.** A function returning a reference derived from more than one input. A
   struct holding a reference. A method where elision guesses `&self`.
4. **`'static`** and its two distinct meanings: a reference that lives for the whole program, and a type that
   contains no non-static borrows. `&'static str` versus `T: 'static`.
5. **Structs that borrow.** `struct Parser<'a> { input: &'a str }`, and the question the learner should ask
   first: should this own the data instead?
6. **Lifetime bounds on generics.** `T: 'a`, and why they usually appear in compiler suggestions rather than in
   code the learner should write.
7. **Variance**, at an intuitive level only: why `&'long T` can be used where `&'short T` is expected, and why
   the reverse is not true. Do not teach variance formally unless the learner asks.
8. **Non-lexical lifetimes.** A borrow ends at its last use. This is why so much older material is wrong.
9. **When not to annotate.** The skill that matters most in practice.

## Sequence

Prerequisites: ownership, borrows, references, and at least one function that returns a reference. Do not
introduce lifetimes as a topic; introduce them the first time the compiler asks for one.

Order: elision rules by example → the first required annotation → `'static` in both senses → structs that borrow
→ bounds → variance if asked.

An early and useful exercise: read three functions from a real crate and identify where the compiler elided a
lifetime and what it chose.

## Teaching notes

**Teach elision before syntax.** A learner who meets `<'a>` before understanding that the compiler usually
infers it will over-annotate forever. Show a function with elided lifetimes, explain what the compiler worked
out, then show the same function explicitly annotated and note that it is the same function.

**Lifetimes describe, they do not control.** Return to this sentence whenever the learner asks how to "make the
borrow last longer". The honest answer is that they are usually trying to solve an ownership problem with a
lifetime annotation, and the fix is in the data structure, not the signature.

**Over-annotation is the intermediate-level error.** Once the syntax lands, learners annotate everything. This
obscures the code and often causes errors that would not otherwise occur. Ask: does the compiler require this
annotation, or did you supply it? If the answer is the latter, remove it and see.

**`'static` confuses everyone once.** A `String` is `'static`-able because it owns its data and contains no
borrows; a `&'static str` points at data that lives for the whole program. Learners conflate "no borrows" with
"lives forever". Distinguish them with a function that takes `T: 'static` and is called with an owned `String`.

**Method elision surprises.** In `fn name(&self, other: &str) -> &str`, the returned lifetime is tied to
`&self`. Learners expect it to relate to `other`. Show the elision rule and let them see the consequence when
they try to return `other`.

**"Just use owned data."** A legitimate strategy that learners should know: if lifetimes are fighting the design,
owning the data may be simpler and fast enough. Say this out loud, because the culture around Rust often implies
that borrowing is always better. Sometimes `String` is the right answer.

**Do not lead with variance or `PhantomData`.** They are real topics, and they are not where a learner should
begin. Introduce them when a genuine problem requires them.

## Evidence of mastery

- Explains what the compiler elided in a given signature, unaided.
- Explains that an annotation describes a relationship rather than extending a lifetime.
- Fixes a "returning a reference to a local" error by changing ownership rather than adding annotations.
- Removes an unnecessary lifetime annotation from their own code and says why it was unnecessary.
- Distinguishes the two meanings of `'static`.
- Decides consciously between owning data and borrowing it in a struct, and justifies the choice.
- Reads a lifetime-annotated signature in an unfamiliar crate and says what it constrains.

## Related

`ownership.md`, `rust-language.md`, `traits.md`

Structure-of-data decisions belong to `../curriculum/software-architecture.md`; the memory model underneath is in
`../curriculum/computer-architecture.md`.
