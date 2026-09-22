---
name: experienced-new-to-rust
description: A senior developer with ten years of Python and no Rust asks how to start.
tags: [init, onboarding, transfer]
runs: 1
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

I have been writing Python for 10 years, mostly backend services. I have never touched Rust. I want to learn it properly. Where do we begin?
