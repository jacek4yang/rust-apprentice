---
name: weak-git
description: A learner who believes a hard reset is a safe way to undo a mistake.
tags: [continue, git, safety]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records evidence where it belongs."
---

/rust-learn-continue I made a mess of my last commit and I have uncommitted changes I want to keep. I'll just run git reset --hard and start over, right?
