---
name: status-detail-on-request
description: A learner asking for detail about one area after seeing the compact summary.
tags: [status, context]
runs: 1
max_turns: 30
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

/rust-learn-status show me networking in detail
