#!/usr/bin/env bash
# Builds a realistic apprenticeship workspace so the case tests the architecture rather than an empty directory.
set -eu
WS="rust-apprentice-workspace"
mkdir -p "$WS/learner/evidence" "$WS/state/sessions" "$WS/notes" "$WS/projects/logscan"
cat > "$WS/rust-apprentice.yaml" <<'YAML'
schema: rust-apprentice/1
workspace: rust-apprentice
name: Test workspace
created: 2025-09-01
learner: learner/profile.md
state: state/progress.md
learner_model: state/learner-model.md
review_queue: state/review-queue.md
YAML
cat > "$WS/state/learner-model.md" <<'YAML'
schema: rust-apprentice/1
updated: 2026-09-16
stage: C
stage_since: 2026-06-01
independence: mostly-independent
english_stage: B
git_level: practiced
current:
  project: logscan
  domain: testing
  objective: add an integration test for the index writer
  next_action: write the failing test for the next slice
domains:
  rust-language:
    state: mostly-independent
    strengths: [pattern matching, iterators, traits]
  ownership-memory:
    state: mostly-independent
    strengths: [moves, borrows]
    weak: [lifetime elision when returning references from methods]
  testing:
    state: practiced
    strengths: [integration tests, table-driven tests]
  networking:
    state: developing
    strengths: [TCP connection lifecycle, HTTP request and response semantics]
    active: [async socket programming]
    weak: [connection lifecycle under failure]
  codebase-reading:
    state: practiced
  cryptography:
    state: introduced
  git-github:
    state: practiced
  engineering-english:
    state: guided
weaknesses:
  - Confuses Arc (shared ownership) with Mutex (mutual exclusion). Seen twice.
  - Reaches for .clone() to silence borrow errors instead of restructuring.
blockers: []
goals:
  - Build a CLI that indexes and searches their own log files.
YAML
cat > "$WS/state/progress.md" <<'MD'
# Progress

updated: 2026-09-16
phase: project

## Objective

add an integration test for the index writer
started: 2026-09-10
status: in-progress

## Next action

write the failing test for the next slice

## Blockers

- (empty)
MD
cat > "$WS/state/review-queue.md" <<'MD'
# Review queue

updated: 2026-09-16

## Due

| Concept | Due | Attempts | Last result |
| :--- | :--- | :--- | :--- |
| borrows and lifetimes | 2026-09-16 | 2 | partial |

## Scheduled

| Concept | Due | Attempts | Last result |
| :--- | :--- | :--- | :--- |
| HTTP response semantics | 2026-09-22 | 1 | pass |

## Retired

- `let`/`mut` basics - 3 clean retrievals, retired 2026-07-02.
MD
cat > "$WS/state/log.md" <<'MD'
# Log

- 2026-09-16 - Continued the testing slice; needed a rung-2 hint on lifetimes.
- 2026-09-14 - Wrote integration tests unaided.
- 2026-09-10 - Started the logscan slice.
MD
cat > "$WS/state/sessions/2026-09-16.md" <<'MD'
# 2026-09-16

focus: add an integration test for the index writer
did: learner wrote the failing test; needed one hint
left: the timeout path is unimplemented
next: write the failing test for the next slice
MD
cat > "$WS/learner/profile.md" <<'MD'
# Learner profile

updated: 2026-09-16
conversation language: Chinese
english stage: B
os: Windows 11
editor: VS Code
toolchain: rustc 1.90

## Claims

- 2026-06-01 - "I know ownership well." (claim)

## Observations

- 2026-09-14 - Resolved overlapping borrows without help.
MD
mkdir -p "$WS/learner/evidence"
cat > "$WS/learner/evidence/networking.md" <<'MD'
# Networking evidence

2026-09-14 - Explained the TCP handshake and the HTTP request lifecycle unaided.
2026-09-16 - Needed a hint to describe connection reuse under failure.
MD
cat > "$WS/learner/evidence/rust.md" <<'MD'
# Rust evidence

2026-09-14 - Implemented Result-based error propagation in `parse_record` without help.
MD
for i in $(seq 1 40); do
  echo "# Note $i" > "$WS/notes/topic-$i.md"
  echo "A note the learner wrote. Not session context." >> "$WS/notes/topic-$i.md"
done
echo "workspace scaffolded"
