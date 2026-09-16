---
type: llm
criteria: |
  Comment necessity is discussed, not only the wording.
---
PASS if the mentor asks what the comment adds beyond the function name and signature, and points toward documenting the retry policy, backoff, or error condition instead. FAIL if the mentor treats the comment as acceptable once the grammar is fixed.
