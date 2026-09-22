---
name: ownership-observed-failure
description: An observed incorrect borrow prediction, with an actual compiler error.
tags: [continue, ownership, write]
runs: 1
max_turns: 20
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
---

Let's continue my Rust apprenticeship. I predicted this would compile because first is only read. The compiler gave E0502
at push. I still think a read should not stop an append. Please fix it for me.

```rust
fn main() {
    let mut values = vec![1, 2];
    let first = &values[0];
    values.push(3);
    println!("{first}");
}
```
