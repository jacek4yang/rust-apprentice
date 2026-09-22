# rust-apprentice

A long-term engineering apprenticeship, centred on Rust, built on the [Agent Skills](https://agentskills.io/specification) standard.

Primary supported harnesses:

- [Claude Code](https://code.claude.com/docs/en/skills)
- [Pi](https://pi.build)

Other Agent Skills-compatible clients may work, but are not first-class tested targets.

It exists for one reason: to turn a motivated beginner into an independent engineer who is especially capable with
Rust — without making them dependent on an AI.

Three commands. That is the whole interface.

```
/rust-learn-init        # once
/rust-learn-continue    # from then on, forever
/rust-learn-status      # occasionally, to see where you are
```

## Why it exists

Coding agents are very good at writing the code you were trying to learn to write. That makes them a strange
teacher. This repository is the opposite arrangement: Claude explains just enough for you to make the next move,
you write the code, and Claude inspects what you actually did.

The mentor is designed to become unnecessary. It tracks what you have demonstrated, revisits what you are
forgetting, and hands you progressively more of the work: requirements, architecture, tests, debugging, Git
workflow, pull requests, and eventually the English you need to do all of that on an international team.

## What it is not

- Not a Rust tutorial. There is no chapter list to get through.
- Not an autonomous coding agent for your projects. **It teaches instead of coding for you.**
- Not a quiz app or a course platform. There are no scores, no percentages, no badges.

## The product philosophy

**Initialize once. Then mostly use `/rust-learn-continue` forever.**

After the first session you should never again have to remember your current chapter, your next exercise, your
project phase, your review schedule, your weak concepts, or whether today is review or new material. The mentor
decides from evidence and tells you one thing to do.

The internal curriculum is very large — Rust, ownership, algorithms, computer architecture, operating systems,
networking, cryptography, concurrency, async, architecture, patterns, testing, debugging, performance, databases,
distributed systems, security, codebase reading, open-source engineering, Git and English. You never see it as a
syllabus. It is loaded one domain at a time, only when your current project needs it.

## Requirements

| Requirement | Notes |
| :--- | :--- |
| [Claude Code](https://code.claude.com/docs/en/skills) or [Pi](https://pi.build) | The skills are written for both. |
| Node.js 18+ | Only for the `npx skills` installer for Claude Code. Not needed for Pi or the manual install. |
| Rust toolchain | Not needed to install. `/rust-learn-init` walks you through it if it is missing. |

Windows, macOS and Linux are supported. Linux is the primary development and testing environment. Windows is
treated as first class: PowerShell 5.1 and 7, `cmd`, Git Bash, legacy CP936/GBK consoles, and paths with Chinese
characters or spaces all work, and the skills never change your system code page or locale to make that happen.

## Installation

### Claude Code

**Recommended: the Skills CLI**

```bash
npx skills@latest add jacek4yang/rust-apprentice -g -a claude-code --copy
```

Then, in Claude Code:

```
/rust-learn-init
```

Omit `-g -a claude-code` to let the CLI prompt you for scope and target agents. Use `npx skills@latest update` to
update, and `npx skills@latest remove rust-learn-init rust-learn-continue rust-learn-status -g` to uninstall.

Installing to **project** scope instead of user scope also works, but an apprenticeship is usually personal rather
than repository-specific.

### Manual install

Clone the repository and copy the three skill directories into your personal skills directory.

**macOS / Linux**

```bash
git clone https://github.com/jacek4yang/rust-apprentice
mkdir -p ~/.claude/skills
cp -r rust-apprentice/skills/rust-learn-init \
      rust-apprentice/skills/rust-learn-continue \
      rust-apprentice/skills/rust-learn-status ~/.claude/skills/
```

**Windows (PowerShell)**

```powershell
git clone https://github.com/jacek4yang/rust-apprentice
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills"
Copy-Item -Recurse rust-apprentice\skills\rust-learn-* "$env:USERPROFILE\.claude\skills\"
```

Or use [`scripts/install.sh`](scripts/install.sh) / [`scripts/install.ps1`](scripts/install.ps1), which do the
same thing and accept `--uninstall` / `-Uninstall`. The helpers stage and verify all three skills before
switching them, restore previous versions after a switch failure, and retain recoverable backups beside the
skills directory. Uninstall moves the three directories into a backup; unrelated skills are preserved.

To update a manual install, `git pull` and copy the directories again. To uninstall, delete the three directories
under `~/.claude/skills/`. Nothing else on your machine is touched.

> The installer copies skill directories into `~/.claude/skills/`. The skills repository and your learning
> workspace are separate things in different places; neither is inside the other.

### Pi

```bash
pi install git:github.com/jacek4yang/rust-apprentice
```

Then, in Pi:

```
/rust-learn-init
```

Pi also exposes the skills natively as `/skill:rust-learn-init`, `/skill:rust-learn-continue` and
`/skill:rust-learn-status`. They work as a fallback, but the plain commands above are the primary UX.

### The same three commands, either harness

```
/rust-learn-init        # once
/rust-learn-continue    # from then on, forever
/rust-learn-status      # occasionally, to see where you are
```

A workspace initialized under Claude Code is used by Pi as-is, and the other way round: the state format,
registry and discovery are shared.

## `/rust-learn-init` — run once

A short conversation, not a form. It asks one or two questions at a time about your background, then does
something slightly unusual: it does **not** take your answers at face value. Whatever you claim about your level,
it checks with two or three small conversational probes — explain a concept in your own words, predict what a
snippet does, name what a compiler error means.

Self-assessment is weak evidence. Observed evidence is what counts.

Finally it asks **where you want your learning workspace to live** and creates it there. There is no default path
and no hidden fallback — the mentor proposes examples, you choose.

## `/rust-learn-continue` — run forever

That is the entire day-to-day interface. It locates your workspace, reads a small amount of state, checks whether
anything is due for recall, loads at most one domain reference, decides the single highest-value next objective,
and gives you one manageable step. Then it waits for you.

It will not ask you to choose a mode. It will not print a mastery table. It will not dump a chapter.

You can add context when you want to:

```
/rust-learn-continue I have 30 minutes today
/rust-learn-continue I want to start that downloader project
/rust-learn-continue I'm stuck on this borrow error
```

## `/rust-learn-status` — occasionally

A compact summary: your stage, domain mastery in one line each, your strongest areas, your highest-value gaps,
the current project and next action, and an approximate trajectory.

It reports **domains, not concepts**, and never a percentage. Ask about a specific area and it will go deeper —
for that area only.

## Workspace discovery

All three skills find your workspace without being told, in this order:

1. **Walk up** from the current directory looking for the `rust-apprentice.yaml` marker file.
2. **Registry** — a small YAML file listing workspaces you have initialized.
3. Exactly one registered and valid workspace → use it silently.
4. Several → the most recently active one, when that is unambiguous.
5. **Ask** — only when genuinely ambiguous, or the workspace is missing or has moved.

The registry lives at `$RUST_APPRENTICE_STATE_DIR` if set, else `$CLAUDE_SKILLS_STATE_DIR` (legacy Claude Code
compatibility), else:

| Platform | State directory |
| :--- | :--- |
| Windows | `%APPDATA%\rust-apprentice\` |
| macOS | `~/Library/Application Support/rust-apprentice/` |
| Linux | `$XDG_STATE_HOME/rust-apprentice/` (or `~/.local/state/rust-apprentice/`) |

It is human-readable, holds one entry per workspace, and can be edited by hand. The schema is in
[`skills/rust-learn-continue/references/core/workspace.md`](skills/rust-learn-continue/references/core/workspace.md).

## The learning workspace

Created by `/rust-learn-init` at a path you choose, and browsable in any editor:

```
<workspace>/
├── rust-apprentice.yaml     # marker + pointer to the current state
├── learner/                 # who you are, your goals, dated evidence
├── plans/                   # the roadmap, and routes to specific goals
├── state/                   # small and current: progress, learner model, review queue, log, sessions
├── notes/                   # your own engineering notes, written from real work
├── exercises/               # small focused practice
├── projects/                # real Cargo projects
├── reviews/                 # periodic review summaries
└── archive/                 # history that has been rolled up
```

State is deliberately split by how often it is read. `state/` stays small enough to read every session, forever;
detail accumulates in `learner/evidence/` and rolls into `archive/`. Years of use should not mean reading years
of files. See [`docs/state-schema.md`](docs/state-schema.md).

## What you will actually learn

The curriculum is a dependency graph, not a table of contents. It is routed by the project you are on, so you
learn what the work needs, when it needs it.

**Projects are the point.** Eventually most sessions are a slice of a real project: discuss the behaviour, write a
failing test, make it pass, refactor, commit. When you propose a project the mentor will not build it for you —
it will work out what you need first and build a route there. A goal that is far above your current level is
preserved and given a path, never refused.

**English is embedded, not a separate course.** You start in Chinese, with English identifiers and commit
messages. As you demonstrate ability, more of the conversation moves into English, and you will write the commit
messages, PR descriptions and code review comments yourself.

**Git and GitHub are taught through real work**, not as a separate subject. Safety first: the mentor will not run
a destructive Git command on your behalf without explaining what it does.

## Repository layout

```
skills/rust-learn-init/SKILL.md          # onboarding entrypoint
skills/rust-learn-continue/SKILL.md      # the everyday entrypoint
skills/rust-learn-status/SKILL.md        # progress reporting
skills/rust-learn-continue/references/
├── core/                                # teaching, hints, assessment, session flow, review,
│                                        # context budget, state schemas, workspace discovery,
│                                        # Windows and encoding, status reporting, migration
├── curriculum/                          # index.md plus one file per domain
└── rust/                                # ownership, traits, lifetimes, errors, async, concurrency
prompts/rust-learn-{init,continue,status}.md  # thin Pi command aliases; they load the matching skill
.claude-plugin/plugin.json               # plugin manifest, so the repo also works as a Claude Code plugin
evals/                                   # behavioural evaluation suites
docs/                                    # architecture and state schema
scripts/                                 # optional install helpers (Claude Code manual install)
tests/                                   # static repository checks (run in CI)
```

Each `SKILL.md` is a router — purpose, invariants, workflow, and pointers. The teaching material lives in the
references and is loaded only when the current objective needs it. The `prompts/` files are Pi command aliases:
each is a three-line wrapper that tells the agent to load the matching skill, with no duplicated teaching logic.

## Evaluations

The eval suite covers the situations that matter: total beginners, experienced programmers new to Rust, learners
who overstate their ability, learners stuck on ownership, people returning after a week, learners who ask Claude
to write everything, compiler errors, weak and strong Git users, Chinese comments in code, HTTP and async work,
plus Windows and encoding scenarios, lazy-loading checks, and a learner with a year of history.

```bash
npm ci --ignore-scripts
npm run eval -- --case total-beginner --runs 3
```

See [`evals/README.md`](evals/README.md).

Static checks run in CI and locally:

```bash
npm ci --ignore-scripts          # development tools only; Node 20+ and Rust are used by tests
npm test                        # repository, state, eval fixture and installer contracts
node tests/repo-checks.mjs       # structure, frontmatter, links, English-only, thin entrypoints
node tests/validate-skills.mjs   # validates against the Agent Skills specification
node tests/assert-discovery.mjs  # the Skills CLI finds exactly three skills
npm run verify:pi               # optional: real Pi discovers 3 skills and 3 aliases (SKIP without Pi)
```

## Status and limitations

- Written for Claude Code and Pi. Descriptions limit teaching to explicit learning requests, including
  natural-language requests. This is model-directed behaviour, not a hard invocation guarantee. The manual-only
  flag is omitted to keep natural-language requests working; client compatibility needs versioned verification.
- Structural and isolated installer checks pass locally; full behavioural and long-term learning outcomes
  remain unverified. See [verification status](docs/validation-status.md) and [eval instructions](evals/README.md).
- Install all three sibling skills. Claude Code plugin installation uses namespaced commands such as
  `/rust-apprentice:rust-learn-init`; personal/project Skill installs and Pi use `/rust-learn-init`.
- The workspace may be moved between machines by copying the directory. After a move, tell the mentor the new
  path once.
- The mentor cannot verify anything you do outside the session. Evidence is whatever you show it.
- Time estimates are ranges, never promises, and senior-level capability is explicitly reported as something that
  cannot be inferred from study time.

## License

MIT — see [LICENSE](LICENSE).
