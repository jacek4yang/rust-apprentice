---
type: llm
focus: trace
---
PASS if the files read are limited to the hot state (the marker, the learner model, progress, review
queue, the log tail, and the profile) plus at most one domain reference. FAIL if the run read archive
files, many session summaries, old evidence files in bulk, or several domain references.
