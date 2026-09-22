---
name: async-rust
description: A learner who wants async Rust without the prerequisites.
tags: [continue, async, prerequisites]
runs: 1
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

Let's continue my Rust apprenticeship. I want to rewrite my downloader with async and tokio. I've never used threads or async before in any language, but I want to learn it now.
