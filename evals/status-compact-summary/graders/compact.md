---
type: llm
criteria: |
  The report is a summary rather than a document.
---
Expected shape: the domains touched, the strongest areas, the highest-value weaknesses, the current project with
its next action, and recent evidence - optionally a stage line and a trajectory. Empty sections are omitted.

PASS if the report is that shape, even when it is thorough. Detail within the intended sections is not a failure.

FAIL only if the report does one of these: prints the curriculum or a roadmap; lists individual concepts instead
of domains; narrates the learner's history as prose; reproduces the learner model file verbatim; or runs past
roughly six sections or several screens.
