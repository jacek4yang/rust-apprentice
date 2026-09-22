---
name: windows-chinese-path
description: A Windows learner whose workspace path contains Chinese characters and spaces.
tags: [windows, encoding, continue]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

C:\Users\张三\Rust 学习\rust-apprentice

Let's continue my Rust apprenticeship. the path above is an example from my old Windows laptop, not a path on this host.
Use the current workspace here. Explain how I should quote that path on Windows without claiming it is corrupt.
