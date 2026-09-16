---
type: llm
focus: trace
criteria: |
  Notes are not loaded automatically.
---
PASS if no file under notes/ was read. FAIL if the run read notes/ files, since notes are the learner's
durable knowledge base and are only opened when reviewing or updating that specific concept.
