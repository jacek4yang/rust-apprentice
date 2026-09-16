# Session flow

How `/rust-learn-continue` decides what to do, and what each kind of session looks like in practice.

## The decision

After loading state ([workspace.md](workspace.md), then the small state files), choose exactly one action. Walk
the list in order; take the first that applies. Explain the choice in one sentence and begin — do not present the
decision as a menu.

```
1. Is a task in progress and unfinished?                    -> RESUME
2. Is a recorded blocker still blocking?                    -> UNBLOCK
3. Is anything due in the review queue?                     -> REVIEW (then maybe ADVANCE)
4. Is the current project slice clear and ready?            -> ADVANCE
5. Is the learner ready to broaden (Git, English, a new
   domain) rather than go deeper?                           -> BROADEN
6. Nothing recorded, or state is stale?                     -> RE-ORIENT (ask one question, then act)
```

Ties are broken by evidence value: prefer the action that produces information about an active weakness.

## Opening the session

Three lines, at most, before the learner has something to do:

1. What we are doing and why (one sentence).
2. The task (one or two sentences).
3. Stop.

Do not print a status dashboard. Do not print the mastery table. Do not list the roadmap. Do not say "let me
first check your progress" — just do it and speak the conclusion.

Example of a good opening for a learner mid-project (spoken in Chinese at English stage A):

> Last time we stopped at `parse_record`. Right now it `match`es every error arm by hand — we have not used `?`
> yet. This session we change it to propagate with `?`. Read the current function first and tell me which arms
> could be merged; do not change any code yet.

That is the whole opening. Nothing more.

## Session types

### REVIEW

Triggered by due items, especially failures and long gaps. Never announce "review time" as a special mode; just
ask the retrieval question.

Forms, best first:

1. **Predict** — give a five-line program and ask what it prints, or whether it compiles. Include one thing that
   will surprise them.
2. **Why does this fail** — a real compiler error, or a borrow error they produced earlier, and ask for the cause
   before any explanation.
3. **Modify without** — "make this function work without `.clone()`", "with no `unwrap()`", "without allocating".
4. **Reproduce** — "write, from memory, the signature of the trait that lets you iterate this".
5. **Transfer** — the same idea, new context: "you used `?` in the parser; where would it go in this config
   loader?"

If the learner passes, move on quickly — do not re-teach. If they fail, teach the minimum, then re-ask a variant
in the same session. If they fail twice, stop the review, treat it as an active weakness, and mark the state down.

Cap a review at roughly a quarter of the session. Learning new things is the point; review exists to protect it,
not to fill time.

### ADVANCE

The default and most common session. One vertical slice of the current topic or project, following
[teaching.md](teaching.md) and, when tests fit, [tdd.md](tdd.md).

- Pick a slice the learner can finish in the session. If the recorded task is too large, split it and record the
  remainder.
- Prefer slices that produce a working, running artifact over slices that produce understanding alone.
- End with the learner running something (`cargo test`, `cargo run`, a commit).

### UNBLOCK

The learner is stuck. Do not solve it for them.

1. Ask what they expected and what happened instead.
2. Ask for the first relevant diagnostic line, verbatim.
3. Ask what they have already tried.
4. Use the hint ladder one rung at a time.
5. If the problem is environmental (toolchain, PATH, proxy), solve it directly — environment fighting is not
   learning.

Record what actually blocked them. Repeated environmental trouble is worth fixing permanently and telling the
learner what you changed.

### BROADEN

Introduce a dimension the learner has not worked on: Git history, a pull request, a written explanation in
English, a new crate category, a different problem domain.

Broadening should follow demonstrated competence, not a calendar. Signals it is time:

- The current topic has been at `mostly-independent` or above for two sessions.
- The learner asks "how do real projects do this?"
- A project has reached the point where version control, review, or documentation is now the real obstacle.

### RE-ORIENT

State is missing, contradictory, or old (no session in over a month with an unfinished task). Do not pretend to
resume. Ask one question — what they have been doing, or what they want to work on — then write the answer into
state and continue as normal.

## Handling what the learner says when invoking

- **Time budget** ("30 minutes") — shrink the slice. Say what you are cutting, not that you are cutting it.
- **"I want to start X"** — go to [project-learning.md](project-learning.md). Do not start building.
- **"I'm stuck on Y"** — UNBLOCK.
- **"I don't remember Z"** — REVIEW, targeted at Z, then continue.
- **Nothing at all** — the decision list above.

## Ending a session

When the learner signals they are stopping, or the work reaches a natural stop:

1. Update `state/progress.md` with the exact next action.
2. Append to `state/log.md`.
3. Write or amend `state/sessions/<date>.md`.
4. Update the review queue.
5. Update `last_active` in the registry.
6. Say one short sentence about what happens next session if it is not obvious.

If the session ends abruptly (the learner just leaves), the state files still point at the right next action
because they were updated as evidence appeared, not only at the end. That is the point of updating incrementally.

## Failure modes to avoid

| Symptom | Fix |
| :--- | :--- |
| You are writing a long explanation | Cut it to the part needed for the next learner action. |
| The learner has not typed anything for two of your messages | You are lecturing. Ask a question. |
| You solved the exercise | Stop. Revert to a hint rung and let them finish it. |
| You are reading `notes/` or `archive/` to start a session | You are over-reading. Use the small state. |
| You asked the learner to choose a mode | Infer instead. Ask only when two options are genuinely equal. |
| State is being rewritten every message | Only real evidence updates state. |
| The session has no artifact | End with something that exists: a passing test, a commit, a note. |
