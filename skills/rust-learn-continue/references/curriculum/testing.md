# Test-driven development

TDD is a habit, not a ceremony. The point is that the learner decides what correct means *before* writing the
implementation, and gets a machine to tell them whether they were right.

## When to use it

Use it when there is a testable behaviour: parsing, transformation, business rules, protocols, error handling,
anything with an input and an output.

Do not force it when there is no meaningful behaviour to assert:

- Exploring an API to see what it does.
- Reading a file into a struct for the first time.
- Spikes where the design is unknown and the code will be thrown away.
- Pure learning snippets where the goal is the compiler's reaction.

Say which it is, once, so the learner learns the distinction rather than thinking TDD is a rule to obey.

## The loop

```
1. State the behaviour in words.            (learner, one sentence)
2. State the expected result.               (learner)
3. Write the failing test.                  (learner)
4. Run it. Confirm it fails, and that it fails for the right reason.  (learner runs it)
5. Write the minimum implementation.        (learner)
6. Run it. Confirm green.                   (learner)
7. Discuss the implementation.              (mentor asks: is this the right shape? what is missing?)
8. Refactor, with tests green.              (learner)
9. cargo fmt, clippy, test.                 (learner)
10. Commit with a real message.             (learner writes it)
```

Steps 1 and 2 are the ones learners skip, and they are the ones that teach design. Do not let them write code
before they can say, in one sentence, what the function must do and what "correct" looks like.

Step 4 matters more than it looks: a test that fails for the wrong reason (a typo, an unimported item) is not a
red test. Ask the learner to read the failure and confirm it is the assertion failing, not the compiler.

## Teaching the learner to write tests

The most common problems, roughly in order of frequency:

| Problem | What to say |
| :--- | :--- |
| No test at all | "What would have to be true for you to be confident this works?" |
| Testing implementation, not behaviour | "This test breaks if you rename a private function. What behaviour do you actually care about?" |
| One giant test | "If this fails, how do you know which part broke?" — ask for the first case only |
| No failure case | "What is the input you hope nobody sends?" |
| `assert!(result.is_ok())` | "If it fails, this tells you nothing. Assert the value." |
| Testing the mock, not the code | Rare at this level; mention it when a trait gets abstracted for the first time |
| Tests that are always green | "Change the implementation to return a wrong value. Does the test catch it?" |

Teach test naming as documentation: `parses_record_with_missing_field`, not `test1`.

## Test structure in Rust

- Unit tests in a `#[cfg(test)] mod tests` at the bottom of the file, testing internals.
- Integration tests in `tests/`, using the public API as a user would.
- Doc tests in doc comments — teach them when the learner starts documenting a public API.
- `Result`-returning tests (`fn t() -> Result<(), E>`) instead of `unwrap()` everywhere.
- `#[should_panic(expected = "...")]` sparingly; a `Result` assertion is usually better.
- `pretty_assertions` only if the learner complains about unreadable diffs — not preemptively.

## Fixtures and test data

- Small, inline, readable. A test that needs a 200-line fixture file is usually testing too much at once.
- Realistic data from the learner's actual use case beats invented data.
- When a fixture file is genuinely needed, put it in `tests/data/` or the project's convention, and name it
  after what it represents, not after the test that uses it.

## Debugging and TDD together

The strongest habit to install: **when a bug appears, first write a test that reproduces it.** Then fix. Then keep
the test.

```
bug report
  -> write a failing test that demonstrates the bug
  -> confirm it fails
  -> fix the code
  -> confirm green
  -> the bug can never come back silently
```

This is where TDD stops being a discipline and becomes obviously useful, and it usually lands better than
teaching the loop abstractly. Use the learner's own real bug for it.

## Refactoring

Green tests are permission to change structure. Teach:

- Small steps, running tests between them.
- Naming as the first refactor: functions that describe *what*, not *how*.
- Extracting a function when a block needs a comment to explain it.
- Replacing a `match` chain with `?`, a loop with an iterator, a `Vec` of separate values with a struct — one at
  a time, tests green after each.
- Knowing when to stop. Refactoring without a goal is its own failure mode; "I am making this easier to change
  *because* the next requirement is X" is the standard.

Do not refactor the learner's code for them. Ask what is bothering them about it, and let them do it.

## When the learner resists tests

Some learners see tests as overhead, especially those coming from languages where tests were rare. Do not argue
abstractly. Instead:

- Use their own bug, and show that the test would have caught it.
- Ask them to change a behaviour and see whether anything breaks.
- Point out that a test is the only part of the code that says what it was *supposed* to do.

If resistance persists, keep tests for anything that has been broken once, and let the rest go for a while. It
usually converts on its own.
