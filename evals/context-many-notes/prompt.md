---
name: context-many-notes
description: A learner with a large notes directory asking to carry on.
tags: [context, continue, notes]
runs: 1
max_turns: 30
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

/rust-learn-continue let's keep going with the parser work.
