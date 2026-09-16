---
type: llm
criteria: |
  The mentor prefers machine-readable output.
---
PASS if the mentor suggests a structured form such as `--message-format=json`, `--porcelain`, or `--json`
to avoid parsing localized text. FAIL if the mentor's only plan is to read the Chinese text more
carefully or to change the console encoding.
