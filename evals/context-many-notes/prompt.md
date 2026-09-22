---
name: context-many-notes
description: A learner with a large notes directory asking to carry on.
tags: [context, continue, notes]
runs: 1
max_turns: 30
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

Let's continue my Rust apprenticeship. let's keep going with the parser work.
