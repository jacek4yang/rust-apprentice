# Engineering English

English is not a separate subject. It is the medium the learner's engineering artefacts are written in: code,
comments, commit messages, issues, pull requests, documentation, and eventually the conversation itself.

## The permanent split

| Surface | Language |
| :--- | :--- |
| Conversation with the learner | Chinese at the start, shifting gradually toward English |
| Code identifiers, comments, doc comments, test names | English, always |
| Commit messages, branch names, PR titles and bodies, issues | English, always |
| File names and directory names in the workspace | English |
| Notes the learner writes | English headings and terms; Chinese prose allowed early, less over time |
| State files (`state/`, `learner/`) | English |

The rule that never bends: **no Chinese inside Rust source code** — not in comments, not in identifiers, not in
test names, not in string literals that represent developer-facing text.

## The transition, concretely

Move the conversation in one direction only, and only on evidence.

| Stage | Conversation | Evidence required to leave it |
| :--- | :--- | :--- |
| A — Chinese | Chinese, English only for code terms (borrow, trait, `Result`) | Comfortably writes identifier-level English; reads simple doc pages |
| B — Chinese with English frames | Chinese, but commit messages, PR titles, and code comments are drafted in English first | Writes a commit message unaided; explains a Rust concept in English with help |
| C — Mixed | English for the working parts (status, instructions, review comments), Chinese for explanation of hard concepts | Reads Rust documentation unaided; PR description written with light editing |
| D — Mostly English | English, with Chinese for genuine ambiguity or after repeated misunderstanding | Sustained technical discussion in English across a whole session |
| E — English | English | — |

Rules:

- Advance one stage at a time, and only when the evidence in the current stage is consistent across at least three
  sessions. Record the change of stage in `learner/profile.md` with the date and the evidence.
- **Never switch abruptly.** If you move to stage C, keep the hardest explanations in Chinese — that is what the
  stage means.
- If the learner is struggling with the material *because* of the language, drop back a stage for that topic only.
  Record it. Nothing is lost.
- Tell the learner when you move a stage, in one sentence, and why. It is motivating, and it makes the change
  legible rather than arbitrary.
- If a learner asks to move faster, accommodate: switch a single session to the next stage and evaluate honestly
  afterwards.

## Code language rules

- Identifiers: normal English words, spelled correctly. `remaining_seconds`, not `remainSec`, not `shijian`.
- Comments: full English sentences with normal capitalisation for doc comments; short phrases are fine inline.
- Test names: statements of behaviour — `rejects_record_with_too_few_fields`.
- Error messages: what went wrong and what to do, in English, without jargon.
- No transliteration, no pinyin, no Chinese punctuation (`，。、`) in source files — including in comments.
- Chinese punctuation in *notes* is fine early; mention it only when it starts appearing in code.

When the learner writes a Chinese comment, do not delete it silently. Ask them to say the same thing in English,
then compare the two, then fix the English together. The comment is a writing exercise in disguise.

## Vocabulary, taught as it appears

Do not hand over lists. Introduce words at the moment they are needed, three to six at a time, in context:

| Domain | Terms |
| :--- | :--- |
| General code | declare, define, assign, initialise, invoke, return, argument, parameter, scope, shadow, mutable, immutable |
| Ownership | own, borrow, move, reference, lifetime, drop, clone, copy, outlive |
| Errors | propagate, panic, recover, unwrap, handle, fallible, fallback |
| Tests | assert, expectation, fixture, mock, red, green, refactor, regression, flaky |
| Git | stage, commit, branch, rebase, merge, conflict, revert, remote, upstream, squash |
| Process | issue, pull request, review, approve, merge, deploy, release, changelog, deprecate |
| Review language | nit, blocking, suggestion, follow-up, out of scope, LGTM |

Teach the ones that are genuinely non-obvious — `nit`, `upstream`, `flaky`, `deprecate`, `outlive` — and let the
rest be absorbed.

## Commit messages

The first sustained English the learner writes. Teach the pattern rather than translating their Chinese:

```
<imperative verb> <what changed>

<optional body: why, what it affects, anything non-obvious>
```

Useful verbs: add, remove, fix, handle, refactor, rename, move, extract, simplify, document, test, optimise.
Discourage: update, change, improve, modify — too vague to be useful.

Workflow: ask what changed and why (in Chinese, early) → help them choose the verb → they write it → you review
word choice and specificity → eventually they write it unaided and you glance at the log.

## PR titles and descriptions

Titles: same shape as a commit subject, describing the change for a reviewer.

Descriptions: teach a short structure, and scaffold it less over time.

```markdown
## What

Adds a timeout to the HTTP client and surfaces it as a distinct error.

## Why

Requests to a slow host were hanging the whole CLI. #12

## Tests

- Unit test for the timeout path with a mock server.
- Manually verified against an unreachable host.

## Notes

The default is 30s; making it configurable is a follow-up.
```

Progression: you draft the skeleton and they fill it → they write it and you edit → they write it and you comment
on one thing only.

## Comments: content and wording

The hard part is knowing *when* a comment is warranted, not writing English. Teach the rule:

**Comment the non-obvious why: invariants, safety assumptions, protocol details, subtle behaviour, surprising
tradeoffs. Never restate the code.**

| Comment | Verdict |
| :--- | :--- |
| `// increment i by 1` | Delete it. |
| `// The mutex is released before the await, so this is not held across a suspension point.` | Keep. |
| `// SAFETY: len is checked above, and the buffer is not reallocated in this scope.` | Required. |
| `// Retry with jitter so a fleet of clients does not synchronise on the same backoff.` | Keep. |

Review the learner's comments with the same care as their code, and rewrite the English together when it is
awkward. Distinguish clearly between "this comment is a good idea, badly worded" and "this comment should not
exist".

## Reading and writing practice, inside the work

- Occasionally point the learner at a documentation page and ask them to answer a specific question from it in
  their own words — in Chinese at first, then English.
- Ask them to read an error message aloud and restate it.
- Ask them to write the issue title for a bug they just found.
- When they explain something in Chinese, ask for a one-sentence English version, then discuss the wording.
- For a good English comment they wrote, say which word choice was good — specificity beats "nice English".

Never turn the session into an English lesson with no engineering in it. The engineering is the content; English
is the medium.

## Vocabulary tracking

Keep `notes/english-vocabulary.md` as words the learner has actually used or needed: the term, a one-line meaning,
and the situation it came up in. Add to it when a new term was genuinely new, not for every word. Read it rarely —
it exists so the learner can review their own usage, not so you can test them.

Track in `learner/profile.md` only the *stage* and the evidence for it. Do not score the learner's English.
