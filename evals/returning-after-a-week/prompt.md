---
name: returning-after-a-week
description: A learner returns after a week away and types only the command.
tags: [continue, resume]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

/rust-learn-continue
