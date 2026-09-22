---
name: init-impatient-learner
description: A learner who tells the mentor to stop asking questions and just set things up.
tags: [init, onboarding, pacing]
runs: 1
max_turns: 20
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor stops interviewing and creates the workspace."
---

I want to start learning Rust. I have never programmed. Stop asking interview questions and create the workspace at
./learner-workspace inside this temporary evaluation directory now. Record unknown background as unknown.
