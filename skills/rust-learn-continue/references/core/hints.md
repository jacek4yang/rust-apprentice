# Hint ladder

How to help a stuck learner without doing the work for them. One rung at a time, always.

## The rungs

| Rung | What you give | Example |
| :--- | :--- | :--- |
| 1. Direction | Where to look, conceptually. No names. | "The problem is about what happens to the data when both variables try to own it." |
| 2. Naming | The concept, API, trait, compiler rule, crate feature, or architectural idea. | "This is a lifetime problem. Compare how long `line` lives with how long `lines` lives." |
| 3. Skeleton | Signatures, pseudocode, data flow, structure — no working body. | A signature and a `// TODO` body with a comment on what each step must do. |
| 4. Fragment | A small working piece, not the whole answer. | The `match` arm handling the error case; the learner still wires up the rest. |
| 5. Solution | The complete implementation. Last resort. | Say so explicitly, and require reproduction afterwards. |

## Rules

- **One rung per learner attempt.** Give a hint, then stop and wait. Never continue down the ladder because the
  learner is quiet — silence is usually thinking.
- **Record the rung used.** It is evidence. Reaching rung 4 to finish something is not independent mastery,
  whatever the final code looks like.
- **Escalate only on evidence of stuck, not of slow.** A learner working through a concept for a few minutes is
  learning. A learner who has tried, reported what happened, and is going in circles needs the next rung.
- **Rung 5 always comes with a job.** "Read it, then close it and rewrite it from memory" or "adapt it to this
  other case tomorrow". Otherwise the code was copied, not learned.
- **A learner who needed rung 2 and solved it has done well.** Say what they did, plainly. Do not inflate it into
  a triumph and do not apologise for the hint.

## What the rungs look like in practice

Learner is stuck writing a function that returns an error instead of panicking.

- Rung 1: "Look at how the function's caller would react if this failed. Should it be able to?"
- Rung 2: "The return type is where the decision lives. What would `Result<T, E>` say here that `T` cannot?"
- Rung 3: "Here is the signature with the error type left as a blank. Fill in the error type, then the body."
- Rung 4: "Here is the `From` impl you need to let `?` convert the error. The rest of the function is yours."
- Rung 5: the complete function.

## When the learner asks you to just write it

This is the single largest failure mode of the project, and it will happen often. Responses, in order:

1. Ask what they have tried and what happened.
2. Give rung 1 or 2.
3. Point at the exact documentation page or standard-library item and ask them to come back with what they found.
4. If genuinely stuck after all of that, write a **partial** skeleton and hand the rest back.
5. If the task is trivial boilerplate with no learning value — `Cargo.toml` metadata, a module declaration, a
   derive list — write it, and say why that one was not worth their time.

Never silently edit their file to fix an exercise. Never run a generator over their project to move past a
concept they have not demonstrated.

## The clarification that matters

Two rules that look contradictory:

- "Never write the learner's code."
- "Show a small example."

They are not contradictory. The rule is:

**You may write minimal illustrative examples. You may not write the learner's exercise or project code.**

An example that demonstrates a concept on a different problem is teaching. The implementation of the thing the
learner was asked to do is not.

## Copying

Learners copy from you or from documentation. It is normal and not a failing.

When you suspect or know they copied:

- Do not punish it. Note it.
- Soon after, require one of: explain it line by line; modify it to do something different; reproduce part of it
  from memory; use the same idea in a new context.
- Record the outcome of that check as the evidence, not the copied code.

## When to step backward

If advanced work reveals a missing foundation, the fix is a smaller problem, not a bigger hint. Go to
[domain-selection.md](domain-selection.md) and repair the prerequisite. Repeating a hint three times on a concept
the learner lacks the basis for teaches them that they cannot do it.

## Assistance tracking

Record how much help was needed, because it changes what you teach next:

| Highest rung needed | Meaning |
| :--- | :--- |
| none | independently demonstrated |
| 1-2 | independent enough to advance, but note it |
| 3-4 | practiced, not independent; revisit soon |
| 5 | introduced or guided; schedule a retrieval task |

The recorded rung is also how you detect that a topic is too hard for now versus the learner being tired. Three
sessions at rung 4 on the same topic is a sequencing problem, not a persistence problem.
