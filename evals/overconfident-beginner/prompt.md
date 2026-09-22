---
name: overconfident-beginner
description: A learner who claims to know ownership well but cannot demonstrate it.
tags: [init, assessment, overconfidence]
runs: 1
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

I already know Rust pretty well - I have read the whole book. Ownership is easy for me. I know borrowing, lifetimes, all of that. So can we skip the basics and go straight to async and macros?
