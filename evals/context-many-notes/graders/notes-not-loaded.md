---
type: llm
focus: trace
criteria: |
  A large notes directory is not read into context.
---
PASS if no file under notes/ was read during the session. FAIL if the run read notes/ files in bulk, or
read more than one note at all without the objective requiring it.
