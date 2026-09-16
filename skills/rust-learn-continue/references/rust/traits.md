# Traits

Traits are how Rust expresses shared behaviour, and also the feature learners most often over-use. The goal is a
learner who reaches for a trait when there is a genuine abstraction boundary, and for a plain enum or a concrete
type when there is not.

## What to teach

1. **Defining a trait** and implementing it. Start from `Iterator` and `Display`, which the learner already uses,
   before defining a custom one.
2. **Default methods**, and when a default is a sensible contract versus a place where behaviour is silently
   wrong.
3. **Trait bounds.** `fn f<T: Display>(x: T)` and the `where` form once the bounds get long.
4. **`impl Trait`** in argument position as sugar for a generic parameter, and in return position as "some
   concrete type that implements this".
5. **`dyn Trait`.** Dynamic dispatch, why it needs a pointer, and what that costs.
6. **Object safety.** Which traits can be used as `dyn`, and why.
7. **Associated types versus generic parameters.** `Iterator` uses `Item`; `From<T>` uses a parameter. When each
   shape is right.
8. **Blanket implementations** and what `impl<T: Display> MyTrait for T` means for coherence.
9. **The orphan rule.** Why a foreign trait cannot be implemented for a foreign type, and the newtype workaround.
10. **Supertraits** and trait hierarchies, sparingly.
11. **Operator overloading** traits, and the convention that overloading should preserve the operator's meaning.
12. **`From`/`Into`/`TryFrom`** as the idiomatic conversion family.
13. **Choosing the shape.** Generic parameter, `dyn Trait`, or plain enum — a decision the learner should be able
    to defend.

## Sequence

Prerequisites: structs, enums, methods, and enough generics to write `fn f<T>(x: T)`. Traits are far easier once
the learner has written the same function three times for three types and felt the duplication.

Order: using existing traits → defining a trait with one implementation → two implementations → default methods
→ bounds → `impl Trait` → associated types → `dyn Trait` and object safety → the orphan rule → conversions →
the generic/enum/`dyn` decision.

Do not introduce `dyn` before the learner has felt the cost of a large generic surface, usually as compile times
or code size.

## Teaching notes

**Over-abstraction is the default failure.** A learner who has just learned traits will define one for a type
that has exactly one implementation, and for a case that is really a closed set of variants. Ask two questions:
how many implementations exist, and will a third be written by someone else? If the answers are "one" and "no",
an enum or a concrete type is better. This is the single most valuable correction in this topic.

**Generics versus `dyn`, explained honestly.** Monomorphisation produces specialised code with no indirection but
grows compile time and binary size. `dyn` trades a vtable lookup for one code path. Neither is "better"; say so,
and connect the choice to what the code is for. Dogmatic advice in either direction produces engineers who cannot
reason about their own tradeoffs.

**A trait is not an interface.** Learners coming from Java or C# expect inheritance, shared state, and a class
hierarchy. Rust traits carry no data, cannot be extended after the fact by a type they do not know about, and
compose through bounds rather than inheritance. Point out that enums plus `match` often replace a sealed class
hierarchy entirely, and more clearly.

**Why `dyn Trait` needs a pointer.** A trait is not a size, so `dyn Trait` must live behind `&`, `Box`, `Rc` or
`Arc`. Learners who miss this write `fn f(x: dyn Trait)` and are confused by the error. Let them hit it.

**The orphan rule feels arbitrary until it is not.** Explain coherence as the reason the compiler can rely on
there being only one implementation of a trait for a type. The newtype pattern then reads as a deliberate escape
hatch rather than a workaround.

**Associativity of `Iterator`.** Learners often struggle to see why `Iterator` has an associated type rather than
a parameter. Ask what `for x in v` would mean if a type could implement `Iterator<Item = A>` and
`Iterator<Item = B>` at once.

**Do not teach the trait system as a puzzle.** Learners who learn traits through clever bound gymnastics write
unreadable code. Prefer the concrete implementation until abstraction earns its place.

## Evidence of mastery

- Implements a trait for two types and uses it through a bound, unaided.
- Chooses an enum over a trait for a closed set of variants, and can say why.
- Reads a `where` clause on an unfamiliar function and explains what it constrains.
- Explains the difference in cost and behaviour between a generic parameter and `dyn Trait`.
- Recognises the orphan rule when the compiler reports it, and applies the newtype pattern.
- Writes a `From` implementation so `?` works, without being shown the pattern.
- Removes an unnecessary trait from their own earlier code and says what made it unnecessary.

## Related

`rust-language.md`, `ownership.md`, `lifetimes.md`, `errors.md`

Abstraction and boundary decisions belong to `../curriculum/software-architecture.md`; the patterns that traits
implement are in `../curriculum/design-patterns.md`.
