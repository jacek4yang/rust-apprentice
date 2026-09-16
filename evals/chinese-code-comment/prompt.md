---
name: chinese-code-comment
description: A learner wrote Chinese comments inside Rust source code.
tags: [continue, english, comments]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

/rust-learn-continue here is my function. is it ok?

```rust
/// Compute the greatest common divisor of two numbers.
fn gcd(a: u32, b: u32) -> u32 {
    // 如果 b 是 0 就返回 a
    if b == 0 {
        return a;
    }
    gcd(b, a % b)
}
```
