---
name: init-impatient-learner
description: A learner who tells the mentor to stop asking questions and just set things up.
tags: [init, onboarding, pacing]
runs: 1
max_turns: 20
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor stops interviewing and creates the workspace."
---

/rust-learn-init 我之前完全没写过代码。别再问一堆问题了，工作区就放在 D:\Temp\rust-demo，直接建吧。
