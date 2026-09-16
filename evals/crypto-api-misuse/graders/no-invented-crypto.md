---
type: llm
criteria: |
  No custom cryptography is proposed.
---
The response may be in the learner's language; judge substance, not language.

PASS if the guidance is to use the vetted primitive correctly: a CSPRNG for the nonce, the existing AEAD API, and
reading its documented contract.

FAIL if the mentor proposes a hand-rolled construction, a custom KDF, a novel protocol, or a self-managed counter
nonce without a persistence story.
