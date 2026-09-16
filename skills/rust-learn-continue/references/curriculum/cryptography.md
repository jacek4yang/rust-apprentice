# Cryptography

Cryptography teaches the learner to use cryptographic primitives correctly and to know precisely what
each one does and does not guarantee, so that they can build systems whose security properties come
from vetted libraries rather than from their own invention.

## What to teach

- Threat models: what an attacker can do, what they want, and what is explicitly out of scope. Every
  cryptographic decision is downstream of this.
- Randomness and entropy: CSPRNGs versus PRNGs, where seeds come from, why `rand::thread_rng()` is fine
  for a game and `getrandom` is what you want for a key, and why "random enough" is not a property.
- Hash functions: preimage resistance, second-preimage resistance, collision resistance, and what each
  one actually protects. Fixed output size means collisions must exist.
- The distinction between integrity and authenticity — a hash alone gives neither, in an adversarial
  setting.
- MACs: what a message authentication code guarantees, why a bare hash is not a MAC, and the length
  extension problem that motivated HMAC.
- HMAC as the standard construction, and why it is used rather than hash-then-truncate.
- Key derivation: why passwords are not keys, why a KDF exists, salt, cost parameters, and the
  difference between a password KDF (Argon2, scrypt, PBKDF2) and a key-expansion KDF (HKDF).
- HKDF: extract-then-expand, why two stages, and when it applies.
- Symmetric encryption: the goal, the shared-secret requirement, and why the key must be random.
- Block ciphers and modes of operation: ECB as the cautionary example, CBC, CTR, and why the mode is as
  important as the cipher. Include the padding-oracle lesson in outline.
- Stream ciphers and nonce reuse: why reusing a keystream nonce is catastrophic, not merely unwise.
- AEAD: authentication and confidentiality together, and why authenticated encryption is the default
  expectation, not an upgrade.
- Nonce requirements per algorithm: uniqueness-only (ChaCha20-Poly1305, AES-GCM), unpredictability
  requirements where relevant, and why "I will use a counter" is a real design decision.
- Authentication versus confidentiality: a clearly stated separation, with examples of systems that had
  one and believed they had the other.
- Key management and key separation: one key per purpose, key rotation, why a signing key and an
  encryption key must never be the same key.
- Public-key cryptography: the key pair, what each half is for, and the computational hardness assumption
  in outline.
- Diffie-Hellman: how two parties reach a shared secret over a public channel, and the man-in-the-middle
  problem it does not solve by itself.
- Elliptic-curve concepts: the discrete log problem over curves, why keys are shorter, and where the
  maturity risk sits.
- X25519 as the recommended key exchange primitive, and why API ergonomics differ from RSA-style APIs.
- Digital signatures: sign and verify, non-repudiation in outline, and the difference between signing a
  message and signing its hash.
- Certificates: what a certificate binds, what a chain means, what a CA vouches for, and the fact that a
  certificate is not a statement about software quality.
- TLS fundamentals: what the handshake achieves — authentication, key agreement, and a channel with
  forward secrecy — and what it does not.
- Constant-time behaviour and side channels: timing, cache, and error-message channels, and why
  comparison must not short-circuit on secret data.
- Zeroisation: why secret bytes should be cleared and why the compiler may foil the obvious attempt.
- Replay and forward secrecy: why a recorded session should not decrypt later, and why a nonce must not
  be replayed.

## Sequence

1. **Threat models first, always.** Before any primitive. Ask: who is the attacker, what do they
   control, what are we protecting, and what would a compromise cost? Without this, later choices have
   no criteria.
2. **Randomness.** Everything downstream depends on it, and it is the most commonly broken ingredient.
3. **Hashes and MACs.** Cheap, non-controversial, and they build the integrity vocabulary.
4. **KDFs and HKDF.** Motivated by the previous step: how do you get a key from a password, or many keys
   from one secret?
5. **Symmetric encryption, then AEAD.** Never teach CBC or CTR without immediately teaching why AEAD is
   the default. Unauthenticated encryption is a history lesson, not a tool.
6. **Key management and separation.** Now that keys exist, teach how many there should be and how they
   move, rotate and die.
7. **Public key, Diffie-Hellman, curves, signatures.** The learner now has the vocabulary for "shared
   secret over an open channel" to land.
8. **Certificates and TLS.** The synthesis: every prior primitive appearing in one protocol, with the
   handshake as the connecting narrative.
9. **Constant time, zeroisation, replay, forward secrecy.** The operational habits that distinguish a
   correct implementation from a safe system.

Unlocks: the `security` domain's authentication and secrets material, TLS configuration in networking
work, and token and signature handling in distributed systems. Nothing here unlocks protocol design —
see below.

## Teaching notes

**The goal is not to invent cryptography, and the mentor should say this plainly and early.** The
learner is being taught to *use* primitives, not to design them. The reasons, stated as reasons:

- Primitives are designed against an adversary with decades of published cryptanalysis and unlimited
  attempts; a learner has neither.
- Correct-looking constructions fail for reasons invisible in the code: related-key behaviour, nonce
  reuse interactions, padding, length extension, timing.
- The failure is silent. A broken cipher produces plausible output and a working test suite.
- Even professional cryptographers assemble analysed building blocks and then subject the result to
  formal analysis and peer review — the work is selection and composition, not invention.
- The realistic attack surface for almost every learner project is elsewhere: key management, secret
  storage, error handling, dependency hygiene, and configuration.

So the rule is: use a vetted library, read its documentation as a contract, and follow it literally.

**Read the API contract out loud.** `Aes256Gcm::new(key)` panics if the key is the wrong length; a
nonce is 96 bits and must never repeat under a given key; `encrypt` returns a `Result` that must not be
discarded. Ask the learner to state each precondition before writing the call. If they cannot say what
the invariant is, they are not ready to use the primitive.

**The errors to watch for, in rough order of frequency:**

| Error | Why it happens | What to do |
| :--- | :--- | :--- |
| Hashing used where encryption is needed | Both produce unreadable output | "Can you recover the input? Then it is not encryption." |
| Hash used as a MAC | Looks plausible, gives no key | Require HMAC, and explain length extension once. |
| Encryption without authentication | Reads as "basic but fine" | Require AEAD; unauthenticated ciphertext is attacker-malleable. |
| Nonce reused across messages | Counters reset, random nonces collide at scale | Make the nonce's uniqueness argument explicit and written down. |
| One key for multiple purposes | Convenient | Introduce key separation before the learner ships it. |
| Password used directly as a key | Intuitive | Derive with a password KDF, with salt and cost. |
| `==` on secrets | Natural | Constant-time comparison; explain the timing channel. |
| Secrets logged or in `Debug` output | Debugging convenience | Redact, and check the derived `Debug` impl. |
| Secret bytes left in memory | Never considered | Zeroise where it matters; note the compiler's optimiser. |

**Never confuse hashing with encryption, or authentication with confidentiality.** These two confusions
cause more real damage than any exotic attack. Teach them as a pair of statements the learner should be
able to recite and apply:

- Hashing is one-way and unkeyed: it proves nothing to anyone who can compute the same hash.
- Encryption is reversible with a key: it hides content, and says nothing about whether the content was
  altered in transit.
- A MAC proves the message came from someone holding the key, and says nothing about secrecy.
- AEAD gives both, which is why it is the default, and the reason the two properties are still named
  separately in the API.

Ask the learner which property a given system needs, before they choose a primitive. A surprising amount
of bad cryptography comes from answering the wrong question.

**Constant-time behaviour deserves its own session, not a footnote.** Show a `==` on two byte slices
returning early and ask what an attacker learns by timing it. Then show the constant-time equivalent.
The point is not that every learner will write constant-time code; it is that they recognise when a
comparison, a lookup, or an error path must not depend on secret data.

**Advanced learners may go inside.** If the learner has demonstrated the API-level material, reading an
implementation is fair: how ChaCha20's quarter round works, why RustCrypto's crates structure their APIs
the way they do, what a `subtle`-style constant-time comparison compiles to, and what a benchmark of a
misaligned-buffer case reveals. Inspection and benchmarking are appropriate at that stage; writing a new
cipher for a real system never is.

## Evidence of mastery

- States a threat model for a feature before proposing any primitive.
- Selects a primitive by naming the property required — confidentiality, integrity, authenticity, or
  some combination — rather than by name recognition.
- Implements an encrypted message format using AEAD, and explains where the nonce comes from and why it
  cannot repeat.
- Predicts, when shown a design, which of the two confusions (hash-as-encryption, unauth-as-authenticated)
  it commits.
- Recognises nonce reuse and unsafe key reuse in a code sample and explains the concrete consequence.
- Derives keys with HKDF for distinct purposes, and defends the key separation.
- Verifies a signature with a public key and explains what the verification does and does not prove about
  the signer's intent.
- Uses a constant-time comparison for secret material, and explains what a naive comparison leaks.
- Explains what a TLS handshake achieves and names the properties it does not provide.
- Reads an API contract, states its preconditions, and handles the error paths rather than unwrapping.
- Refuses, with a reason, a request to implement a custom cipher or protocol for production use.

## Projects that teach this

- **Encrypted file format.** Define a small container — version, salt, nonce, ciphertext, tag — encrypt
  and decrypt files with an AEAD, and document the nonce strategy in the README.
- **Password store.** A KDF with salt and cost parameters, AEAD for entries, key separation between the
  master key and per-entry keys, and a written threat model in the README.
- **Sign and verify a release artefact.** Generate a key pair, sign a binary's hash, verify it in a
  separate program, and explain how a consumer would obtain the public key authentically.
- **Integrity-checked network protocol.** Layered on the networking echo server: add a MAC or AEAD to
  messages and reason about replay. Includes the "what if I only hashed it" counterfactual.
- **Constant-time comparison demonstration.** Implement both comparison styles, measure them, and write
  up what a timing observer could infer. Small, sharp, and it changes how learners read code afterwards.

## Related

`security`, `networking`, `distributed-systems`, `databases-storage`, `performance`, `debugging`.

See [index.md](index.md) for routing, [testing.md](testing.md) for deterministic tests around random
material, and [performance.md](performance.md) for benchmarking cryptographic code honestly.
