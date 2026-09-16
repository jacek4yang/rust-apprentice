# Assessment

The mentor maintains a continuously updated model of what the learner can do. This file defines what counts as
evidence, how to record it, and the vocabulary for it.

## Why self-report is weak evidence

Learners systematically overestimate themselves, especially early. "I know ownership" usually means "I have read
the ownership chapter". "My Git is fine" usually means "I have run `git commit -a -m update`". This is not
dishonesty; it is an absence of calibration, and they cannot calibrate without feedback.

So: record self-assessment, but as a *claim*, and never let it decide pacing on its own.

## Evidence strength

Strongest to weakest:

1. **Code the learner wrote** for a task they were not shown how to do.
2. **Predictions** about behaviour or compilation that turned out correct, with a correct reason.
3. **Debugging** performed by the learner: locating the fault and fixing it themselves.
4. **Explanations in their own words** that match the real rule, including its limits.
5. **Recall after elapsed time** — the same concept retrieved correctly a week or a month later.
6. **Transfer** — the same idea applied correctly to a different problem, crate, or domain.
7. **Reading documentation unaided** and using it correctly.
8. **Language artefacts**: commit messages, PR descriptions, code comments, review comments they wrote.
9. **Process artefacts**: Git operations performed correctly, CI interpreted correctly, PR workflow followed.
10. **Self-assessment** — a hypothesis, never a conclusion.

Two items from the top half of this list beat ten from the bottom half.

## What each signal is worth

| Observation | Inference |
| :--- | :--- |
| Solved with no hints, unprompted verification | move the concept up one state |
| Solved after a rung-1 or rung-2 hint | still independent enough to advance, but note the hint |
| Solved only after a rung-3 or rung-4 hint | `practiced`, not independent. Revisit soon. |
| Needed the full solution | `introduced` or `guided`. Schedule a retrieval task. |
| Explained correctly in their own words | counts as comprehension, but not yet implementation |
| Predicted wrong, then corrected after the rule | comprehension forming; re-ask in a week |
| Applied the same idea in a new context unaided | `transferable` — this is the goal state |
| Failed a recall test on something previously solid | drop the state, put it back in the queue |

## Mastery states

Use exactly these words. Do not invent percentages, scores, or grades.

| State | Meaning |
| :--- | :--- |
| `unseen` | Never encountered. |
| `introduced` | Seen it, with help. Could not use it alone. |
| `guided` | Can use it while being walked through, or with strong hints (rung 3+). |
| `practiced` | Has used it alone at least once in a familiar setting, possibly with light hints. |
| `mostly-independent` | Uses it correctly without hints in familiar settings; still slips in new ones. |
| `independently-demonstrated` | Used it correctly, unprompted, on a task they had not seen before. |
| `transferable` | Applied it correctly in a genuinely different context, days or more apart. |
| `review-needed` | Was solid, then failed a recall or a reuse. Back into the queue. |

State changes need a concrete observation behind them. If you cannot name the moment, do not change the state.

## Writing evidence down

Evidence goes in two places.

**`learner/evidence/<topic>.md`** — chronological, per topic, append-only. Each entry is one or two factual
sentences with a date. This is where the nuance lives, and it is only read when a specific question requires it.

Good entries:

```
2026-09-16 — Implemented Result-based error propagation in `parse_record` without help after
reading the `?` operator docs himself. Chose to map the error type rather than unwrap.

2026-09-18 — Needed a direct hint (naming the borrow rule) to resolve two overlapping mutable
borrows in the cache struct. Explained the rule correctly afterwards when asked.

2026-09-21 — Explained why Arc is needed for shared ownership across threads, but believed Arc
also provides mutual exclusion; confused shared ownership with synchronization.
```

Bad entries:

```
2026-09-16 — Good progress on error handling today. Rust level improving.
2026-09-18 — Struggled a bit with borrows.
```

**`state/progress.md`** — the current summary. Only the states that matter now, plus active weaknesses and
blockers. Detail stays in the evidence files.

## Active weakness tracking

A weakness is active if it has appeared in the learner's work twice, or once in a way that blocked progress.

Keep at most five active weaknesses in `state/progress.md`. When a sixth appears, retire the least relevant one
into evidence — the list is for steering the next session, not for keeping score. A weakness that has been
retrieved correctly three times across separate sessions moves to the retired list.

## Re-calibrating downwards

Learners regress, and mentors notice:

- A concept marked `independently-demonstrated` that fails a review after two weeks goes back to
  `review-needed`. Say so plainly, without drama: "this one has slipped, we will pick it up again next session".
- A learner who needs heavy hints after weeks of independent work is tired, distracted, or on a topic more
  difficult than it looked. Diagnose which, and adjust the next session rather than pushing through.

## Calibrating the mentor's own accuracy

Occasionally check yourself. If you recorded a concept as `independently-demonstrated` and the learner cannot
reproduce it a week later, the earlier record was wrong. Fix the record rather than the learner's confidence.

## What never goes in the record

- Flattering language ("excellent", "great progress", "clearly talented").
- Percentages, levels, scores, or anything with a decimal point.
- Predictions about the learner's future ability.
- Anything you did not observe in a session.
