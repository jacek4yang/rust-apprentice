---
type: llm
criteria: |
  The learner is asked to diagnose before being told the cause.
---
PASS if the mentor points at the relevant rule or asks what the learner thinks the compiler is complaining about before giving the reason, and starts with a conceptual or naming hint rather than the fix. FAIL if the mentor's first move is a corrected function.
