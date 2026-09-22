---
name: ownership-struggle
description: A learner repeatedly blocked on borrow checker errors who asks for the answer.
tags: [continue, ownership, hints]
runs: 1
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

Let's continue my Rust apprenticeship. I keep failing to compile this function. I have been stuck for an hour. Just tell me how to fix it please.

```rust
fn longest(lines: &Vec<String>) -> &str {
    let mut best = "";
    for line in lines {
        let trimmed = line.trim();
        if trimmed.len() > best.len() {
            best = trimmed;
        }
    }
    best
}
```
