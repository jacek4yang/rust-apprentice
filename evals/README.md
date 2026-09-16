# Behavioural evaluations

`evals/` holds a suite of learner situations run against the skills using Claude Code's own eval tooling
(`claude plugin eval`). Each case is a realistic prompt from a learner, plus graders that check what the mentor
actually did.

## Why these cases

The failure modes this project is most exposed to are behavioural, not structural: a mentor that lectures, that
writes the learner's code, that trusts a self-assessment, that forgets what happened last month. None of those
show up in a linter, so they are tested here.


## A constraint you need to know about

`claude plugin eval` loads the plugin's skills as a **model-invoked** capability. These skills set
`disable-model-invocation: true` so that Claude never starts a learning session just because the user mentioned
Rust, which means the harness cannot see them: every case runs against bare Claude Code and scores accordingly.

`scripts/run-evals.mjs` handles this. It flips that one flag for the duration of a run, restores both files
afterwards, and refuses to start if a file is not in the expected state:

```bash
node scripts/run-evals.mjs --case total-beginner --runs 3 --ablation none --allow-tools Skill
node scripts/run-evals.mjs --threshold 0.8
```

The `Skill` grant matters: without `--allow-tools Skill` the agent is told the skill exists, tries to invoke it,
is denied, and the run measures nothing. This is also why a run whose case declares `allowed_tools` still needs
the flag on the command line — it is an operator grant, not a case-level one.

Note that the temporary flip is itself a kind of check. In production the learner types the command, so the skill
is loaded deliberately; model-invoked, the agent chooses it and tends to over-explain. Cases asserting that the
mentor keeps the learner active are therefore measuring the skill's constraints under slightly harder conditions
than production.

## Running on Windows

A case that asks for `Bash` or `Write` is refused on a machine with no sandbox backend, because the harness will
not run an unconfined shell. The cases here declare only read-only tools and write nothing, so they run
everywhere; add `--allow-tools` grants on Linux or macOS when a case genuinely needs them.

## Running

From the repository root:

```bash
# one case, one run, no baseline arm (cheapest, for iterating)
claude plugin eval . --case total-beginner --runs 1 --ablation none

# one case with the no-plugin baseline, to see what the skills actually contribute
claude plugin eval . --case ownership-struggle --runs 3

# the whole suite, failing the build below 0.8
claude plugin eval . --threshold 0.8
```

The plain `claude plugin eval .` form works too, but only after you have made the skills visible to the harness
yourself — see the constraint above.

Useful options: `--case <glob>`, `--tag`, `--model`, `--runs`, `--judge-model`, `--json <path>`, `--keep-temp` to
preserve a run's sandbox and transcript for debugging.

Reports are written to `evals/results/<timestamp>/` and are gitignored.

## Cases

| Case | Situation | What it checks |
| :--- | :--- | :--- |
| `total-beginner` | Never programmed; asks to start | Init asks one question at a time, probes without a questionnaire, does not lecture |
| `experienced-new-to-rust` | Senior Python developer, no Rust | Skips false-beginner material, probes ownership rather than syntax, starts high |
| `overconfident-beginner` | Claims to know ownership; cannot explain a move | Claim recorded as a claim, probe contradicts it, no contradiction of the learner's self-image |
| `ownership-struggle` | Repeatedly blocked on the borrow checker | Hint ladder, never writes the fix, records the weakness |
| `returning-after-a-week` | Comes back after 7 days | Resumes the exact recorded next action without asking what to study |
| `forgot-old-concept` | Cannot recall a concept demonstrated a month ago | Review happens, state is demoted honestly, no re-teaching of the whole topic |
| `overly-advanced-project` | "I want to build a distributed database" | Goal preserved, gap named, route built, no immediate building and no "too advanced" |
| `asks-claude-to-write-everything` | "Just write the function for me" | Solution withheld, hint rung given, learner asked to attempt first |
| `compiler-error` | Pastes E0502 and asks what it means | Learner diagnoses first; term explained; no working code pasted |
| `weak-git` | Believes `reset --hard` is safe | Command's effect explained before it runs, safer alternative taught |
| `strong-git` | Comfortable with branches and rebase | Not condescended to; moves to PR workflow; no basic Git drilling |
| `chinese-code-comment` | Wrote a Chinese comment in Rust source | Comment not deleted silently; converted with the learner; rule stated |
| `poor-english-comment` | English comment restates the code | Comment quality taught, wording corrected, both the "when" and the "how" |
| `http-networking` | Moving into HTTP clients | HTTP concepts before `reqwest`; one API step at a time, not the whole crate |
| `async-rust` | First async work | Prerequisites checked (`Send`/`Sync`/threads), no `async` before they are in place |
| `becoming-independent` | Solves things unaided, writes PRs | Mentor hands over ownership, reduces scaffolding, stops teaching what is known |

## Grader types used

- `llm` graders carry the rubric for behaviour — most cases use one for "the learner did the work" and one for
  "the response was small enough".
- `regex` graders over `last_message` catch mechanical failures: a fenced code block containing a full solution, a
  message long enough to be a lecture, a mastery percentage.
- `tool_used` / `tool_order` graders over `files` and `trace` check that files were written where they should be and
  that state was updated only after evidence.

## Adding a case

1. Create `evals/<case-name>/prompt.md` with frontmatter (`tags`, `runs`, `max_turns`) and the learner's message as
   the body.
2. Add `graders/<name>.md` files. One rubric per file, written as concrete PASS and FAIL conditions.
3. Run it with `--runs 1 --ablation none` while iterating; switch to the default two-arm run when the case is stable.
4. Keep a case when it catches something real. Delete cases that only test the grader's own wording.

See `docs/architecture.md` for how the eval suite fits into the rest of the repository, and the Claude Code
documentation for the full case format.
