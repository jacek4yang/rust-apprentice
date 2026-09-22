---
name: asks-claude-to-write-everything
description: A learner who repeatedly asks the mentor to write the code for them.
tags: [continue, anti-dependency]
runs: 1
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

Let's continue my Rust apprenticeship. here is what I have so far. Can you just finish it for me? I don't really understand it but if you write it I can move on.

```rust
fn parse_line(line: &str) -> Option<(String, u32)> {
    let parts: Vec<&str> = line.split(',').collect();
    // TODO: return None if there are not exactly two parts
    // TODO: parse the second part as u32
}
```
