# Initial assessment

Self-assessment is a hypothesis. This file describes how to test it in a few minutes, without the learner feeling
examined.

## Purpose

By the end of initialization you need three things:

1. A rough starting point for the Rust curriculum.
2. A calibration of how the learner reads their own ability.
3. Two or three concrete observations to record as the first evidence, so `/rust-learn-continue` starts from facts
   rather than claims.

You do not need a level, a score, or a complete picture. A few sessions of real work will tell you more than an
hour of questions.

## Rules

- **Two to four probes total.** Not more. Initialization should take minutes.
- **One probe per message.** Ask, wait, respond, then the next.
- **Never announce a test.** Frame each probe as curiosity about how they think: "I want to see how you approach
  this" is fine; "let me assess you" is not.
- **Respond honestly to each answer.** Say what was right and what was off, and name the specific misconception.
  Being told the truth early is the strongest signal that this mentor is worth listening to.
- **Do not teach the whole answer.** Correct the misconception in two sentences and move on; the full treatment
  comes in a later session.
- Record the probe and the outcome, not a verdict about the learner.

## Choosing probes

Pick probes that discriminate, and pick the ones that test the claims they just made. A learner who said "I know
ownership" gets the ownership probes. A learner who said "I've never used Rust" gets probes from the very bottom,
which will be about programming generally rather than Rust.

### Zero Rust experience

Goal: find out whether the *transferable* knowledge is there — variables, functions, types, loops, conditionals,
and whether they have used a typed language.

- "In the language you know best, what happens if you use a variable before assigning it? Does it even compile?"
- "What is a function parameter, in your own words? What is a return value?"
- "What does this print?" — a five-line snippet with a loop and a counter, in Rust, with comments explaining
  anything unfamiliar.

If they can read the snippet and predict it, they will move through early Rust quickly and the real work starts at
ownership.

### Claims ownership or borrowing

- "In your own words, why does this fail to compile?" — the classic two-value move:
  ```rust
  let s1 = String::from("hello");
  let s2 = s1;
  println!("{s1}");
  ```
  Looking for: the value was moved, `s1` is no longer valid. A learner who says "it's a borrow issue" has the
  words but not the model; a learner who says "`s2` took ownership" has the model.
- "What is the difference between `&T` and `&mut T`?" — looking for exclusive vs shared access, and that this is
  enforced at compile time.
- The same ownership probe should be given even to confident learners. It is the single most discriminating
  question in the early curriculum.

### Claims experience with a systems or typed language

Move up: `Option`/`Result`, iterators, traits, or a lifetime question.

- "Why does Rust not have `null`? How does that change how you write a function that might not find something?"
- "What does `?` do, and what does it need from the error type?"
- "Given this function signature, what does the `'_` here mean?" — give a signature with an elided lifetime.

### Git

Ask about a command's effect *before* running it:

- "What does `git reset --hard HEAD~1` do? What is lost?"
- "What is the difference between `git pull` and `git fetch`?"
- "You committed to `main` by mistake — what would you do?"

A learner who says "I'd `reset --hard`" without mentioning the risk is a learner who needs the safety material
early. A learner who distinguishes `revert` from `reset` is genuinely comfortable.

### English

Do not test English separately — it shows up everywhere. Note:

- Whether they write identifiers in English in the code they produce.
- Whether they can read a doc line you show them, and what they take from it.
- Whether they write a comment in English when asked, and how they phrase it.
- Their stated comfort, recorded as a claim.

### Compiler errors

Show a real error and ask what it means before explaining:

```
error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable
```

Ask: "which line do you think is the problem, and what is Rust unhappy about?" Their ability to read diagnostics
predicts their independence more reliably than their Rust knowledge.

## Reading the results

Classify provisionally, and write the classification as a *hypothesis* in `learner/profile.md`:

| Observation | Starting point |
| :--- | :--- |
| No programming background | First language fundamentals, gentle pacing, no compiler theory yet. |
| Programming background, no Rust | Start at ownership, after a fast pass over syntax. |
| Some Rust from a tutorial | Start at ownership with harder probes; tutorials often leave this concept fake. |
| Claims Rust competence and passes the probes | Start at traits/`Result`/iterators; expect to slow down at lifetimes. |
| Claims Rust competence and fails the probes | Start at ownership anyway, without comment. The claim goes in the profile as a claim, and the observation goes next to it. |
| Strong Git, weak Rust | Normal; Git is orthogonal. Do not conflate. |
| Weak Git, strong Rust | Introduce Git alongside the first project, where it earns its place. |

Never tell the learner "you are at level X". Describe what you observed, in two or three sentences, in terms of
what you will do next: "we'll start with ownership, since that's where your explanation was confident but the
move rule wasn't quite there."

## Recording

Into `learner/profile.md`:

- Their claims, labelled as claims, with the date.
- The probes you ran, briefly, and what happened.
- Provisional starting phase.
- English stage (A, per [engineering-english.md](../../rust-learn-continue/references/curriculum/engineering-english.md)).

Into `learner/evidence/rust.md` (create it):

- One entry per probe, in the factual style of
  [assessment.md](../../rust-learn-continue/references/core/assessment.md).

Example:

```
2026-09-16 — Initial probe: correctly identified that `let s2 = s1;` makes `s1` unusable, and said
"ownership moved to s2". Could not explain when the value is actually dropped.

2026-09-16 — Initial probe: described `&T` and `&mut T` as "read-only and writable", but did not
mention that the compiler forbids both existing at once.
```

That is a better starting point than any self-description, and it is what the next session will read.
