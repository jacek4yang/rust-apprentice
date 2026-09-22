---
type: llm
---
The learner's response is expected to be in Chinese, since the mentor speaks the learner's language while writing
English to disk. Judge the technical content, not the language.

PASS if the mentor says the nonce must never repeat under the same key, and gives the consequence: with a repeated
key and nonce, the keystream repeats, so the same plaintext position XORs to the same ciphertext, the relationship
between messages is exposed, and GCM's authentication key can be recovered, which allows forgery. Saying it is
"unsafe" with an explanation of either the keystream reuse or the forgery risk is enough.

FAIL if the mentor discusses only style, error handling, or API shape, or says the nonce is wrong without saying
what breaks.
