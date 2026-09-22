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

Retire after a clean pass in a later session at least 30 days after the previous attempt. Three successful
sessions alone do not retire an item: they schedule the longer interval below. Keep only the five most recent
retirements in the queue; append older retirement records to `archive/reviews-<year>.md` before removing them.

If a retired item later fails in real work, it comes back with a zero clean streak and is due the next day.

## Spacing, concretely

The following policy is normative and machine-readable for development-time date checks. It is not a
runtime dependency of the Skill. All day counts are calendar days in the learner's local timezone.

```yaml
review_policy:
  fail_days: 1
  partial_days: 3
  clean_days: [7, 7, 21]
  retirement_gap_days: 30
  failure_weakness_threshold: 2
  max_active: 20
  max_recent_retired: 5
```

This is the single scheduling authority. Calendar dates use the learner's local date; examples and tests use
an explicit date. `Attempts` counts every observed retrieval, including failures. `Clean streak` counts clean
passes in distinct sessions since the last partial/fail. A second pass in the same session does not increase it.
Record `Last attempted` and `Last session` so a restart cannot count the same retrieval twice. Missing legacy
streak/session data is unknown: reconstruct from specific evidence or initialize a zero streak, never infer
successes from the total attempt count.

| Clean streak after this pass | Interval after a clean pass |
| :--- | :--- |
| 1 | 7 days |
| 2 | 7 days |
| 3 | 21 days |
| 4+ | 21 days, unless the 30-day retirement condition applies |

After a partial: reset the clean streak and schedule 3 days. After a failure: reset it and schedule 1 day.
Two consecutive observed failures also create an active weakness and a small prerequisite objective; keep the
review record linked to that work so it is not forgotten. Self-reported forgetting triggers a retrieval probe,
not an automatic capability demotion. A demonstrated failure supplies the evidence for demotion.

These are defaults, not law. A learner using the same concept daily in a project does not need a review item for
it; the project is the retrieval. Prefer project use over artificial review whenever both are available.
