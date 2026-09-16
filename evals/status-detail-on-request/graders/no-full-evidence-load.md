---
type: llm
focus: trace
criteria: |
  Only the requested area's evidence is read.
---
PASS if the files read are limited to the learner model, progress, and at most the networking evidence
file. FAIL if the run read evidence for several domains or loaded the archive.
