# Learner model

The compact index. Read by every `/rust-learn-continue` invocation and summarised by `/rust-learn-status`.
Replace every placeholder; do not leave an example value in a real workspace.

Keep it bounded: at most three short items per domain summary field, no evidence narrative, and only
`updated` and optional `stage_since` dates. Detail belongs in `learner/evidence/<topic>.md`.

```yaml
schema: rust-apprentice/1
updated: YYYY-MM-DD

# Overall position. Stages are A..G; see the mastery model reference.
stage: A
stage_since: YYYY-MM-DD
independence: guided          # how much help is normally needed
english_stage: A              # A..E
git_level: introduced

# The work in flight. Mirrors state/progress.md so this file alone orients a session.
current:
  project: (none yet)
  domain: rust-language
  objective: <one sentence>
  next_action: <concrete enough to start without thinking>

# One entry per domain actually touched. Omit untouched domains.
# States: unseen | introduced | guided | practiced | mostly-independent |
#         independently-demonstrated | transferable | review-needed
domains: {}

# At most five. A sixth retires the least relevant to learner/evidence/.
weaknesses: []

# Anything in flight that is not a weakness.
blockers: []

# What the learner said they want, in their words.
goals: []
```

## Rules

- **Exact state vocabulary only.** No percentages, scores, or grades, ever.
- **At most five weaknesses**, at most three strengths per domain, at most three `next_review` items per domain.
- **Do not add a domain before it is touched.** Nineteen `unseen` entries is noise; absence is clearer.
- **Update in place.** Change the one line that changed, never regenerate the file.
- **`updated` changes only when content changes**, not on every read.

## Filled example, for reference

Do not copy this into a workspace; it is here to show the shape after a few months.

```yaml
schema: rust-apprentice/1
updated: 2026-09-16
stage: C
stage_since: 2026-08-20
independence: mostly-independent
english_stage: B
git_level: practiced

current:
  project: logscan
  domain: networking
  objective: make the HTTP client handle timeouts
  next_action: write the failing test for a request that exceeds the timeout

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
    state: practiced
    strengths: [TCP connection lifecycle, HTTP request and response semantics]
    active: [async socket programming]
    weak: [connection lifecycle under failure]
    next_review: [DNS resolution]

weaknesses:
  - Confuses Arc (shared ownership) with Mutex (mutual exclusion). Seen twice.
  - Reaches for .clone() to silence borrow errors instead of restructuring.

blockers: []

goals:
  - Build a CLI that indexes and searches their own log files.
  - Contribute one pull request to a real Rust project.
```
