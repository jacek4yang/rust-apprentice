# Operating systems

The operating system is the layer your Rust program negotiates with for everything it does not own: memory, files,
sockets, time, and the CPU itself — and the practical goal here is writing software that behaves correctly on more
than one of them.

## What to teach

| Area | Topics |
| :--- | :--- |
| Execution | Processes, threads, the scheduler, context switches, what a thread actually owns |
| Memory | Virtual memory, pages and page tables, allocation from the OS vs from the allocator, memory mapping |
| Files and I/O | File descriptors and Windows HANDLEs, buffered vs unbuffered I/O, seek, append, locking |
| Filesystems | Paths, naming, permissions and ACLs, metadata, rename and delete semantics, case sensitivity |
| Process management | Spawning, environment, exit status, signals and their Windows analogues |
| IPC | Pipes, sockets, shared memory, and when each is the right answer |
| Synchronisation | Mutexes, condition variables, semaphores, why they are kernel objects at all |
| The boundary | Kernel vs user mode, syscalls, what a syscall costs, error codes as `io::Error` |
| Async I/O models | Readiness vs completion: epoll, kqueue, IOCP, io_uring, and what async runtimes build on |

## Sequence

1. **Process vs thread first.** Until the learner can say what a thread shares and what it does not, everything
   about synchronisation is memorised rather than understood. Connect to `../rust/ownership.md`: `Send` and `Sync`
   are statements about exactly this sharing.
2. **Context switches next**, and their cost. This is why thread pools exist and why blocking a runtime thread is
   a real bug rather than a style preference.
3. **Virtual memory and pages**, tied to the allocation story: what `malloc`/the Rust allocator does versus what
   the kernel does on a page fault. Follow with memory mapping for file-backed access.
4. **File descriptors and HANDLEs.** Teach the abstraction and its cost model before teaching files. The key idea
   is that everything else — files, pipes, sockets, devices — is the same interface with different behaviour.
5. **Files and paths**, with the platform differences made explicit from the start rather than discovered later.
6. **Process spawning and IPC** after the learner knows what a process is. Pipes and exit statuses are the first IPC
   most programs need.
7. **Synchronisation primitives** in their OS sense, after threads. Link to `concurrency` as the domain where the
   design questions live; here the question is what the primitives cost and what they guarantee.
8. **Permissions and the kernel/user boundary**, plus what a syscall costs, when the learner is ready to reason
   about why some operations are cheap and others are not.
9. **Async I/O models last.** epoll, kqueue, IOCP, and io_uring only make sense once the learner knows what a file
   descriptor is, what blocking means, and why a thread per connection stops scaling. This is the bridge to
   `async-rust`.

## Teaching notes

**The platform differences must be taught concretely, not mentioned.** The learner is on Windows and will meet
Unix documentation, Unix tutorials, and Unix-shaped crates. Every one of these is a real trap:

| Area | Unix | Windows |
| :--- | :--- | :--- |
| Handle type | `fd`: a small integer, freely duplicated and inherited | `HANDLE`: an opaque pointer-sized value, owned, closed with `CloseHandle` |
| Line endings | `\n` | `\r\n` in text files, and the two are not interchangeable in byte comparisons |
| Paths | `/`, no drive letters, `/` is the root | `\` or `/`, drive letters and UNC paths, reserved names, `MAX_PATH` history, verbatim `\\?\` paths |
| Case | Case-sensitive on Linux, usually insensitive on Windows and macOS | `README.md` and `readme.md` are the same file, which silently breaks builds and Git |
| Rename | Atomic overwrite on POSIX; rename onto a missing file is normal usage | Overwriting an existing file can fail; an open handle can block rename and delete entirely |
| Locking | `flock`/`fcntl`, advisory, per-process quirks | `LockFileEx`, mandatory-ish and handle-scoped, different failure modes |
| Process creation | `fork`, then `exec`; inheritance is the default | `CreateProcess`, no `fork`; nothing is inherited unless explicitly asked for |
| Strings | Byte-oriented APIs, non-UTF-8 paths are legal | Win32 `W` APIs are UTF-16 and Unicode-by-default; non-Unicode has an ABI cost and gets it wrong |
| Signals | `SIGINT`, `SIGTERM`, `SIGKILL`, etc. | No signals; console control handlers, `TerminateProcess`, and no graceful-kill equivalent |

Two consequences deserve emphasis. First, a program that opens a file and then renames over it can work perfectly
on Linux and fail on Windows because the handle is still open — file locking and rename semantics are not trivia,
they are the bug. Second, case-insensitivity means a program can reference a file by a name that does not exist in
the repository as written, and only find out on a case-sensitive CI runner.

**Assume Unix, break on Windows.** This is the specific trap. It looks like: hardcoded `"/"` separators, parsing
paths with `split('/')`, assuming `:` separates `PATH` entries (Windows uses `;`), assuming `/tmp` exists,
assuming `HOME` (Windows uses `USERPROFILE`), assuming shebang lines, assuming symlinks behave the same, assuming
signals, assuming permissions are `rwx` bits rather than ACLs. Teach the fixes as the lesson:

- `std::path::Path` and `PathBuf` for all path joining and decomposition; `join`, `components`, `parent`, `file_name`
  instead of string surgery. Never build a path with string concatenation.
- `OsStr` and `OsString` for anything the OS hands you that may not be valid UTF-8. `Path` is not a `String`, and
  converting to `String` too early is a data-loss bug on Unix and a panic risk on both.
- `std::env::consts::OS` and `#[cfg(windows)]` / `#[cfg(unix)]` for the genuinely platform-specific parts, kept in
  a small module behind one interface so the rest of the code stays platform-neutral.
- `cfg!(windows)` for runtime decisions and `cfg` attributes for compile-time selection, used deliberately rather
  than strewn through the codebase.
- `std::env::join_paths` / `split_paths` rather than hand-parsing the separator; `std::env::temp_dir()` rather than
  `/tmp`; `dirs` or an explicit config path rather than guessing `HOME`.

**"Crates are not magic."** The learner must be able to say what a crate is doing on their platform before they
trust it. When they use an async runtime, they should know it is calling epoll on Linux and IOCP on Windows, and
that this is why certain APIs have different behaviour across platforms and why some features are Unix-only. When
they use a file-watching crate, they should know whether it uses inotify, `ReadDirectoryChangesW`, or polling.
Reading the crate's platform notes is part of using it. State this explicitly and require it once so the habit
forms.

**The readiness/completion distinction.** This is the conceptual core of async I/O, and it is worth its own
explanation. epoll and kqueue tell you when an operation *would not block* (readiness); IOCP tells you when an
operation *has completed* (completion). io_uring takes the completion model further with shared rings and fewer
syscalls. This difference is why cross-platform async I/O needs a runtime abstraction and why the same program can
have subtly different fairness and latency characteristics on the two platforms. A learner who knows this reads
runtime documentation correctly; one who does not treats the runtime as a black box.

**Misleading intuitions to expect:**

- *"Threads are cheaper than processes, so always use threads."* Cheaper, not free. Context switches cost, and a
  thread blocked on I/O still occupies a stack.
- *"`fsync` is a detail."* Durability questions are not details in anything that stores data. Teach the difference
  between writing and persisting.
- *"Buffered and unbuffered I/O are equivalent."* Unbuffered small writes mean a syscall per write; the
  performance difference is orders of magnitude.
- *"Deleting an open file is fine."* POSIX semantics say the file survives until the last handle closes; Windows
  refuses. The same code is correct on one platform and broken on the other.
- *"Permissions are just a mode."* On Windows they are ACLs, and a Unix-style mode check tells you almost nothing.
- *"`Command` and shell behaviour are the same everywhere."* There is no shell involved unless you ask for one, and
  the quoting rules differ.
- *"A path is a string."* It is not, and treating it as one is where cross-platform bugs live.

**What to do about all of it.** Make the learner *investigate* rather than assume. The standard move is: "You have
written this assuming Unix. Before you change it, find out what Windows does. What does the documentation say, and
what does a five-line program print?" Then have them run it. A learner who has personally watched a rename fail
because a handle was open will never make that mistake again. A learner who was told about it will.

## Evidence of mastery

- Explains the difference between a process and a thread in terms of what is shared, and connects it to `Send` and
  `Sync`.
- Writes a program that spawns a child process with arguments and environment, waits for it, and reports its exit
  status, on Windows and on Linux.
- Opens a file, reads it in chunks, and explains what each syscall in the loop is doing and what it costs.
- Moves a file atomically, handling the Windows case where the destination exists and may be open.
- Predicts where a hardcoded `/`, `:`, or `\n` will break, without being told, and rewrites it with `Path` and
  `OsStr`.
- Explains why `MAX_PATH` and long-path prefixes exist on Windows, and when they matter.
- Distinguishes readiness-based from completion-based I/O and names which model the current platform uses.
- Describes what their async runtime does at the syscall level on Windows and on Linux.
- Diagnoses a program that works on their machine but not on CI, and identifies case-sensitivity or path handling
  as the cause.
- Reads a crate's platform notes before depending on it, and can say which platforms it supports and what differs.
- Explains what a handle is, why leaking one matters, and how Rust's `Drop` usually prevents it.
- Explains when a syscall happens in a given code path, rather than treating I/O as free.

## Projects that teach this

1. **Cross-platform file tool.** A search-and-report tool that walks a directory tree, reports file sizes and
   modification times, and rewrites a file atomically. Must build and pass the same tests on Windows and Linux;
   the atomic-rewrite step is where the platform differences become real.
2. **Process supervisor.** Spawn child processes with captured stdout/stderr, stream their output, enforce timeouts,
   and restart on exit. Teaches process creation, pipes, exit status, and what "kill" means differently per
   platform.
3. **Echo server, three ways.** A blocking thread-per-connection server, then a poll-loop server over the platform
   I/O primitive, then an async version on a runtime. The comparison is the lesson on readiness vs completion.
4. **File-watching indexer.** Watch a directory for changes and maintain an index of its contents, handling
   renames, deletions, and files still being written. Teaches filesystem event semantics and the open-handle trap.
5. **`ls`-alike with a platform report.** Print permissions, ownership, size, and type for a directory, and print
   explicitly which semantics it is using and why. Cheap to build, and it forces the learner to confront ACLs vs
   modes, symlinks, and case sensitivity.

## Related

- `computer-architecture.md` — the hardware side of pages, translation, and memory ordering.
- `debugging.md` — for the failures that only reproduce on one platform.
- `performance.md` — for measuring the cost of syscalls, buffering, and context switches.
- `../rust/ownership.md` — handles, resources, and `Drop` as the cleanup mechanism.
- `../rust/rust-language.md` — conditionally compiled code and the types that carry platform semantics.
- `networking.md` — sockets are file descriptors, and most of the I/O model discussion continues there.
- `index.md` — routing and prerequisites for this domain.
