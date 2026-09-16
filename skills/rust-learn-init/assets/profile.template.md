<!--
Template for <workspace>/learner/profile.md — filled in by /rust-learn-init, updated rarely.

Two rules:
  - Claims and observations are separate sections, and never merged.
  - Everything is English. The learner may read it; write it so they can.
-->

# Learner profile

updated: YYYY-MM-DD

## Who

name: <!-- what to call them, or "unspecified" -->
location/timezone: <!-- only if volunteered; matters for scheduling language -->
conversation language: Chinese
english stage: A <!-- A..E, see skills/rust-learn-continue/references/english.md -->

## Environment

os: <!-- Windows 11 / macOS / Linux distro -->
editor: <!-- VS Code, RustRover, vim, ... -->
toolchain: <!-- `rustc --version` / `cargo --version`, or "not installed" -->
notes: <!-- proxy needs, slow disk, remote machine, WSL, unusual setup -->

## Availability

per week: <!-- e.g. "6-8 hours, evenings" -->
session length: <!-- e.g. "30-60 minutes" -->
constraints: <!-- work travel, exams, anything that changes pacing -->

## Claims

Self-reported, recorded as claims and not as fact. Date each one.

- 2026-09-16 — "I know ownership well." (claim)
- 2026-09-16 — "My Git is fine, I use it at work." (claim)
- 2026-09-16 — "I can read English docs but writing is hard." (claim)

## Observations

What was actually demonstrated during initialization and since. Factual, specific, dated.

- 2026-09-16 — Correctly explained that `let s2 = s1;` transfers ownership; could not say when the value is
  dropped.
- 2026-09-16 — Described `&T` / `&mut T` as read-only vs writable; did not mention exclusivity.

## Interests and goals

What they want to build, in their words. Concrete outcomes.

- Build tools for their own log files.
- Wants to understand networking properly, "not just call an API".
- Interested in CLI tools and, later, backend services.

## Provisional starting point

phase: fundamentals
first topics: ownership and borrowing, then `Result` and `?`
reasoning: reads Rust syntax confidently, ownership model is verbal rather than structural

## Other

Anything that changes how you teach: strong maths, no formal CS background, dyslexia, dislikes long text, prefers
video, previously bounced off Rust once. Record it because it is useful, not because it is a label.
