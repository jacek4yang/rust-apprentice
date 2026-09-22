<!--
Template for <workspace>/README.md — written by /rust-learn-init.

This README is for the learner, not for the mentor. Keep it short and human. It is what they see when they open
the folder in an editor after a month away.
-->

# Rust apprenticeship

This folder is your Rust learning workspace. It is plain Markdown and ordinary Cargo projects — nothing here needs
special tools, and you can move or back it up by copying the folder.

## How to use it

Start a Claude Code session and type:

```
/rust-learn-continue
```

That is the whole routine. It finds this workspace, works out what you were doing, and teaches the next thing.
You do not need to remember which chapter, exercise, or project you were on — that is written down here.

If you start Claude Code from inside this folder, it will find the workspace automatically.

## What is in here

```
learner/     who you are, what you have demonstrated, what you want to build
plans/       the long-term roadmap, and routes to specific goals
state/       the small files a session reads first: current work, review queue, log
notes/       your own engineering notes — your handbook, written from real work
exercises/   small focused practice
projects/    real Cargo projects
reviews/     periodic review summaries
archive/     older history, rolled up
```

You can read and edit anything. If something is wrong — a note, a mastery state, a next action — change it, or
tell the mentor to change it.

## The three commands

| Command | When |
| :--- | :--- |
| `/rust-learn-init` | Once, to set everything up. Running it again is safe but only needed if you move the workspace. |
| `/rust-learn-continue` | Every session after that. |
| `/rust-learn-status` | Occasionally, to inspect progress without changing it. |

## Backing up or moving to another machine

Copy this folder. That is it. On the new machine, open a session inside it, or tell the mentor the new path once
if it cannot find it.

## Progress

Current work lives in `state/progress.md` — a short file, deliberately. Detailed history is in
`learner/evidence/`, and older material moves to `archive/`, so a session never has to read everything to know
what to do next.
