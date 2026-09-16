# Open-source engineering

Open-source engineering teaches the learner to work inside someone else's project — choosing a task, making a
change that will be accepted, and communicating with maintainers — so that contributing becomes a repeatable
process rather than a gamble.

## What to teach

| Area | Topics |
| :--- | :--- |
| Reconnaissance | README, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE`, issue and PR templates, CI config |
| Conventions | Formatting, lint configuration, commit message style, branch naming, changelog practice, review norms |
| Issue selection | Good-first-issue labels, unassigned work, issues with a clear reproduction, what to avoid |
| Requirement reading | Restating the problem in your own words before writing code; asking when the ask is ambiguous |
| Reproduction | Building the project, running the test suite, reproducing the reported bug, recording the steps |
| The fix | Minimal, scoped, in the project's style, with a test that fails before and passes after |
| Test expectations | Matching the project's test style, adding regression tests, not rewriting existing tests |
| PR scope | One change per pull request; splitting unrelated cleanups out; the cost of a large diff |
| PR description | What changed, why, how it was tested, what was considered and rejected, linked issue |
| Review feedback | Responding to comments, agreeing and disagreeing with evidence, force-push etiquette, review rounds |
| Releases | Changelogs, release notes, tags, what consumers read and what maintainers write |
| Versioning | Semantic versioning, breaking change definition, pre-1.0 conventions, feature gating |
| API compatibility | Additive changes, deprecation paths, MSRV promises, why a public type is a commitment |
| Reviewing others | Reading a diff, judging correctness and scope, writing specific and kind comments |

## Sequence

1. **Read before writing.** Contribution guidelines, code of conduct, the last ten merged pull requests. The
   learner should be able to describe how this project accepts changes before proposing one.
2. **Reproduce before fixing.** Build it, run the tests, reproduce a reported bug, and write down the exact
   steps. A fix for a bug you cannot reproduce is a guess.
3. **One small contribution.** Documentation typo, a failing edge case, a missing `#[must_use]`, an error
   message that does not name the offending value. Small, correct, and merged.
4. **A bug fix with a regression test.** The first contribution where the learner writes code that matters and
   a test that would have caught the bug.
5. **The PR description and the review round.** Writing it well is half the skill; responding to review is the
   other half. Teach them together.
6. **A feature contribution**, only after several small successes. Features need design discussion, so this
   stage is where the learner learns to open an issue *before* writing code.
7. **Reading a diff as a reviewer**, using their own pull requests first and then someone else's.
8. **Versioning, changelogs and compatibility**, once the learner has a published or shared project of their own
   where those concepts have consequences.
9. **Maintaining something.** Triaging an issue, labelling, closing a stale PR kindly, cutting a release.

Unlocks: the learner's own repositories get issues, PR descriptions and changelogs because they have practised
the habit elsewhere. Do not let them contribute upstream before they have done the same paperwork on their own
work.

## Teaching notes

**The first contribution should be small and boring, not ambitious.** Learners want to fix something
significant, and their first PR is where that instinct costs them: a large diff from an unknown contributor is
hard to review, easy to reject, and discouraging to have rejected. Deliberately choose something small. A
merged typo fix teaches the entire pipeline — fork, branch, commit style, CI, review, merge — at a cost of ten
minutes. That pipeline is the actual lesson, and the learner now has it forever. Ambition can come second.

**Conventions before code, every time.** Ask the learner to answer, before writing a line: what does this
project's `CONTRIBUTING.md` require, what does CI enforce, what do the last ten merged PRs look like, and how
are commits formatted? A correct change in the wrong shape gets a review comment about the shape, and the
learner reads that as rejection. It is not; it is a project protecting its consistency. Teach this as a research
step with a concrete output, not as advice.

**Failures and how to frame them:**

| Situation | What to tell the learner |
| :--- | :--- |
| PR not merged | Normal. Maintainers have priorities, context and limited time. It is not a verdict on the code or the person. |
| No response for weeks | Ping once, politely. Silence is not hostility; it is a full inbox. Then move on. |
| A reviewer's "nit:" comment | Not a blocker. Address it or say why not, in one sentence. Do not treat it as a rejection. |
| Review asks for a redesign | Ask what constraint you missed. That answer is worth more than the merge. |
| Disagreement with a reviewer | Bring evidence: a test, a benchmark, a spec quote. Persuasion is not the tool. |
| CI fails on a lint you cannot see locally | Reproduce with the project's exact command from CI config. Run it before claiming it is flaky. |
| Maintainer rewrites your patch | Normal for a first contribution. The idea mattered; the form was theirs to set. |

**Disagreement is handled with evidence, not persistence.** The pattern to install: restate the reviewer's
concern accurately, then answer it with something observable — a failing test if they are wrong, a benchmark if
it is a performance claim, a quoted sentence from the spec or the project's own docs if it is a design question.
"I think this is better" is not an argument. "Here is the case where the alternative returns the wrong value,
with a test" is. If the maintainer still disagrees after good evidence, defer and move on; it is their project.

**A "nit" is a courtesy label, and learners misread it in both directions.** Some learners treat every nit as a
blocker and stall. Others ignore nits and look careless. Teach the actual rule: a nit is a small preference the
reviewer has flagged as optional. Fix it if it is cheap, or reply briefly explaining why the current form is
intentional. Never argue about a nit at length.

**Teach how to read a diff as a reviewer.** This is the same skill as reading unfamiliar code, aimed at a
change instead of a repository:

1. Read the description and the linked issue first. What is this *supposed* to do?
2. Look at the diff shape: which files, how many lines, is that proportionate to the stated change?
3. Read the tests first. What behaviour does the author claim to have protected?
4. Read the change in dependency order, not file order — types, then functions, then callers.
5. Look for what is missing: error paths, edge cases, documentation, a changelog entry, a version bump.
6. Ask whether the change is in scope for the PR, not whether it is a good idea in general.

**Teach how to write a review comment that is specific, kind and actionable.** The structure:

- Say what you observed, precisely, with the file and line.
- Say why it matters — the failure it causes, not the taste it violates.
- Say what you would do, or ask a genuine question if you are unsure.
- Label the severity honestly: `nit:`, `question:`, `blocking:`.

Compare the two comments below. The first is the instinct; the second is the skill.

```
// Weak: vague, personal, no direction
This is wrong. Why did you do it this way?

// Better: specific, factual, offers a direction
question: `parse_port` returns `u16` but the caller at line 84 treats `0` as
"not specified". Is `0` a valid port here, or should this be
`Option<u16>`? If it is valid, the caller's check is unreachable.
```

Note what the second comment does not do: it does not assume the author is careless, it does not issue a
verdict, and it leaves the author a way to be right.

**Connect all of this to the learner's own repositories.** The habits are identical and the stakes are lower,
which makes the learner's own projects the right training ground. Before contributing anywhere upstream, require
the learner to:

- write three issues in their own repo with the same structure a good issue has — expected, actual, steps to
  reproduce, environment, version;
- write a PR description for their own change following the template a real project would use — what, why, how
  tested, what was not done;
- write a changelog entry for one of their own releases;
- review one of their own older PRs and leave three honest comments.

A learner who has done this arrives upstream already fluent in the conventions, and their first PR reads like
someone who has been there a while.

**Scope is the most common cause of failed PRs, so teach it as a rule.** One pull request, one change. If the
learner spots a nearby problem while fixing something, the answer is a separate issue, not a second commit. The
exception is a change the fix genuinely requires, and then the PR description should say so explicitly. A
reviewer who sees an unrelated refactor inside a bug fix cannot evaluate either one.

**Semantic versioning and API compatibility, taught concretely.** The version number is a promise to consumers,
so the learner must be able to classify a change:

| Change | Version effect |
| :--- | :--- |
| Bug fix, no API change | Patch |
| New public function, type or trait implementation | Minor |
| Change to an existing function's signature, removed item, changed enum variant | Breaking — major, or minor under `0.x` |
| Behaviour change that is not an API change | Judgement: it breaks someone. Say so loudly in the changelog. |
| Adding a variant to a public non-`#[non_exhaustive]` enum | Breaking, and the classic mistake |
| Adding a required feature or raising MSRV | Minor at best, breaking in practice for some consumers |

That last group is where learners get it wrong, because the signature did not change. Rust makes this concrete
and teachable: `#[non_exhaustive]`, `#[deprecated]`, and a defaulted trait method are the tools for evolving a
public API without breaking consumers.

**Changelogs are written for consumers, not for the author.** The learner's instinct is to list commits. The
right entry says what changed for the person using the library, and what they must do about it. "Fix edge case
in parser" is a commit. "Fix panic when a header value is empty; callers relying on `unwrap` will now receive
`Error::EmptyHeader`" is a changelog entry.

**Do not let the learner open a large PR as a first move.** If they want to add a feature to a project, the
sequence is: open an issue describing the change and asking whether it is wanted, wait for a maintainer's
answer, then implement with the design already agreed. Writing the code first and asking later means the review
is a design argument with work already invested on the wrong side. Learners resist this because it feels slower.
It is faster.

## Evidence of mastery

- Reads a project's contribution guidelines and describes its acceptance process, commit style and review norms
  before writing any code.
- Reproduces a reported bug from its written steps, and records the environment and version where it occurs.
- Writes a failing regression test first, then a minimal fix, and explains why the change is scoped to the
  reported behaviour.
- Writes a PR description that states what changed, why, how it was tested, and what was deliberately left out.
- Splits an over-broad change into two pull requests unaided, and justifies the split.
- Responds to a review comment disagreeing with evidence rather than restatement, and defers when the evidence
  does not persuade.
- Classifies a given change as patch, minor or breaking, and names the `#[non_exhaustive]`, `#[deprecated]` or
  defaulted-method technique that would make it non-breaking.
- Writes a changelog entry aimed at a consumer, stating the impact and the required action.
- Reviews a diff and leaves comments that are specific, labelled by severity, and actionable, including at least
  one genuine question rather than a verdict.
- Traces a reported symptom to its cause in an unfamiliar project, using the project's own tests as evidence.
- Opens an issue for a change they intend to make, and waits for a design answer before implementing.

## Projects that teach this

- **First contribution on a small crate.** Deliberately choose something minor — an unclear error message, a
  missing test, a documentation error — and take it through the full pipeline. The merge is the outcome; the
  process is the lesson.
- **Own-project paperwork pass.** Before any upstream contribution, the learner writes issues, a PR description,
  a changelog and a self-review for one of their existing repositories, using a real project's templates. Cheap,
  fully under their control, and it installs the format.
- **Bug reproduction challenge.** Take a real issue from a real project and reproduce it in a local clone
  without proposing a fix. Reproducing accurately is a skill in itself, and half of all issue comments fail at it.
- **Review exchange.** The learner and mentor swap diffs and review each other's work using the
  specific-kind-actionable structure. The learner must leave at least one `nit:`, one `question:` and one
  `blocking:` comment, each justified.
- **Simulated release.** Take a learner project from `0.1.0` to `0.2.0`: decide what version the change merits,
  write the changelog, tag it, write the release notes, and describe the deprecation path for anything removed.

## Related

`codebase-reading`, `git-github`, `testing`, `engineering-english`, `software-architecture`, `security`.

See [index.md](index.md) for routing and prerequisites — this domain requires codebase reading, Git and GitHub,
and testing before it is honest. [testing.md](testing.md) for regression tests and matching a project's test
style, [debugging.md](debugging.md) for reproducing a reported bug reliably, [performance.md](performance.md)
for evidence when a review turns on a performance claim, and [../rust/rust-language.md](../rust/rust-language.md)
for the API-evolution tools — `#[non_exhaustive]`, `#[deprecated]`, defaulted trait methods — that make
compatibility a design decision rather than an accident.
