---
name: poor-english-comment
description: A learner writes a vague English comment that restates the code.
tags: [continue, english, comments]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

Let's continue my Rust apprenticeship. I wrote this comment for my retry logic. is my english ok?

```rust
// this do the retry thing when the request is bad
fn retry_request(req: &Request, attempts: u32) -> Result<Response, Error> {
```
