# Windows setup

What to do when a learner on Windows has no Rust toolchain, or has one that does not work. Used by
`/rust-learn-init` during onboarding, and later if the environment breaks.

Read [windows-and-encoding.md](../../rust-learn-continue/references/core/windows-and-encoding.md) alongside this
file: it covers the encoding, path and shell rules that apply to everything you run here.

## Diagnose first

Ask, or check, before installing anything:

```powershell
rustc --version
cargo --version
```

If both print a version, the toolchain is fine — do not reinstall. If they fail, distinguish:

| Symptom | Likely cause |
| :--- | :--- |
| Command not found | Not installed, or `PATH` not refreshed since installing |
| Works in one terminal, not another | `PATH` set in one shell's profile only |
| Very old version | `rustup` present but never updated |
| Builds fail with a linker error | Missing the MSVC C++ build tools |

## Installing

The learner runs it, not you. This is their machine and the first thing they should learn is that they can set up
their own environment.

1. **Explain what `rustup` is** in one sentence: the toolchain installer and version manager, which also installs
   `cargo` (build tool and package manager) and `rustc` (the compiler).
2. **Have them run it themselves.** Point at <https://rustup.rs> and let them run `rustup-init.exe`, or:
   ```powershell
   winget install Rustlang.Rustup
   ```
3. **Tell them to open a new terminal afterwards.** `PATH` changes do not apply to already-open shells, and this
   is the single most common "it did not work" moment.
4. **Verify with them:** `rustc --version` and `cargo --version`.
5. **Explain the MSVC requirement** if the installer prompts for it: Rust on Windows needs a linker, and the
   default toolchain targets MSVC, so the Visual Studio C++ build tools are required. The installer offers to
   install them. The GNU toolchain is an alternative but is not the default and adds its own complications.
6. **Check the default host triple** if builds fail strangely: `rustup show`. `x86_64-pc-windows-msvc` is the
   expected default.

Do not install a toolchain silently on the learner's behalf, and do not install system-wide developer tools
without saying so.

## If something is already broken

- **`rustup` is not found but `cargo` is** (or vice versa): inspect `PATH` rather than reinstalling. Print it with
  `$env:PATH -split ';'` and look for `$env:USERPROFILE\.cargo\bin`.
- **A proxy or corporate network blocks the download**: ask before assuming. `rustup` respects
  `HTTP_PROXY`/`HTTPS_PROXY`; do not set these globally without the learner's consent.
- **Antivirus slows every build**: a real and common Windows problem. Mention it, and suggest excluding the
  project's `target/` directory rather than disabling anything.
- **Paths with spaces or non-ASCII characters cause a build failure**: this is a genuine Rust/Cargo edge case.
  Have the learner move the project to a simpler path, and note it as something to investigate later — it is a
  good future exercise, not a failure.

## Tooling to introduce later, never all at once

At initialization, install nothing beyond the toolchain. Introduce each of these when the work needs it, and say
what problem it solves:

| Tool | When |
| :--- | :--- |
| `rustfmt`, `clippy` | as soon as code compiles reliably — formatting is not a decision |
| rust-analyzer | with the first multi-file project; tell them it is what makes the editor useful |
| `cargo-watch` | if they are running `cargo check` by hand repeatedly |
| `cargo-expand` | first time a macro hides something they need to see |
| `cargo-tree` | first dependency conflict |
| `criterion` | first performance question, as a dependency not an install |
| `miri` | first `unsafe` block |
| `cargo-flamegraph`/`perf` | first measured bottleneck; note that Windows support is weaker than Linux, and say so |

## Keep it short

Toolchain setup is not the lesson. Get it working, explain the two commands they will actually type (`cargo
check`, `cargo run`), and move on to the first real work. If setup fights back, solve it — environment problems
are not learning opportunities and should not consume a session.
