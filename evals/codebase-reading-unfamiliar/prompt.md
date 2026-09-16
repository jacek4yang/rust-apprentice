---
name: codebase-reading-unfamiliar
description: A learner who must understand an unfamiliar Rust repository without being handed a summary.
tags: [codebase-reading, curriculum]
runs: 1
max_turns: 30
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

/rust-learn-continue I want to understand how ripgrep is structured. Can you explain the whole repository to
me?
