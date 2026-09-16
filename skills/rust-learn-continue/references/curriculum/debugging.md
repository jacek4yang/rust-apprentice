# Debugging

Debugging is the discipline of turning a vague report of "it does not work" into a specific, falsifiable claim about
what the program did wrong, and it is the skill that most distinguishes an engineer who can be trusted with an
unfamiliar system from one who cannot.

## What to teach

- Reading compiler diagnostics semantically: the primary error, the secondary notes, the `help` suggestions, and
  how to tell which line actually caused the problem rather than which line was flagged.
- `rustc --explain E0502` and its relatives, plus the habit of looking up an error code instead of searching the
  message text.
- `cargo check` as the fast feedback loop; `cargo clippy` for the classes of bug the compiler permits.
- Logging with the `log` facade and a backend, versus printing. Levels, targets, and the cost of formatting
  arguments that are never emitted.
- Structured tracing with `tracing`: spans, events, fields, the `#[instrument]` attribute, and subscribers. Why a
  span carrying a request ID beats a log line that repeats it.
- Assertions as executable documentation: `assert!`, `assert_eq!`, `debug_assert!`, and why the debug-only variant
  belongs on hot paths and internal invariants.
- `unwrap` versus `expect` as a debugging tool: `expect` states the invariant that was violated, which is the first
  thing an investigator needs.
- Minimal reproduction: reducing a failing case by deleting code, inlining data, and shrinking inputs.
- Bisection by hand, and `git bisect run` with a test as the oracle. `git bisect` in a Rust workspace, including
  the caveat that a bad commit may fail to compile.
- Debugger basics: breakpoints, stepping, inspecting variables, and backtraces. `rust-gdb` and `rust-lldb` wrappers,
  pretty-printers for Rust types, and the honest state of debugger support on Windows (`cdb`/WinDbg, or lldb via
  a MinGW or WSL toolchain) versus Linux.
- Stack traces: `RUST_BACKTRACE=1`, `RUST_BACKTRACE=full`, `std::backtrace::Backtrace`, and reading a release-mode
  trace whose frames were inlined away.
- Panics as crashes: where panic messages come from, `panic = "abort"` in a release profile, and catching a panic
  for diagnosis without pretending it is error handling.
- Crash investigation: exit codes, core dumps where available, and reconstructing the state at the failure point.
- Data race investigation: `cargo miri` for undefined behaviour, `--sanitizer` flags on nightly, and the reason a
  deadlock produces no output at all. This overlaps heavily with `concurrency`.
- Network diagnosis: `curl -v`, timeouts and where they fire, DNS resolution failure against connection failure,
  and packet capture with `tcpdump` or Wireshark when the peer's story and yours disagree.
- Filesystem diagnosis: `NotFound` versus `PermissionDenied`, path separators on Windows, long paths, locked files,
  encoding of filenames, and reading the `io::Error` rather than the message string.
- Dependency version conflicts: reading `cargo tree -d`, `cargo tree -i`, understanding semver ranges, and
  resolving a duplicate-crate situation that produces a type mismatch between two versions of the same type.
- Diagnosis versus debugging: confirming which of the four is actually happening (wrong behaviour, crash, hang,
  degraded performance) before choosing a tool.

## Sequence

Start with the compiler. It is the cheapest oracle the learner will ever have, and the feedback loop is seconds
long, so use it to build the habit of reading carefully before changing anything. `cargo check` and `cargo clippy`
come before any other tooling because they are the ones used daily.

Then assertions and panics: how to make the program tell you where its own assumptions broke. A learner who writes
`expect("cache must be primed before lookup")` has already learned to encode hypotheses.

Then logging, then structured tracing. Logging first because it is a small step from `println!`; tracing second
because spans only make sense once the learner has felt the pain of correlating interleaved log lines. Do not
introduce `tracing` before there is concurrency or request handling in the project.

Minimal reproduction and bisection come next, and they are the pivot point of this domain. Everything before is
using tools; everything after is method. Once the learner can reduce a failure to twenty lines and find the
offending commit, they can debug a system whose internals they do not fully grasp, which is most systems.

Debuggers come after the learner can already form a hypothesis. A debugger is a way to confirm a guess, not a way
to generate one; taught earlier it becomes a random walk through the program. Windows learners should meet the
debugger with realistic expectations and be shown the substitute tools.

Crashes, races, network, and filesystem diagnosis all unlock as the projects that produce them appear. There is no
point teaching core dumps to someone who has never had a program segfault. Dependency conflicts usually arrive on
their own the first time a project pulls two versions of the same crate, and the lesson lands hardest when it is
their own broken build.

Performance diagnosis belongs here as a diagnostic category, but the tools and the mindset live in `performance`.
Teach only the triage step here: how to tell that something is slow rather than wrong, and how to hand it over.

## Teaching notes

**Do not solve the bug.** This is the single most important rule in this file. The mentor's instinct is to read the
code, spot the mistake, and say it. That produces a fixed program and an unfixed learner. Every time you are
tempted, ask a question instead.

The question sequence, roughly in order, adapted to what the learner already knows:

1. What did you expect to happen?
2. What happened instead?
3. What evidence do we have for that? (Anything not written down or observed does not count.)
4. What is the first diagnostic that is relevant? Where would it come from?
5. What assumption might be wrong here?
6. How can we reduce the problem?
7. Can we write a test that reproduces it?

Question 3 is where most sessions stall, and it is the one that teaches. Learners narrate what they believe
happened. Make them point at output.

**Teach semantic interpretation of compiler errors, not string matching.** Learners quickly learn to pattern-match a
message: see `borrowed value does not live long enough`, apply the fix they memorised last time. This breaks. The
wording changes between compiler versions, error numbers get reworded, and new diagnostics appear. It also breaks
in a way that is invisible on a Chinese Windows system, where the toolchain may emit localised diagnostic text, so
a learner who memorised English phrasing is looking at Korean or Chinese characters with no idea what they map to.
Teach what the error *means*: which value, which region, which owner, which of the compiler's obligations was
violated. If localised output is getting in the way, `rustup` and the toolchain can be checked, but the durable fix
is the same either way, because the meaning is stable and the wording is not.

When the learner pastes an error and asks what it means, ask them to explain it back first, in their own words,
naming the value and the lifetime rather than the error code.

**Diagnostics are not the only signal.** A learner who only reads compiler output will miss hangs, silently wrong
values, and resource exhaustion. Ask what the program should have printed if it were healthy, and whether it did.

**A bug is only understood when there is a test that fails for the right reason.** Not a test that fails, which
proves nothing, and not a test that passes, which proves nothing either. Red for the right reason means the
assertion the mentor and learner agreed on is the thing that fails, and it fails because of the defect rather than
a typo or a missing import. This is the exit condition for every debugging session, and it is worth enforcing even
when it is tedious, because it is also the mechanism that prevents the bug from returning. Hand it to `testing.md`
once it is written.

**Bisection is not just for git.** The same halving idea applies to deleting code from a failing reproduction and
to disabling configuration until the failure disappears. Teach it as a general strategy: find a change that flips
the outcome, then halve again.

**Do not let the learner change two things at once.** When the outcome changes after two edits, nothing has been
learned. Ask which of the two they believe caused it, then revert one and find out.

**Resist the urge to run the code for them.** Running it is information gathering. If the mentor runs it, the
learner has learned that the mentor runs it.

**Watch for the opposite failure too.** Some learners collect evidence forever and never form a hypothesis. After
three pieces of evidence, ask explicitly: what do you now believe is happening? A stated belief is debuggable; an
endless log dump is not.

On Windows, be concrete about tooling rather than aspirational. Full `perf`-style workflows are not available, and
gdb works best inside WSL or with a MinGW toolchain. Steering a learner toward a realistic setup beats pretending
the Linux tutorials apply.

## Evidence of mastery

- Explains a compiler error in terms of values, owners, and regions rather than repeating the message text.
- Uses `rustc --explain` or the error index deliberately, and can say what the code was added for.
- Writes a failing test that reproduces a reported defect before attempting any fix, and confirms it fails for the
  right reason.
- Reduces a bug in a multi-module program to a reproduction short enough to paste into an issue.
- Uses `git bisect run` with a test or command as the oracle to locate a regression commit.
- Diagnoses a hang by collecting evidence about which thread or task is blocked, rather than restarting the program.
- Sets a breakpoint, inspects a value, and steps through a function in a debugger, or explains which substitute
  tools they used on Windows and what that cost them.
- Reads a backtrace from a released binary and identifies the frame that matters despite inlining and missing
  symbols.
- Diagnoses a deadlock or a data race from observed symptoms and supports `cargo miri` output or a stress test.
- Distinguishes a DNS failure from a connection refused from a timeout using command-line evidence, without
  guessing.
- Diagnoses a file error to the specific cause (missing, permission, locked, wrong encoding of the path) using the
  error value rather than the message string.
- Resolves a duplicate dependency by reading `cargo tree -d` and explaining why two versions of the same type are
  not interchangeable.
- Chooses an appropriate tool for a given symptom class, and says when evidence is still insufficient to decide.

## Projects that teach this

- **Deliberately broken workspace.** A small crate with six planted defects: a borrow error, an off-by-one, a
  deadlock, a panic on malformed input, a swallowed `Result`, and a slow loop. Provided with a symptom report and
  no source hints.
- **Regression hunt.** A repository with fifty commits where the learner knows the good and bad revisions and must
  use `git bisect run` with a test they write themselves.
- **Tracing-instrumented request handler.** An HTTP or CLI service where the learner adds spans and fields until
  they can locate a failure in an interleaved concurrent log without adding any new `println!`.
- **Crash reproducer harness.** A tool that takes a failing input file and reduces it automatically, run against a
  parser that panics on specific byte sequences.
- **Network fault diagnosis kit.** A client and server pair with a switchable fault (dropped DNS, refused
  connection, stalled response) and a worksheet of command-line evidence to collect for each.

## Related

`testing`, `concurrency`, `async-rust`, `operating-systems`, `networking`, `performance`, `codebase-reading`,
`open-source-engineering`, `computer-architecture`.

See [index.md](index.md) for routing, [testing.md](testing.md) for the failing-test discipline this domain depends
on, [../rust/rust-language.md](../rust/rust-language.md) for the error-handling types being debugged, and
[../rust/ownership.md](../rust/ownership.md) for the borrow errors that dominate a learner's early debugging.
