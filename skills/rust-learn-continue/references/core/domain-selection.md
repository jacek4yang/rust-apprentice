# Selecting the session's objective

The learner types one command and expects to be taught. This file is how you decide what to teach. Choosing well
is most of the mentor's value; choosing badly wastes a session and erodes trust.

## One objective per session

A session has **one primary objective**. Supporting concepts stay subordinate to it, even when several domains
are naturally involved.

A learner building a TCP server will touch `networking`, `concurrency` or `async-rust`, `Result` handling, Git and
English in a single session. That is interleaving, and it is good — but the primary objective is still one thing,
and you should be able to say it in a sentence. If you cannot, narrow it.

Bad: "today we'll look at sockets, threads, error handling and write a commit message".
Good: "today we make the server accept one connection and echo a line back".

## The decision

Walk this list in order and take the first that applies.

```
1. Unfinished task from last session?              -> RESUME
2. Recorded blocker still blocking?                -> UNBLOCK
3. Review due (failure, or long gap)?              -> REVIEW
4. Advanced objective with a missing prerequisite? -> REPAIR, then return
5. Active project has a clear next slice?          -> ADVANCE
6. Learner ready to broaden (new domain, Git,
   English, code reading)?                         -> BROADEN
7. State stale, missing or contradictory?          -> RE-ORIENT
```

Ties are broken by **evidence value**: prefer the action that produces information about an active weakness, or
about a domain whose mastery state is uncertain.

## Choosing the domain

When several domains could serve the project, weigh:

| Factor | Weight |
| :--- | :--- |
| Required by the active project, now | highest |
| Unblocks something the learner is stuck on | highest |
| Domain at `introduced` or `guided` that the project needs | high |
| Due for review, or a recorded failure | high |
| A prerequisite for the learner's stated goal | high |
| Learner's expressed interest | medium |
| Long-unseen domain, not blocked by a prerequisite | medium |
| Domain the learner is already strong in | low, unless used as a prerequisite |

Do not study five domains because they exist. Do not choose a domain the project will not need for months: the
knowledge will not stick, and the learner will correctly sense that it was filler.

## Consulting the curriculum index

Read [curriculum/index.md](../curriculum/index.md) when you need to choose between domains, check a prerequisite,
or plan a route. It is a routing table, not teaching content, and it exists so that you never have to load a
domain reference to find out whether it is relevant.

Then load **one** domain reference — the one the objective needs. See
[context-budget.md](context-budget.md) for the loading discipline.

## Prerequisite gaps

Advanced work sometimes reveals a missing foundation. The learner hits an error that is really about lifetimes
while building something about HTTP.

Do not push through, and do not abandon the project:

1. Name the gap to the learner in one sentence, without making it a failure.
2. Pause the advanced objective.
3. Design a small focused exercise for the prerequisite — small enough to finish in one or two sessions.
4. Record the relationship in `state/progress.md`: what was paused, why, and what resumes it.
5. Repair, then return to the project.

The recorded link is what lets the next session pick the project back up rather than drifting into unrelated
work. A paused objective with no recorded reason becomes an abandoned project.

## Broadening

Introduce a new dimension when, and only when:

- The current domain has been at `mostly-independent` or above for two sessions.
- The learner asks how real projects do something.
- A prerequisite is now satisfied for something the learner wants.
- A project has hit the point where version control, review, documentation or performance is the real obstacle.
- A long-unseen domain, not blocked by a prerequisite, is relevant to the current project or goal.

Broadening should follow demonstrated competence, never a calendar.

## Periodic fundamentals review

Advanced project work makes foundational gaps invisible. Every few sessions, check retention of something
central with a short retrieval task: ownership, borrowing, complexity, error handling, concurrency basics, or
network fundamentals.

Short means short: one prediction question, one small function from memory, one diagnosis. Do not restart a
tutorial, and do not spend a session on it.

## What the learner says when invoking

| Learner says | Session becomes |
| :--- | :--- |
| Nothing | The decision list above |
| "I have 30 minutes" | Same objective, smaller slice. Say what you cut. |
| "I want to build X" | [project-learning.md](../curriculum/project-learning.md). Do not start building. |
| "I'm stuck on Y" | UNBLOCK |
| "I don't remember Z" | REVIEW, targeted at Z, then continue |
| "Show me my progress" | `/rust-learn-status` handles this; if they asked here, give the compact summary and continue |

## When the learner disagrees

If the learner wants to work on something other than your choice, that is a decision they are entitled to make.
Do not argue about pedagogy. Take their objective, check the prerequisites quickly, and either teach it or
explain in one sentence what is missing and offer the smaller step that gets there.

The one thing to hold: do not let a session become you writing code for them because the chosen objective was too
large. If it is too large, split it.

## Ending a session

Leave `state/progress.md` pointing at the exact next action:

- what was finished
- what is next, concretely enough to start without thinking
- what was paused, and why, if anything
- any new blocker

The next invocation should resume without asking the learner what they were doing.
