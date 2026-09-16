# Review and memory

Humans forget. A correct answer today is not mastery, and a wrong answer in three weeks is not failure. Review
exists to convert "I understood it once" into "I can still use it", and to find out which of those two states the
learner is actually in.

## Principles

- **Retrieval, not recognition.** The learner must produce the answer, not nod at it. Rereading a note feels
  productive and is nearly worthless.
- **Effort is the mechanism.** A question that takes thirty seconds of struggle produces more retention than
  three easy ones. Do not rescue the learner too quickly in a review.
- **Failure is information.** A failed retrieval tells you where to spend the next session. Say so calmly and
  move on; do not turn it into an event.
- **Do not over-review.** Review that blocks all forward progress is its own failure. Cap it.

## What to review

Everything that has been `practiced` or above eventually, weighted by:

| Factor | Effect |
| :--- | :--- |
| Failed before | sooner |
| Needed strong hints to learn | sooner |
| Central to everything else (ownership, `Result`, traits, lifetimes) | sooner and more often |
| Applied in one project and never since | sooner |
| Independently demonstrated three times across sessions | much later, then retired |
| Trivial and mechanical (`let` syntax, `println!`) | never, or once |

Prioritise within a session: a due failure beats a due success; a central concept beats a peripheral one; a
concept used in the current project beats one that is not.

## The item itself

Record items as things the learner can *do*, not topics they have "covered":

- Good: "predict whether a closure capturing by reference compiles", "write a `From` impl for a custom error
  type", "explain when `Arc<Mutex<T>>` is needed rather than either alone".
- Bad: "ownership", "error handling", "iterators".

The review question is generated from the item at session time, using the learner's own past mistakes where
possible. Reusing a learner's earlier broken code as the review prompt is the highest-value form: it is concrete,
it is theirs, and it directly tests whether the correction stuck.

## Forms

1. **Predict** (default, cheapest, works for nearly anything)

   ```rust
   fn main() {
       let mut v = vec![1, 2, 3];
       let first = &v[0];
       v.push(4);
       println!("{first}");
   }
   ```

   "This does not compile. Which line, and why?" Then: "fix it in two different ways."

2. **Explain in their own words** — for concepts with a rule. Ask for the rule *and its limit*: "what exactly is
   the rule about multiple mutable borrows, and when does NLL let you get away with something that looks like a
   violation?"

3. **Write from scratch** — small, from memory, no docs. "Write a function that returns the longest word in a
   `&str` without allocating." Compare to what they could do a month ago.

4. **Read and diagnose** — a real compiler error, `rustc --explain` territory. "What does E0499 mean, and what
   would you change?"

5. **Apply elsewhere** — the same idea in a domain they have not used it in. This is the strongest form, and the
   one that justifies moving a state to `transferable`.

6. **Explain to an imaginary colleague** — "I have never seen Rust. Explain closures to me in five sentences."
   Reveals gaps in understanding with unusual efficiency.

## After the retrieval

- **Clean pass** → note it, reschedule out, do not re-teach, move on.
- **Pass with struggle** → note the struggle, reschedule at a shorter interval, and name the specific gap in one
  sentence.
- **Fail** → re-teach the minimum (not the whole topic), then ask a variant. If they fail that too, stop, lower
  the state, and put it on the active weakness list. Deliberately failing a review is not a setback worth
  dwelling on, but it is worth planning around.

## Recording

Every review attempt goes into the queue's result column and, if it was informative, into
`learner/evidence/<topic>.md`. Record what was asked and what happened, not a score:

```
2026-09-16 — Review: predicted the borrow error in the `first`/`push` example correctly and named NLL
without prompting. Then needed a hint to write the `Vec::first` version.
```

## Retiring

An item is retired after three clean retrievals in different sessions, or one clean retrieval after a gap of a
month or more. Move it to the retired list in `state/review-queue.md` with the date, and keep going — the goal is
a small queue of things that are still fragile, not an archive of things already known.

If a retired item later fails in real work, it comes back. That is normal and worth mentioning to the learner
without ceremony.

## Spacing, concretely

| Attempts so far | Interval after a clean pass |
| :--- | :--- |
| 1 | 3 days |
| 2 | 7 days |
| 3 | 21 days |
| 4+ | retire |

After a partial: 3 days, regardless of attempts. After a failure: 1–2 days, and expect to re-teach.

These are defaults, not law. A learner using the same concept daily in a project does not need a review item for
it; the project is the retrieval. Prefer project use over artificial review whenever both are available.
