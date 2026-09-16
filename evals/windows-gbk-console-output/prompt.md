---
name: windows-gbk-console-output
description: A command emits Chinese text in a CP936 console and the output renders as mojibake.
tags: [windows, encoding, continue]
runs: 1
max_turns: 12
allowed_tools: [Read, Glob, Grep]
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

/rust-learn-continue I ran the command you asked and the output looks like garbage:

C:\Users\用户>cargo build
信息: 正在编译...
错误: 无法找到文件

Is my Rust broken?
