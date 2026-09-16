# Behavioural evaluations

`evals/` holds a suite of learner situations run against the skills using Claude Code's own eval tooling
(`claude plugin eval`). Each case is a realistic prompt from a learner, plus graders that check what the mentor
actually did.

## Why these cases

The failure modes this project is most exposed to are behavioural, not structural: a mentor that lectures, that
writes the learner's code, that trusts a self-assessment, that forgets what happened last month. None of those
show up in a linter, so they are tested here.


## Note on the harness

`claude plugin eval` loads a plugin's skills as a model-invoked capability. These skills are also user-invoked
commands with no `disable-model-invocation` flag (see [`docs/architecture.md`](../docs/architecture.md) for why
that flag is not used), so the harness sees them and the cases run against the real skills.

Several cases use a `focus: files` grader to check **what was loaded**. That is deliberate: context efficiency is
an architectural requirement of this project, and it is only testable by inspecting the files a run actually
opened.

That has one consequence worth knowing when reading results: in production the learner types the command, so the
skill is loaded deliberately; under the harness the agent chooses it. Cases that assert the mentor keeps the
learner active are therefore measuring the skill's constraints under slightly harder conditions than production.

## Running on Windows

A case that asks for `Bash` or `Write` is refused on a machine with no sandbox backend, because the harness will
not run an unconfined shell. The cases here declare only read-only tools and write nothing, so they run
everywhere; add `--allow-tools` grants on Linux or macOS when a case genuinely needs them.

## Running

From the repository root:

```bash
# one case, one run, no baseline arm (cheapest, for iterating)
claude plugin eval . --case total-beginner --runs 1 --ablation none --trust-plugin

# one case with the no-plugin baseline, to see what the skills actually contribute
claude plugin eval . --case ownership-struggle --runs 3 --trust-plugin

# the whole suite, failing the build below 0.8
claude plugin eval . --threshold 0.8 --trust-plugin
```

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
| `windows-chinese-path` | Workspace path with Chinese characters and spaces | Path handled without corruption or surprise; no unrequested move |
| `windows-gbk-console-output` | CP936 console renders Chinese output as mojibake | Mojibake not treated as failure; no permanent code-page change; structured output preferred |
| `windows-powershell-5` | Learner on Windows PowerShell 5.1 | Advice fits 5.1; no reliance on PowerShell 7 or on encoding defaults |
| `curriculum-lazy-loading` | HTTP client objective | Only the networking reference is opened; no unrelated domains |
| `context-year-of-history` | Learner with a year of history | Hot state only; no archive, no notes, no history recap |
| `context-many-notes` | Learner with hundreds of notes | Notes are not loaded automatically |
| `status-compact-summary` | Progress across many domains | Domains not concepts; no numbers; one screen; no bulk evidence read |
| `status-detail-on-request` | Asks for networking detail | Detail for that area only, from that area's evidence |
| `codebase-reading-unfamiliar` | Wants an unfamiliar repo explained | Reading method instead of a summary; the learner reads the code |
| `crypto-api-misuse` | AEAD with a fixed nonce | Nonce reuse identified as the serious flaw; learner fixes it; no invented crypto |

## A limitation you should know about

The eval harness feeds the run's transcript to the judge model as text. When the mentor correctly replies in
Chinese - which it is supposed to do at English stages A and B - that Chinese arrives at the judge as mojibake on
a host whose locale does not match, and the judge then scores the answer as if it were nonsense.

The consequence: **judge-scored graders are unreliable for cases whose correct answer is in Chinese.** This was
measured, not assumed - the crypto case was inspected directly, and the mentor's reply correctly identified nonce
reuse, explained the keystream and forgery consequences, flagged the `unwrap`, and handed the fix back, while the
judge scored it 0.00 on three graders.

Two mitigations are used in this suite:

- **Prefer mechanical graders where the claim is mechanical.** A `regex` grader over `last_message` or the trace
  does not care what language the reply is in. `no-numbers`, `domains-not-concepts` and `no-solution-in-reply` are
  all structural checks for exactly this reason.
- **Say so in the rubric.** Where a judge is still the right tool, the grader states that the response may be in
  the learner's language and that substance is what is judged. This helps but does not fully fix it.

Running the suite under a UTF-8 locale, or on a host where the judge receives the transcript correctly, is the
real fix. Until then, treat a low score on a Chinese-language case as a prompt to **read the transcript yourself**
before concluding the skill misbehaved. `--keep-temp` preserves it.

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
