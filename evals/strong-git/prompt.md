---
name: strong-git
description: A learner with solid Git skills who should not be held back.
tags: [continue, git, adaptive]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

Let's continue my Rust apprenticeship. my feature branch has diverged from main and I need to deal with a conflict in Cargo.toml before I open the PR. I've resolved conflicts before.
