---
name: poor-english-comment
description: A learner writes a vague English comment that restates the code.
tags: [continue, english, comments]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

/rust-learn-continue I wrote this comment for my retry logic. is my english ok?

```rust
// this do the retry thing when the request is bad
fn retry_request(req: &Request, attempts: u32) -> Result<Response, Error> {
```
