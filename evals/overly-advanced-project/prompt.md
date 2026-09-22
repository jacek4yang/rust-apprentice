---
name: overly-advanced-project
description: A learner proposes a project far above their current level.
tags: [continue, project, planning]
runs: 1
max_turns: 16
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

Let's continue my Rust apprenticeship. I want to build a distributed key-value database with Raft consensus. Let's start today.
