# rust-apprentice

A long-term Rust apprenticeship mentor for [Claude Code](https://code.claude.com/docs/en/skills), built as an
[Agent Skill](https://agentskills.io/specification) repository.

It exists for one reason: to turn a motivated beginner into an independent professional Rust engineer without
making them dependent on an AI.

Two commands. That is the whole interface.

```
/rust-learn-init        # once
/rust-learn-continue    # from then on, forever
```

## Why it exists

Coding agents are very good at writing the code you were trying to learn to write. That makes them a strange
teacher. This repository is an attempt at the opposite arrangement: Claude explains just enough for you to make
the next move, you write the code, and Claude inspects what you actually did — then adjusts.

The mentor is designed to become unnecessary. It tracks what you have demonstrated, revisits what you are
forgetting, and gradually hands you more of the work: requirements, architecture, tests, Git workflow, PR writing,
debugging, and eventually the English you need to do all of that on an international team.

## What it is not

- Not a Rust textbook. There is no chapter list to get through.
- Not an autonomous coding agent for your projects. **It teaches instead of coding for you.**
- Not a quiz app, a linter, or a course platform. There are no scores, no percentages, no badges.

## The product philosophy

**Initialize once. Then mostly use `/rust-learn-continue` forever.**

After the first session you should never again have to remember your current chapter, your next exercise, your
project phase, your review schedule, your weak concepts, or whether today is review or new material. The mentor
decides from evidence, tells you one thing to do, and waits for you.

## Requirements

| Requirement | Notes |
| :--- | :--- |
| [Claude Code](https://code.claude.com/docs/en/skills) | The skills are written for Claude Code. |
| Node.js 18+ | Only for the `npx skills` installer. Not needed for the manual install. |
| Rust toolchain | Not needed to install. Needed once you start writing Rust; `/rust-learn-init` will walk you through it. |

Windows, macOS, and Linux are all supported. The learner workspace is a plain directory of Markdown and Cargo
projects — no database, no daemon, no language runtime of its own.

## Installation

### Recommended: the Skills CLI

```bash
npx skills@latest add jacek4yang/rust-apprentice -g -a claude-code --copy
```

This installs both skills into your personal Claude Code skills directory. Then, in Claude Code:

```
/rust-learn-init
```

Omit `-g -a claude-code` to let the CLI prompt you for scope and target agents. Use `npx skills@latest update` to
update later, and `npx skills@latest remove rust-learn-init rust-learn-continue -g` to uninstall.

Installing to **project** scope instead of user scope also works, but the apprenticeship is usually personal, not
repository-specific.

### Manual install

Clone the repository and copy the two skill directories into your personal skills directory.

**macOS / Linux**

```bash
git clone https://github.com/jacek4yang/rust-apprentice
mkdir -p ~/.claude/skills
cp -r rust-apprentice/skills/rust-learn-init rust-apprentice/skills/rust-learn-continue ~/.claude/skills/
```

**Windows (PowerShell)**

```powershell
git clone https://github.com/jacek4yang/rust-apprentice
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills"
Copy-Item -Recurse rust-apprentice\skills\rust-learn-init, rust-apprentice\skills\rust-learn-continue "$env:USERPROFILE\.claude\skills\"
```

A helper for the same thing is provided as [`scripts/install.sh`](scripts/install.sh) and
[`scripts/install.ps1`](scripts/install.ps1). Both accept `-Uninstall` / `--uninstall`.

To update a manual install, `git pull` and copy the directories again. To uninstall, delete
`~/.claude/skills/rust-learn-init` and `~/.claude/skills/rust-learn-continue`. Nothing else on your machine is
touched — the skills never write outside the learning workspace you choose and their own state directory.

> The installer copies skill directories into `~/.claude/skills/`. The skills repository and your learning
> workspace are separate things that live in different places on disk; neither is inside the other.

## `/rust-learn-init` — run once

A short conversation, not a form. It asks one or two questions at a time and covers roughly: what you have
programmed before, what Rust you have actually touched, Git and GitHub experience, how comfortable you are reading
and writing English, your editor, what you want to build, whether Rust is installed, and how much time you have.

It then does something slightly unusual: it does **not** take your answers at face value. Whatever you say about
your level, it checks with a couple of small, conversational probes — explain a concept in your own words, predict
what a snippet does, name what a compiler error means. Self-assessment is weak evidence; observed evidence is what
counts.

Finally it asks **where you want your learning workspace to live** and creates it there. There is no default path
and no hidden fallback — the mentor proposes examples, you choose.

## `/rust-learn-continue` — run forever

That is the entire day-to-day interface. It locates your workspace, reads a small amount of current state, checks
whether anything is due for recall, decides the single highest-value next action, and gives you one manageable
step. Then it waits for you.

It will not ask you to choose a mode. It will not print a mastery table. It will not dump a chapter.

You can add context when you want it:

```
/rust-learn-continue I have 30 minutes today
/rust-learn-continue I want to start that downloader project
/rust-learn-continue I'm stuck on this borrow error
```

## Workspace discovery

`/rust-learn-continue` finds your workspace without being told, in this order:

1. **Walk up** from the current directory looking for a `rust-apprentice.yaml` marker file.
2. **Registry** — a small YAML file in the skills' own state directory listing workspaces you have initialized.
3. Exactly one registered and valid workspace → use it silently.
4. Several → use the most recently active one when it is unambiguous.
5. **Ask** — only when the answer is genuinely ambiguous, or the workspace is missing or has moved.

The registry lives at `${CLAUDE_SKILLS_STATE_DIR}` if that environment variable is set, otherwise:

| Platform | State directory |
| :--- | :--- |
| Windows | `%APPDATA%\rust-apprentice\` |
| macOS | `~/Library/Application Support/rust-apprentice/` |
| Linux | `$XDG_STATE_HOME/rust-apprentice/` (or `~/.local/state/rust-apprentice/`) |

It is human-readable, holds one entry per workspace, and can be edited or deleted by hand. The exact schema is in
[`skills/rust-learn-continue/references/workspace.md`](skills/rust-learn-continue/references/workspace.md).

## The learning workspace

Created by `/rust-learn-init` at a path you choose, and browsable with any editor:

```
<workspace>/
├── rust-apprentice.yaml     # marker + pointer to the current state file
├── learner/                 # who you are, what you have demonstrated
├── plans/                   # the long-term roadmap and the route to your goals
├── state/                   # small, current: progress.md, review-queue.md, log.md, sessions/
├── notes/                   # topic notes, written from real work
├── exercises/               # small focused practice
├── projects/                # real Cargo projects
├── reviews/                 # periodic review summaries
└── archive/                 # history that has been rolled up
```

State is deliberately split: `state/` stays small enough to read every session, while detail accumulates in
`notes/`, `learner/evidence/`, and `archive/`. Years of use should not mean reading years of files.

## What you will actually learn

The curriculum is adaptive, not a table of contents. Over time it is expected to cover: the fundamentals
(ownership, borrowing, lifetimes, error handling), traits and generics, smart pointers and interior mutability,
concurrency and async Rust, testing and TDD, debugging and diagnostics, documentation literacy, crate and public
API design, performance work — and, woven through the whole thing, the professional practices of Git, GitHub pull
requests, CI, and technical English.

**Projects are the point.** Eventually most sessions are a slice of a real project: discuss the behaviour, write a
failing test, make it pass, refactor, commit. When you propose a project the mentor will not build it for you — it
will work out what you need first and build a route there.

**English is embedded, not a separate course.** You start in Chinese, with English identifiers and commit
messages. As you demonstrate ability, more of the conversation moves into English, and you will be writing commit
messages, PR descriptions, and code review comments yourself.

## Repository layout

```
skills/rust-learn-init/SKILL.md          # onboarding entrypoint
skills/rust-learn-init/references/       # curriculum skeleton, assessment, workspace bootstrap
skills/rust-learn-continue/SKILL.md      # the long-term entrypoint
skills/rust-learn-continue/references/   # teaching, assessment, review, projects, Git/GitHub, English, state
.claude-plugin/plugin.json               # plugin manifest, so the repo also works as a Claude Code plugin
evals/                                   # behavioural evaluation suites
docs/                                    # architecture and state schema
scripts/                                 # optional install helpers
tests/                                   # static repository checks (run in CI)
```

Both `SKILL.md` files are intentionally short. Everything deeper is loaded on demand.

## Evaluations

The repository ships a behavioural eval suite for `claude plugin eval`, covering the situations that matter:
total beginners, experienced programmers new to Rust, learners who overstate their ability, learners stuck on
ownership, learners returning after a week, learners who ask Claude to write everything, compiler errors, weak and
strong Git users, Chinese comments in code, and learners progressing into HTTP and async Rust.

```bash
claude plugin eval . --case total-beginner --runs 3 --ablation none --trust-plugin
```

See [`evals/README.md`](evals/README.md) for the cases and how to read the results.

Static repository checks — exactly two skills, valid frontmatter, working relative links, no Chinese in code, no
hardcoded workspace path — run in CI and locally:

```bash
node tests/repo-checks.mjs      # structural checks
node tests/assert-discovery.mjs # the Skills CLI finds exactly two skills
```

## Status and limitations

- Written and tested primarily against Claude Code. A learning session only starts when you ask for one: the
  skills carry no automatic-invocation frontmatter, and their descriptions state that a passing mention of Rust is
  not a trigger. This was verified in a real session. See [`docs/architecture.md`](docs/architecture.md) for why
  the `disable-model-invocation` flag is deliberately **not** used — on Claude Code it prevents the skill from
  being registered at all.
- The workspace may be moved between machines by copying the directory. After a move, tell the mentor the new
  path once; it will update its registry.
- The mentor cannot verify anything you do outside the session. Evidence is whatever you show it.

## License

MIT — see [LICENSE](LICENSE).
