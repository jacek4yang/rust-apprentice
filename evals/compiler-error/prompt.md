---
name: compiler-error
description: A learner pastes a compiler error and asks what it means.
tags: [continue, debugging]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

/rust-learn-continue what does this mean?

```
error[E0502]: cannot borrow `cache` as mutable because it is also borrowed as immutable
  --> src/main.rs:18:5
   |
17 |     let entry = cache.get(&key).unwrap();
   |                 ----- immutable borrow occurs here
18 |     cache.insert(key.clone(), value);
   |     ^^^^^^^^^^^^^ mutable borrow occurs here
19 |     println!("{}", entry.value);
   |                          ----- immutable borrow later used here
```
