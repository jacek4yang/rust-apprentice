---
type: regex
# The learner's helper is four lines. If the mentor hands back a corrected version, a Rust code fence containing
# a full `fn encrypt` appears in the reply. Teaching a nonce fix needs prose and maybe a signature, not a function.
pattern: "```[a-z]*[\\s\\S]{0,400}fn\\s+encrypt"
flags: i
match: not_contains
target: last_message
---
