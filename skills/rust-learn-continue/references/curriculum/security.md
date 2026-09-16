# Security

Security teaches the learner to reason about what an attacker can do with the inputs their program accepts, so
that safety is a property of the design rather than a hope about the inputs.

## What to teach

| Area | Topics |
| :--- | :--- |
| Untrusted input | Trust boundaries, validation at the boundary, canonicalisation, rejection by default |
| Safe parsing | Total parsers, length and depth limits, malformed encoding, parser differentials, fuzzing inputs |
| Memory vs logical safety | What Rust guarantees, what it does not, and the bug class that survives both |
| `unsafe` boundaries | Where `unsafe` is legitimate, what the safety comment must state, auditing a crate's `unsafe` |
| Authentication | Password hashing, credential storage, session tokens, expiry and revocation, multi-factor concepts |
| Authorisation | Authentication is not authorisation; per-object checks, IDOR, deny by default, roles and permissions |
| Secrets | Secret stores, rotation, why secrets leak through logs, `Debug` impls and error messages |
| Supply chain | Dependency risk, transitive dependencies, lockfiles, `cargo audit`, maintainer trust, typosquatting |
| Path traversal | Joining untrusted paths, `..` and absolute paths, canonicalisation, allow-listing roots |
| Injection | SQL, command, template and log injection; parameterisation; the shell as a hazard |
| TOCTOU | Check-then-use races on the filesystem and elsewhere; why the check must be the operation |
| Resource exhaustion | Unbounded reads and allocations, decompression bombs, regex backtracking, request limits |
| Protocol abuse | Oversized headers, slowloris, request smuggling, version confusion, client-supplied metadata |
| Secure defaults | Fail closed, least privilege, opt-in for dangerous features, safe configuration out of the box |
| Fail-safe vs fail-open | What happens when a check cannot complete — "cannot check" must mean "deny" |

## Sequence

1. **Trust boundaries first.** The learner must point at their program and say which bytes came from outside.
   Everything else here is downstream of that question.
2. **Input validation and safe parsing.** Concrete and testable. A parser that rejects malformed input is the
   learner's first security artefact.
3. **Memory safety versus logical safety**, using Rust itself as the example.
4. **`unsafe` boundaries**, once the learner can judge whether a safety comment is honest.
5. **Authentication, then authorisation** — passing the first says nothing about the second.
6. **Secrets handling**: cheap to get right, expensive to get wrong.
7. **Injection and path traversal** as one idea: data reaching an interpreter or a filesystem is parameterised or
   canonicalised, never concatenated.
8. **TOCTOU and resource exhaustion**, once the learner can see the race and the unbounded allocation.
9. **Supply chain**, once there is a project with real dependencies.
10. **Secure defaults and fail-safe behaviour**, the design habit that ties the domain together.

Unlocks: a service that rejects bad input and never fails open, then a review of an existing codebase's trust
boundaries, then threat modelling before code is written.

## Teaching notes

**The central point, and it must be made repeatedly: Rust's memory safety is a genuine advantage, and it does
not make software secure.** A safe Rust program with no `unsafe` anywhere can still authorise the wrong user
because the check is missing on one route; suffer SQL injection because it built a query with `format!`; read
`/etc/passwd` because it joined a user-supplied path; exhaust memory because it trusted a length field; and leak
credentials because a `Debug` impl printed them into a log.

Say this out loud in the first session and again whenever the learner starts to relax. The compiler eliminates
an entire class of vulnerability, which changes the *shape* of the remaining risk — it does not reduce the
remaining risk to zero. Learners arriving from C or C++ often arrive over-corrected; learners who only know Rust
often assume the compiler is the security model. Both need the same correction.

**The specific trap: a `Result`-returning API is not a validated input.** Learners see
`serde_json::from_str::<Config>(&body)?` and read `?` as "this input was checked". It was *parsed*. Parsing
establishes that the bytes form the shape you asked for; it says nothing about whether the values in that shape
are acceptable. `User { id: 0, role: "admin" }` parses perfectly. Teach three separate steps, always:

1. **Parse** — is this well-formed for its type?
2. **Validate** — are the values in range, in the allowed set, referring to objects this actor may touch?
3. **Authorise** — is this actor permitted to perform this action on this object, right now?

Collapsing these into one call is where most real vulnerabilities live. Make the learner write the three as
separate functions with separate error types before they are allowed to combine them.

**Validation happens at the boundary, once.** If every internal function re-validates, validation is a rumour
rather than a design. If none does, one caller will forget. Parse into a type that cannot be constructed without
validation — a newtype whose constructor performs the check — so that holding the value *is* the proof. An
internal function taking that newtype then needs no check, and a reviewer sees that from the signature alone.

```rust
pub struct Username(String);

impl Username {
    pub fn parse(raw: &str) -> Result<Self, InvalidUsername> {
        // length, allowed characters, normalisation — here, once, enforced by the type
        todo!()
    }
}
```

**Deny by default is a design habit, not a settings page.** For each feature ask: when this is misconfigured,
does it fail closed or open? A missing authorisation rule means "denied", not "allowed". An unparsable policy
means "refuse to start", not "run with no policy". Learners write the opposite by accident, because allowing is
the easy default.

**Secrets: the leak paths are boring and predictable.** Teach the learner to check their own code for
`#[derive(Debug)]` on a struct holding a token (the derive prints it — write `Debug` by hand and redact); error
messages that embed a connection string including its password; whole-request or whole-config logging at `info`
or `debug`; panics and backtraces carrying values out of the process; and committed `.env` files and fixtures.
Check history, not just the working tree. A secret committed to git must be treated as compromised and rotated,
not deleted in a later commit — say this explicitly, because deleting the file is the instinct.

**Injection: parameterisation or canonicalisation, never concatenation.**

| Hazard | The naive form | The right form |
| :--- | :--- | :--- |
| SQL | `format!("SELECT ... WHERE id = {id}")` | Bound parameters in a query builder or prepared statement |
| Shell | `Command::new("sh").arg("-c").arg(user_input)` | `Command::new(program).args(fixed_list)`, no shell |
| Path | `base.join(user_input)` | Reject non-normal components, then verify the canonical result is under `base` |
| Log | `info!("user {name} logged in")` | Structured fields; strip or escape control characters |

`Command::new("sh").arg("-c")` with interpolated input is a shell injection in Rust, not less dangerous because
Rust is the language. `Path::join` with an absolute path discards the base entirely, and `..` components walk
out of it. `canonicalize` after the join is a partial answer, not a complete one.

**TOCTOU: the check and the use must be one operation.** `if path.exists() { File::open(&path)? }` is not safe,
and not safe "in practice" either — the file may be a symlink by the time you open it. Use an API where the
operation is atomic with the check: open with the right flags and handle the error, rather than testing first.
The same shape appears in authorisation (check role, then fetch the object) and in reservation systems (check
stock, then decrement) — recognise the pattern once and it transfers.

**Resource exhaustion is a security topic, and it is always about something unbounded.** Ask the learner to find
every place their program reads a length from the input and trusts it, allocates based on it, decompresses it,
or recurses on it. Then require a limit. Regex backtracking on attacker-controlled patterns, recursive parsers
without a depth limit, and `read_to_end` on a network stream are all the same bug.

**Fail-safe versus fail-open deserves its own session.** Your authorisation service is unreachable: do you serve
the request or reject it? Both answers are defensible in specific contexts, and the failure is choosing by
accident. The learner should name, for each check in their system, which way it fails and why that is intended.
"Cannot determine" must have an explicit answer.

**Supply chain: treat every dependency as code you shipped**, because it is. Know why each direct dependency is
in `Cargo.toml`; run `cargo tree` once and count the transitive dependencies; run `cargo audit` and read what it
reports. A learner who has never looked at a dependency's own dependency tree has not understood the exposure.
Do not frighten them into vendoring everything — teach attention spent proportionally.

**Do not teach exploits before the design habit.** A learner who can recite a memory-corruption taxonomy but
writes an endpoint that trusts a client-supplied `user_id` is not learning security. Start with the boring,
high-frequency mistakes — missing authorisation checks, path traversal, secrets in logs — because that is what
actually breaks systems. Exploit technique is interesting and mostly not the learner's problem in Rust.

## Evidence of mastery

- Draws their program's trust boundaries and names what crosses each one.
- Diagnoses an authorisation gap: given an endpoint, says who may call it, which object-level check is required,
  and what happens when the check is missing.
- Writes a validating type whose constructor enforces an invariant, so downstream code needs no re-check.
- Rejects path traversal in a file-serving handler without being told the attack, using normalisation and a root
  check.
- Explains, in their own words, why a `Result`-returning parse call does not mean the input was validated.
- Writes a hand-rolled `Debug` impl that redacts a secret, and finds three other leak paths in a real codebase.
- Identifies a TOCTOU check-then-use in code they wrote, and rewrites it as a single atomic operation.
- Lists every unbounded read, allocation or recursion reachable from untrusted input, and adds limits.
- States, for each check in a service, whether it fails open or closed, and defends the choice.
- Runs `cargo audit` and `cargo tree`, explains the result, and decides which transitive dependency deserves
  attention.
- Reviews a diff and identifies whether the change moves validation to the boundary or duplicates it inward.

## Projects that teach this

- **Hardened file service.** Serve files from a configured root, over HTTP, with authentication and per-file
  authorisation. Then attack it: `../`, absolute paths, symlinks, unicode-normalised paths, oversized requests,
  and a slow client. The learner's own attack attempts make the rules concrete.
- **Input-validation library for a real domain.** Types that parse and validate emails, usernames, monetary
  amounts or identifiers, with tests for the inputs nobody wants. Teaches boundary validation and total parsing.
- **Secret-handling refactor of an existing project.** Take a project the learner already wrote and remove every
  secret from logs, `Debug` output, error messages and git history, with rotation notes. Small and memorable.
- **Authorisation layer with tests.** Roles, permissions, per-object rules, deny-by-default, and a test suite
  that asserts the negative cases — every role that must *not* be able to do something.
- **Resource-limits hardening harness.** A load generator and a server with configurable limits, run until the
  learner can show which limit held and which one was missing. Doubles as a `performance` exercise.

## Related

`cryptography`, `networking`, `databases-storage`, `operating-systems`, `concurrency`, `codebase-reading`,
`open-source-engineering`, `software-architecture`.

See [index.md](index.md) for prerequisites and routing, [testing.md](testing.md) for negative-case and
property-based testing of parsers and validators, [debugging.md](debugging.md) for finding leaks in real code,
[performance.md](performance.md) for the cost profile of limits and hashing, and
[../rust/rust-language.md](../rust/rust-language.md) for newtypes, `Result`, and why the type system is the
first place to encode a security invariant.
