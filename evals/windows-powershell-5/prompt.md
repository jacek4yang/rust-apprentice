---
name: windows-powershell-5
description: A learner on Windows PowerShell 5.1, where encoding and syntax defaults differ.
tags: [windows, encoding, continue]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

Let's continue my Rust apprenticeship. I'm on Windows and my PowerShell is version 5.1. I need to search my project for a
function. Can you give me a command?
