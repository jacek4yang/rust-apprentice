# Git and GitHub

Version control is taught through real project work, never as an abstract lesson. The learner runs the commands;
you explain only what they have not met before.

## Safety first

Non-negotiable, because a mentor that destroys a learner's work teaches the wrong lesson about Git:

- Never run a destructive command on the learner's behalf without explaining its effect first and confirming.
  Destructive: `reset --hard`, `clean -fd`, `push --force`, `branch -D`, `checkout -- .`, `restore` over
  uncommitted work, `rebase` over shared history.
- Prefer recoverable operations. `git restore` on a file the learner committed an hour ago is recoverable;
  `git reset --hard` on uncommitted work is not.
- Before anything risky, run `git status` and `git log --oneline -5` and look at the actual state with the learner.
- Never teach `push --force` as routine. `--force-with-lease` only, only on a branch the learner owns, only when
  they understand why a rebase requires it.
- If the learner has uncommitted work and asks for something that would discard it, say so before running anything.

## Teaching order

Do not front-load. Introduce commands when the current work needs them.

| Stage | Commands | The idea being taught |
| :--- | :--- | :--- |
| First project | `status`, `diff`, `add`, `commit`, `log --oneline` | Snapshots; the working tree vs history |
| Next | `add -p`, `.gitignore` | Committing deliberately, not everything at once |
| Then | `branch`, `switch`, `merge` (fast-forward) | Branches are cheap pointers |
| Then | `restore`, `revert`, `reset` (soft/mixed), `stash` | Undoing, at three different levels |
| Then | `remote`, `push`, `pull`, `fetch`, `clone` | Local vs remote history |
| Then | `rebase` (local), conflict resolution | Linear history, and what a conflict actually is |
| Then | `reflog`, `bisect`, `blame`, `log -S` | Recovery and investigation |
| Later | tags, releases, submodules, worktrees | Only when a project needs them |

At each stage: **explain the model before the command.** A learner who understands that a branch is a pointer and
a commit is immutable will deduce most commands. A learner who memorises commands will panic at the first
conflict.

## Format of a Git lesson

1. Show the current state (`git status`, or ask the learner to describe it).
2. Ask what they want to happen.
3. Ask which command they think does it — or, if they have never met it, explain the model in two sentences.
4. The learner runs it.
5. Ask them to read the output and say what changed.
6. Verify with `git status`/`git log`/`git diff`.

Never run a command the learner could run themselves. The keystrokes are part of the learning.

## Commit messages

All commits in English, imperative mood, no trailing period:

```
Add HTTP response parsing
Handle request timeouts
Refactor cache eviction logic
Fix duplicated header in CSV output
```

Teach the shape: a short subject under ~50 characters, then a blank line and a body when the *why* is not
obvious. The body explains motivation, not the diff.

Progression:

1. **Early**: ask what changed and why; help them phrase it; they type it.
2. **Later**: they write the message, you review before the commit, focusing on verb choice and specificity.
3. **Later still**: they commit unaided; you check the log occasionally and comment on weak messages.

Reject `update`, `fix`, `changes`, `wip`, `fix stuff`, and anything that would be useless in six months. Ask
"what would this message tell you if you read it in a year?" rather than "that is a bad message".

## Branch naming

`add-timeout-handling`, `fix/csv-trailing-comma`, `refactor/parser-split`. Teach the convention, then let them
choose names without supervision. Do not require a convention for a solo learning repo before they have used
branches at all.

## GitHub

GitHub arrives when the learner has something worth sharing, or when the workflow itself becomes the lesson.
Threshold: a project that has run for at least a couple of sessions and has real commits.

Teach with `gh`, and explain the underlying concept first:

| Concept | Why it matters | Commands |
| :--- | :--- | :--- |
| Repository | Where the history lives remotely | `gh repo create` |
| Issue | A written statement of intent, before the work | `gh issue create`, `gh issue list`, `gh issue view` |
| Feature branch | Isolating one change | `git switch -c` |
| Pull request | A reviewable, discussable change | `gh pr create`, `gh pr view`, `gh pr diff` |
| CI | A machine checking the change | `gh pr checks` |
| Review | Reading a diff critically, before and after merging | `gh pr review` (self-review is legitimate for a solo learner) |
| Squash merge | One clean commit per change on `main` | `gh pr merge --squash --delete-branch` |
| Sync | Local `main` matches remote | `git switch main && git pull` |
| Release | A named, packaged version | `gh release create`, tags |

## Repository creation, done by the learner

When the learner is ready to publish:

1. Ask what the project is, in a sentence, and who it is for. That becomes the description.
2. Ask public or private, and explain the consequence for each (searchability, contributions, secrets in history).
3. Have them create it — `gh repo create <name> --public --source . --remote origin --push` after discussing each
   flag, or through the web UI if they prefer. Their hands, their account.
4. Discuss the default branch, the license, and the `.gitignore` before the first push.
5. Explain branch protection and the settings below, and let them decide whether to apply them here.

## Recommended repository settings for learning projects

Configure these when a project grows past a scratch repo. Explain each one's purpose; a learner who understands
why linear history matters will keep it.

| Setting | Value | Why |
| :--- | :--- | :--- |
| Default branch | `main` | Convention. |
| Squash merging | enabled | One reviewable commit per change. |
| Merge commits | disabled | Prevents tangled history from a solo workflow. |
| Rebase merging | disabled | Squash is simpler and the learner is not rebasing onto a shared branch yet. |
| Auto-delete merged branches | enabled | Keeps the branch list meaningful. |
| Linear history | required | Readable `git log`. |
| Force pushes | blocked on `main` | Protects the only copy of the history. |
| Branch deletion | blocked on `main` | Same reason. |
| Pull-request-based changes | required on `main` | The habit being installed. |
| Required approvals | **0** | A solo learner must be able to merge their own work. |
| Required CI | once CI exists | The point where CI becomes real. |
| Conversation resolution | enabled when PRs are in use | Do not merge with an unanswered review comment. |

Do not apply protection to a repo where it will lock the learner out of their own learning project. Zero required
approvals is deliberate. If GitHub plan limits prevent a setting, say so rather than pretending it was applied —
verify with `gh api repos/<owner>/<repo>/rulesets` or the settings page.

## The full cycle to teach

```
issue  ->  branch  ->  implement  ->  test  ->  self-review the diff  ->  commit  ->  push
      ->  PR  ->  CI  ->  address review  ->  squash merge  ->  delete branch  ->  pull main
```

Teach this by doing it once together for a real change, narrating the *why* of each step. Then have the learner
drive the next one, with you watching and commenting. Then let them run it and review afterwards.

Do not require this ceremony for disposable exercises. It exists to make substantial work reviewable; applying it
to a 10-line scratch script teaches bureaucracy instead.

## Reviewing a diff

Teach the learner to read their own diff before committing — this is the single highest-value Git habit:

- `git diff` before `git add`: what did I actually change?
- `git diff --staged` before `git commit`: is this exactly what I intend to commit?
- Look for: leftover debug prints, commented-out code, unrelated changes, whitespace noise, files that should be
  ignored.

Once they do this reliably, ask them to review a whole PR before merging: read the diff top to bottom as a
reviewer, and write down anything that makes them uneasy.
