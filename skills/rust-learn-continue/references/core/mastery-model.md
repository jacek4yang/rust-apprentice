# Mastery model

What the mentor tracks, at what granularity, and what counts as evidence. Kept deliberately small, because this
is the layer that must never grow unbounded.

## Two levels, no numbers

**Domain level** — one of the nineteen domains in [curriculum/index.md](../curriculum/index.md). Each has a single
mastery state and a short list of strengths, active items and weaknesses. This is what `state/learner-model.md`
holds, and it is what `/rust-learn-status` reports.

**Concept level** — individual skills inside a domain (`Arc` versus `Mutex`, nonce reuse, cache-line false
sharing). Concepts live in `learner/evidence/<topic>.md` and in the review queue. They are read on demand, never
loaded wholesale.

There are no percentages, scores, grades, or points anywhere in this system. A number would be false precision
and would invite the learner to optimise for it.

## Mastery states

Use exactly these words.

| State | Meaning |
| :--- | :--- |
| `unseen` | Never encountered. |
| `introduced` | Seen it, with help. Could not use it alone. |
| `guided` | Can use it while being walked through, or with strong hints (rung 3 or deeper). |
| `practiced` | Used it alone at least once in a familiar setting, possibly with light hints. |
| `mostly-independent` | Uses it correctly without hints in familiar settings; still slips in new ones. |
| `independently-demonstrated` | Used it correctly, unprompted, on a task they had not seen before. |
| `transferable` | Applied it correctly in a genuinely different context, days or more apart. |
| `review-needed` | Was solid, then failed a retrieval or a reuse. Back into the queue. |

Domain states advance more slowly than concept states, because a domain is a summary of many concepts. A domain
reaches `mostly-independent` when its central concepts are there and the learner no longer needs the domain
reference for ordinary work.

## What counts as evidence

Strongest to weakest:

1. **Solved independently** on a task they had not seen, without hints.
2. **Explained independently**, in their own words, matching the real rule including its limits.
3. **Debugged independently** — located the fault and fixed it themselves.
4. **Transferred** the idea correctly to a different problem, crate, or domain.
5. **Recalled after a delay** — retrieved correctly a week or a month later.
6. **Read the documentation** unaided and used it correctly.
7. **Read unfamiliar code** and formed a correct mental model of it.
8. **Designed something** — an API, a data structure choice, a module boundary — and defended it.
9. **Diagnosed a system behaviour** — a concurrency bug, a network problem, an OS interaction, a performance
   regression.
10. **Wrote a professional artefact** — a commit message, PR description, review comment, or technical
    explanation in English.
11. **Self-assessment** — a hypothesis. Never evidence on its own.

Two items from the top half beat ten from the bottom.

## What is never evidence

- Elapsed time.
- Number of sessions.
- Learner confidence, however stated.
- Number of notes written.
- Number of projects started, or generated.
- A copied artefact that compiled.

## Recording

`state/learner-model.md` holds the domain index and the active weaknesses — small, bounded, read every session.
`learner/evidence/<topic>.md` holds the detail, append-only, read on demand.

Example domain entry:

```yaml
networking:
  state: practiced
  strengths:
    - TCP connection lifecycle
    - HTTP request and response semantics
  active:
    - async socket programming
  weak:
    - connection lifecycle under failure
  next_review:
    - DNS resolution
```

Example evidence entries:

```
2026-09-16 — Implemented Result-based error propagation in `parse_record` without help after
reading the `?` operator docs himself. Chose to map the error type rather than unwrap.

2026-09-18 — Needed a direct hint (naming the borrow rule) to resolve two overlapping mutable
borrows in the cache struct. Explained the rule correctly afterwards when asked.

2026-09-21 — Explained why Arc is needed for shared ownership across threads, but believed Arc
also provides mutual exclusion; confused shared ownership with synchronisation.
```

Never write: "Rust level improved", "good progress today", "clearly talented". Write what happened.

## Active weaknesses

A weakness is active if it has appeared twice, or once in a way that blocked progress. Keep at most five in the
learner model — the list steers the next session, it is not a scorecard. A sixth weakness retires the least
relevant one into evidence. A weakness retrieved correctly three times across separate sessions retires.

## Regressing

A concept at `independently-demonstrated` that fails a review after two weeks goes to `review-needed`. Say so
plainly and without drama: "this one has slipped, we'll pick it up again next session".

A learner needing heavy hints after weeks of independent work is tired, distracted, or on something harder than
it looked. Diagnose which and adjust the next session rather than pushing through.

## Milestones

The learner moves through stages. These are descriptions of demonstrated capability, not certifications, and are
never awarded for elapsed time.

| Stage | Characterised by |
| :--- | :--- |
| A — Guided beginner | Needs explanation and structure; writes code with substantial guidance. |
| B — Independent Rust fundamentals | Solves small problems unaided; ownership is no longer an obstacle. |
| C — Independent small-project developer | Plans and completes small projects; tests; uses Git in a basic workflow. |
| D — Intermediate systems-oriented developer | Reasons about OS, network and memory behaviour; uses concurrency or async correctly; reads unfamiliar codebases. |
| E — Production-capable engineer | Owns a substantial project end to end: architecture, reliability, performance, observability, review, releases. |
| F — Advanced independent engineer | Works in unfamiliar mature repositories; makes and defends design decisions; debugs complex failures; contributes upstream. |
| G — Senior-level capability | Sustained ownership of complex systems; correct judgement under uncertainty; effective communication; reviews others well. |

Promotion between stages requires evidence beyond syntax: architecture, maintenance, debugging, reliability,
performance, review, unfamiliar code, independent judgement, project ownership, and communication. Stage G in
particular cannot be inferred from study time at all — it requires sustained ownership of real systems.

## English and Git are tracked the same way

English has stages A to E in [engineering-english.md](../curriculum/engineering-english.md); Git and GitHub have
their own progression in [git-github.md](../curriculum/git-github.md). Both are recorded in `learner/profile.md`
and reported by `/rust-learn-status` alongside the domains, because they are engineering capabilities, not
auxiliary subjects.
