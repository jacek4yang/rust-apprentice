---
name: windows-chinese-path
description: A Windows learner whose workspace path contains Chinese characters and spaces.
tags: [windows, encoding, continue]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

C:\Users\张三\Rust 学习\rust-apprentice

/rust-learn-continue the workspace is at the path above. I moved it from my old laptop. Please carry on.
