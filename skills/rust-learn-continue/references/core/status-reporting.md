# Status reporting

How `/rust-learn-status` behaves. Two layers: a compact default, and detail only on request.

## Invariants

1. **Never load domain evidence to produce the default summary.** `state/learner-model.md` is the source. That is
   what makes this command cheap regardless of how long the apprenticeship has run.
2. **Never print every tracked skill.** Domains, not concepts. Nineteen lines at most, and only the domains that
   have been touched.
3. **Never invent a date.** Estimate horizons as ranges, and only from demonstrated evidence.
4. **Never show a percentage, score, or grade.** Mastery states only.
5. **Never add a command.** Detail is shown conversationally, in the same session, on request.

## Default output

Compact and readable. Roughly one screen. The learner should be able to see where they are in a few seconds.

```
Rust apprenticeship — 2026-09-16

Stage C — Independent small-project developer (since 2026-08-20)
Normally needs: light hints

  Rust Language               mostly independent
  Ownership & Memory          mostly independent
  Data Structures & Algorithms  guided
  Operating Systems           introduced
  Networking                  developing
  Cryptography                introduced
  Concurrency                 guided
  Async Rust                  guided
  Software Architecture       developing
  Codebase Reading            practiced
  Git / GitHub                practiced
  Engineering English         developing

Strongest right now
  Ownership and borrowing — solved three borrow-checker problems unaided this month.
  Testing — writes integration tests without being asked.

Highest-value gaps
  Arc vs Mutex — confused twice, still active.
  Connection lifecycle under failure — no retry or timeout work yet.

Current work
  logscan — HTTP client timeout handling.
  Next: the failing test for a request that exceeds the timeout.

Recent evidence
  Implemented Result-based error propagation in parse_record unaided (2026-09-15).
  Wrote a clear imperative commit message without help (2026-09-14).

Trajectory
  Strong independent Rust developer: roughly several months at your recent pace.
  Production-capable advanced engineer: a longer horizon, needing substantial project experience.
  Senior-level capability: cannot be estimated from study time — it requires sustained ownership
  of complex systems.
```

Omit any section with nothing in it. If the learner has just started, the output is three lines, not a wall.

## Reading the source

Read only:

- `state/learner-model.md` — the domain index, stage, weaknesses, current work
- `state/progress.md` — the exact next action
- The last few lines of `state/log.md` — recent events

Do not read `learner/evidence/`, `notes/`, `archive/`, or the curriculum. If the learner model is missing a
domain they clearly worked on, fix the model.

## Trajectory and time estimates

Provide an approximate horizon, never a date, and never a single number.

Estimate from, in order of weight:

| Signal | Effect on the estimate |
| :--- | :--- |
| Independence — how much help is normally needed | strongest |
| Difficulty and completeness of finished projects | strong |
| Debugging ability | strong |
| Code-reading ability | strong |
| Retention across reviews | moderate |
| Systems understanding (OS, network, memory) | moderate |
| Technical English | moderate |
| Git and GitHub fluency | moderate |
| Recent deliberate practice per week | moderate |
| Elapsed time | weakest |

Distinguish **Rust proficiency** from **professional engineering maturity** explicitly. A learner can be a strong
independent Rust developer while still years from senior engineering capability, and conflating the two is
unkind as well as inaccurate.

Report each horizon with its own justification:

- *Strong independent Rust developer* — a real estimate, in months, at their recent pace.
- *Production-capable advanced engineer* — a longer horizon; state that it needs substantial real project
  experience, not more study.
- *Senior-level capability* — state plainly that it cannot be inferred from study time. It requires sustained
  ownership of complex systems and engineering decisions, usually in a professional setting.

As evidence accumulates, the ranges may narrow. They must never become promises.

## Detail on request

When the learner asks about a specific area — "show me networking in detail", or "how am I
deeper, but only for that area:

1. Read that domain's section in `learner/evidence/` (one file, not all of them).
2. Summarise strengths, active items and weaknesses with the concrete observations behind them.
3. Say what would move the state up, in one sentence.

Do not preload any of this. Load it when asked, and keep it to the area asked about.

## What not to do

- Do not print the curriculum, the roadmap, or a topic checklist.
- **Never report hint-ladder rungs.** "Needed a rung-2 hint" is internal diagnostics leaking into a
  learner-facing report, and it reads as a rating. Say "needed a nudge on lifetimes", or "worked it out once you
  were pointed at the borrow rule". The rung number belongs in `state/learner-model.md` and the evidence files,
  never in what the learner is shown.
- Do not report internal state vocabulary either. "reaches practiced in the next few sessions" describes the
  mentor's own bookkeeping. Describe the capability instead.
- Do not show mastery for concepts the learner has not worked on.
- Do not compare the learner to other learners or to a schedule.
- Do not soften a weakness into vagueness. "Confused Arc with Mutex twice" is more useful than "still developing
  in concurrency".
- Do not offer to "run a full assessment". Assessment is continuous; there is nothing to run.
- Do not end with encouragement. End with the next action or the answer to what was asked.

## After reporting

If the learner asks to continue, hand back to `/rust-learn-continue` behaviour — but do not require them to type
it again. Just continue the work, since the objective is already loaded.

If the status revealed a due review or an active weakness worth working on now, say so in one line and offer to
start there.
