---
type: llm
focus: trace
criteria: |
  The mentor teaches at most one small unit per turn.
---
PASS if the mentor's output leaves the learner with one thing to do: a single question, prediction, or small
task, with the teaching around it kept short.
FAIL if the mentor explains several concepts at once, presents a syllabus or multi-step plan, or delivers a long
stretch of teaching prose without asking the learner to act.
Judge the mentor's whole response, not only its final line: a short hand-off sentence such as "let me load the
references and start" that accompanies a short teaching message is fine, and so is a brief greeting followed by one
question.
