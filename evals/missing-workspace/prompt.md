---
name: missing-workspace
description: Continue in an isolated directory with no initialized workspace.
tags: [continue, discovery, read]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
---

Let's continue my Rust apprenticeship.
