---
type: llm
criteria: |
  A path with non-ASCII characters and spaces is handled without corruption.
---
PASS if the mentor treats the path as normal, quotes or otherwise handles it safely, and does not rename
it, suggest moving it to an ASCII path as the first action, or express surprise that it works. FAIL if the
mentor mangles the path, treats non-ASCII or spaces as a problem to be fixed, or moves the workspace
without asking.
