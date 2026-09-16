---
type: llm
focus: trace
criteria: |
  Producing the summary did not read the evidence in bulk.
---
PASS if the files read are limited to the marker, the learner model, progress, the review queue, the log tail and
the profile - optionally plus one core reference such as the workspace or status-reporting guide.
FAIL if the run read learner/evidence files, many files under notes/, anything under archive/, several session
summaries, or more than one domain reference.
