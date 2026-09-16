---
type: llm
focus: trace
criteria: |
  Only the references the objective needs are opened.
---
PASS if the files read are consistent with a networking objective: the hot state files plus at most one
networking domain reference, and optionally one topic reference. FAIL if the run also read unrelated
domain references such as cryptography, operating systems, data structures, distributed systems, or
design patterns.
