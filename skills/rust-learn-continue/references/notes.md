# Notes

Notes are the learner's personal engineering handbook. They are written *from* work that actually happened, never
in advance of it.

## Rules

- **A note exists because something was learned, struggled with, or needed twice.** Never create a note because a
  topic exists.
- One file per topic, in `notes/`, with English names: `ownership.md`, `error-handling.md`, `http-clients.md`,
  `git-rebase.md`.
- Notes are short. A 40-line note that is accurate beats a 400-line note that restates the Rust book.
- A note is not a textbook chapter. No "Introduction" sections, no history, no completeness.
- `notes/english-vocabulary.md` is the one exception to the topic-per-file pattern.

## When to write one

Write or extend a note when:

- The learner hits a concept twice and needed an explanation both times.
- A mistake of theirs was interesting and general — record it as *their* mistake, not as a rule.
- A crate, API, or command was genuinely needed and is likely to be needed again.
- A debugging technique or a compiler message worth remembering came up.
- A command was used successfully for the first time and is not obviously memorable.

Do not write notes during a session's opening. Notes come from what happened, so they come later, and sometimes in
the next session.

## Structure

Keep the same shape, loosely, so notes are scannable and cheap to read:

```markdown
# Borrowing rules

## What it is
Two-sentence statement of the rule, in the learner's own framing where possible.

## Why it matters
What breaks without it — one or two sentences, ideally referencing a real mistake made here.

## The rule
The precise statement, including its limits. Synonyms and adjacent concepts.

## Minimal example
The smallest code that shows it. Correct code, not broken code.

## Mistakes I made
- 2026-09-14 — added `.clone()` to fix an error instead of returning a reference from the helper.
  The clone was unnecessary: the function should have taken `&str`.

## Commands / API
- `rustc --explain E0502`

## See also
- `error-handling.md` (a sibling note in `notes/`)
- The Rust Book, chapter 4 — https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html
```

## Who writes them

Mostly the learner, guided. The note is where the "explain it in your own words" evidence becomes durable.

- Early sessions: you draft, they correct and add their own mistakes section.
- Later: they write it, you review it for accuracy and English.
- Later still: they write notes unprompted, and you only read them.

Writing a note in their own words is itself a retrieval exercise — treat it as one, and expect the first draft to
be wrong in instructive ways.

## English in notes

Headings, terms, code, and commands are English from the start. Prose may be written in the learner's own
language early, with English technical terms embedded as they are learned. As the learner's stage advances
([english.md](english.md)), shift the prose toward English, and correct their English the same way you would
correct their code — specifically, not generally.

Never let a note become a Chinese document with English headings. The transition is gradual but it must be
visible.

## Reference links

Every note that documents a concept should link to the authoritative source: the Rust Book chapter, the standard
library page, `docs.rs` for a crate, the relevant RFC, or the man page. Linking also teaches where to look next
time — the point of the exercise is that eventually the learner goes there directly.

## Housekeeping

- Note titles should match the learner's vocabulary, not the documentation's.
- Merge two notes when they overlap into something incoherent; split one when it grows past a few hundred lines.
- Stale or superseded notes: correct them rather than deleting, since the correction itself is information.
- `notes/` should stay small enough to list on one screen. If it grows past a few dozen files, group by directory
  (`notes/rust/`, `notes/git/`, `notes/networking/`).

## The end state

Somewhere around a year in, `notes/` should be the thing the learner reaches for before asking anyone anything —
including the mentor. That is the success condition for this part of the system, and it is worth naming out loud
when it starts happening.
