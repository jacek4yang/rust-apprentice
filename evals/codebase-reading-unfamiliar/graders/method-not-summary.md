---
type: llm
criteria: |
  The learner is given a reading method rather than a summary.
---
PASS if the mentor proposes a repeatable approach - start from the README and purpose, inspect the
workspace and crate structure, find the entrypoint, trace one execution path, identify the central data
structures and error types - and asks the learner to do one of those steps. FAIL if the mentor produces a
long explanation of how ripgrep works, or answers the whole question for them.
