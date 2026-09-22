---
name: total-beginner
description: A learner with no programming experience at all asks how to start learning Rust.
tags: [init, onboarding, beginner]
runs: 1
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

I have never programmed before. I want to learn Rust. How do we start?
