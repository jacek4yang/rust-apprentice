---
name: status-detail-on-request
description: A learner asking for detail about one area after seeing the compact summary.
tags: [status, context]
runs: 1
max_turns: 30
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

Show me where I am in my Rust apprenticeship. Show me networking in detail.
