# Windows, encodings, and shell robustness

Windows is a first-class platform for this project, not a compatibility afterthought. This file covers the
environment the learner actually has: PowerShell 5.1 and 7, `cmd`, Git Bash, Windows Terminal, legacy
Chinese-language Windows with CP936/GBK consoles, Chinese usernames, and paths with spaces and non-ASCII
characters.

Read this before running shell commands on a learner's machine, and before writing any path or encoding logic.

## Core rules

1. **Internal state is always UTF-8.** Every file the mentor writes — state, notes, evidence, Markdown, Rust
   source — is UTF-8. Never generate GBK. GBK support means *interoperating* with legacy environments, not
   storing in them.
2. **Never permanently change the machine's encoding configuration.** No permanent `chcp 65001`, no registry
   code-page changes, no system locale changes, no global PowerShell profile edits. If a temporary adaptation is
   needed, keep it process-local and restore it.
3. **Prefer machine-readable output over human-readable text.** This is the main defence against encoding
   problems, because it removes localized prose from the pipeline entirely.
4. **Never infer failure from rendered output.** Mojibake in a terminal does not mean the command failed. Check
   the exit code and inspect the actual filesystem state.
5. **Quote every path.** Always. Even when it looks unnecessary.
6. **Prefer the agent's own file tools.** `Read`, `Write`, `Edit`, `Glob`, `Grep` handle paths and encodings
   correctly and sidestep the shell, the code page, and quoting almost entirely. Use them by default.

## Structured output over parsed prose

Localized CLI output is the most common source of breakage on a Chinese Windows system, and it fails silently or
confusingly. Use the structured form instead.

| Instead of | Use | Why |
| :--- | :--- | :--- |
| `git status` | `git status --porcelain` | Stable format, not translated, script-friendly |
| `git log` | `git log --oneline` or `--format=%H%x00%s` | Stable format, no localization |
| `gh pr list` | `gh pr list --json number,title,state` | JSON, not a padded table |
| `gh repo view` | `gh repo view --json name,visibility` | JSON |
| `cargo metadata` text | `cargo metadata --format-version 1` | Stable JSON |
| `cargo tree` text | `cargo tree --depth 1 --format "{p}"` | Narrow, predictable |
| Parsing compiler prose | Exit codes, `--message-format=json` | Version- and locale-independent |

Additional rules:

- Do not write logic that depends on English error-message text.
- Do not write logic that depends on Chinese error-message text.
- Do not parse pretty-printed compiler diagnostics when an exit code or JSON message stream will do.
- If a command has no structured mode, ask the learner to read the output aloud, or read it yourself and reason
  about meaning rather than matching strings.

## Paths

Learner paths can look like any of these, and all must work:

```
C:\Users\<name>\Rust <folder>
D:\<folder>\rust-apprentice
C:\Users\Jane Doe\Documents\Rust & Tests
\\server\share\<folder>
```

Rules:

- Never concatenate a path into a shell command string. Use the agent's file tools, or pass the path as a single
  quoted argument.
- Never hardcode `/` or `\`. Build paths from what the learner gave you, and use the platform separator when you
  must construct one.
- Never assume `~` expands, that a Unix home directory exists, or that a drive letter exists.
- Assume the filesystem is case-insensitive. `Rust` and `rust` are the same directory on Windows, and a
  case-only rename needs care.
- Long paths are common and occasionally unsupported. If a path exceeds roughly 260 characters and a tool
  refuses, report it plainly rather than failing silently; `\\?\` extended-length paths exist but should be a
  last resort.
- Symlinks may require privileges. Never rely on them for anything the project needs.
- Spaces and non-ASCII characters in paths are normal, never an error condition.

## Shell environments

The mentor may run through `bash` (Git Bash) or PowerShell, or through the agent's own tools. Do not assume
which. Detect before relying on syntax.

| Environment | Watch for |
| :--- | :--- |
| PowerShell 7 | UTF-8 by default. Behaviour closest to POSIX expectations. |
| Windows PowerShell 5.1 | Still common. Different encoding defaults; `-Encoding utf8` writes a BOM in 5.1 and does not in 7. Prefer agent file tools over `Out-File`/`Set-Content`. |
| `cmd.exe` | No real scripting. Avoid. If unavoidable, keep it to a single simple command. |
| Git Bash | POSIX paths (`/c/Users/...`), `$HOME`, and `/tmp` work. Do not assume other tools exist. |
| WSL | A different filesystem and a different `HOME`. A Windows path is not a WSL path. Always ask. |

If a helper script is genuinely needed, it must be:

- Minimal, and cross-platform where practical.
- Written so it does not depend on the console code page.
- Explicit about file encoding when it writes files.
- Never required merely to install or run the skills.

## Code pages and legacy consoles

A Chinese Windows system may present CP936 (GBK), an OEM code page, or a UTF-8 terminal, and different processes
may disagree with each other. Consequences:

- Reading raw bytes from a child process and assuming UTF-8 is wrong. If a command's output must be interpreted
  and it is not available in a structured form, prefer having the learner paste it, or read the relevant file
  with the agent's file tools instead.
- Writing files through a shell risk inheriting the console encoding. Write through the agent's file tools.
- A correctly working command can *display* as mojibake if the console code page differs from the output
  encoding. Verify with the exit code and the resulting file, not the rendered text.
- If output must be decoded and it is genuinely ambiguous, consider GB18030/GBK only when there is evidence for
  it — for example a legacy Chinese text file with no BOM that fails to decode as UTF-8. Do not guess silently,
  and never rewrite the learner's file into UTF-8 unless they asked for a conversion or the exercise requires it.

## PowerShell specifics

- Do not assume PowerShell 7. Detect the version before using version-specific syntax.
- Avoid relying on display formatting. Select explicit properties and, where structured transfer is needed,
  convert to JSON: `... | ConvertTo-Json -Compress`.
- When generating files from PowerShell, encoding defaults differ between 5.1 and 7. Prefer the agent's file
  tools, which removes the question entirely.
- Do not modify the learner's PowerShell profile to make the skills work.

## Rust tooling

- Compiler diagnostics vary by Rust version, by localization, and between releases. Teach semantic
  interpretation, never string matching.
- To determine success automatically, use exit codes. `cargo check --message-format=json` gives a stable
  machine-readable diagnostic stream when structure is genuinely needed.
- `cargo` itself is consistent across platforms and is the safest thing to invoke. Prefer it over shell
  built-ins in any command you construct.

## External learner files

Learner input files are not project state and must be treated differently from it:

- Do not blindly reinterpret arbitrary bytes as UTF-8.
- If decoding fails, decide whether the encoding matters for the exercise before doing anything.
- Inspect available evidence: a BOM, other files in the same directory, the file's origin.
- Preserve the original bytes where possible.
- Do not silently rewrite the learner's file into UTF-8. Ask, or convert only when the exercise is explicitly
  about encoding.

This distinction is deliberate: **project state and Rust source are UTF-8 by definition; learner-supplied data
is whatever it is, and detecting it correctly is part of the engineering.**

## Encoding as a teaching subject

Encoding is not only a compatibility concern — it is genuine systems knowledge, and it should be taught as such
once the learner is ready:

- bytes versus text; the fact that a `String` in Rust is guaranteed UTF-8 and a `&[u8]` is not
- Unicode, code points, and UTF-8 versus UTF-16
- legacy code pages and why GBK exists
- Windows ANSI and OEM code pages, and the `A` versus `W` Win32 API convention
- Rust's `String`/`str` UTF-8 invariant, `OsString`/`OsStr` for platform strings, and `Path`/`PathBuf`
- lossy versus checked conversion, and where each is appropriate
- network protocol encodings and byte-order marks

A real Windows encoding problem — a legacy Chinese log file that will not decode, a filename that round-trips
incorrectly, a console that displays the wrong characters — makes an excellent project when the learner is ready
for it.

## Checklist before running anything on Windows

1. Can the agent's own file tools do this instead of the shell? If yes, use them.
2. Does the command have a structured output mode? If yes, use it.
3. Is every path quoted, and built from what the learner gave rather than assumed?
4. Does this permanently change any machine or user configuration? If yes, do not do it.
5. If output looks wrong, did I check the exit code and the filesystem before concluding failure?
6. Am I about to parse localized prose? If yes, stop and find another way.
