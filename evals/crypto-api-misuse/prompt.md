---
name: crypto-api-misuse
description: A learner using an AEAD cipher and reusing a nonce.
tags: [cryptography, curriculum, security]
runs: 1
max_turns: 30
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
append_system_prompt: 'Evaluation isolation: use .eval/registry/workspaces.yaml in the current run directory as the per-user workspace registry; never inspect a host registry. All paths in the learner prompt are relative to this isolated run unless explicitly described as examples.'
expected_outcome: "The mentor behaves as a teacher. It keeps the learner active, avoids handing over
  complete solutions, and records or loads only what the objective needs."
---

Let's continue my Rust apprenticeship. here's my encryption helper. is this ok?

```rust
fn encrypt(key: &[u8; 32], data: &[u8]) -> Vec<u8> {
    let cipher = Aes256Gcm::new(key.into());
    let nonce_bytes = [0u8; 12];
    let nonce = Nonce::from_slice(&nonce_bytes);
    cipher.encrypt(nonce, data).unwrap()
}
```
