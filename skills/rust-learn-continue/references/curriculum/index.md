# Curriculum index

Routing metadata only. This file is small on purpose: it tells you *which* reference to load and *when*, and it
never contains the teaching content itself. Load it when you need to choose or sequence a learning objective; do
not load the references it points at until the objective requires them.

## How to use this

1. Identify the current objective from `state/progress.md`, the active project, and the review queue.
2. Find that objective below. Check `requires` — if a prerequisite is not yet at `practiced` or above, the honest
   objective is the prerequisite, not this one.
3. Load exactly one topic reference, and only the section the objective needs.
4. Teach one small step, then stop.

Depth lives in the reference files. Breadth lives here.

## Domains

Nineteen domains. `state/progress.md` carries one line per domain; this table says what each covers and what it
depends on.

| Domain | Covers | Typical entry point |
| :--- | :--- | :--- |
| `rust-language` | Syntax, types, structs, enums, pattern matching, `Option`/`Result`, generics, traits, closures, iterators, modules, visibility, macros | [rust/rust-language.md](../rust/rust-language.md) |
| `ownership-memory` | Ownership, moves, borrows, slices, lifetimes, `Box`/`Rc`/`Arc`/`Cell`/`RefCell`/`Mutex`, layout, `Drop`, zero-copy design | [rust/ownership.md](../rust/ownership.md) |
| `data-structures-algorithms` | `Vec`, maps, trees, heaps, graphs, tries, ring buffers, LRU, complexity, amortised and cache-aware reasoning | [curriculum/data-structures-algorithms.md](data-structures-algorithms.md) |
| `computer-architecture` | Cache hierarchy, locality, branch prediction, SIMD concepts, virtual memory, atomics and memory ordering, false sharing, ABI | [curriculum/computer-architecture.md](computer-architecture.md) |
| `operating-systems` | Processes, threads, scheduling, virtual memory, file descriptors and handles, filesystems, pipes, signals, IPC, permissions, async I/O models, Windows vs Unix APIs | [curriculum/operating-systems.md](operating-systems.md) |
| `networking` | Layering, IP, routing, TCP, UDP, sockets, DNS, HTTP/1.1-3, TLS handshakes, proxies, congestion, packet capture, latency analysis | [curriculum/networking.md](networking.md) |
| `cryptography` | Threat models, randomness, hashes, MACs, KDFs, AEAD and nonce rules, key management, public key, signatures, TLS fundamentals, constant time, zeroisation | [curriculum/cryptography.md](cryptography.md) |
| `concurrency` | Threads, shared state, message passing, `Mutex`/`RwLock`, atomics, races, deadlock, contention, thread pools, `Send`/`Sync` as design | [curriculum/concurrency.md](concurrency.md) |
| `async-rust` | Futures, polling, executors, tasks, `Pin` concepts, Tokio, cancellation, timeouts, backpressure, graceful shutdown | [curriculum/async-rust.md](async-rust.md) |
| `software-architecture` | Cohesion, coupling, module and crate boundaries, dependency direction, layering, ports and adapters, API stability, event and pipeline designs | [curriculum/software-architecture.md](software-architecture.md) |
| `design-patterns` | Builder, newtype, typestate, strategy, adapter, command, state, observer, visitor, actor, middleware, and the Rust-native alternatives | [curriculum/design-patterns.md](design-patterns.md) |
| `testing` | Unit, integration, TDD, table-driven, property testing, fuzzing, regression, golden tests, test doubles, deterministic tests | [curriculum/testing.md](testing.md) |
| `debugging` | Compiler diagnostics, tracing, assertions, minimal reproduction, bisection, debuggers, backtraces, race and network diagnosis | [curriculum/debugging.md](debugging.md) |
| `performance` | Measurement, benchmarking, profiling, allocation, latency distributions, tail latency, batching, copy avoidance, contention cost | [curriculum/performance.md](performance.md) |
| `databases-storage` | Relational model, SQL, transactions, indexes, isolation, pools, migrations, key-value stores, WAL, caching, consistency | [curriculum/databases-storage.md](databases-storage.md) |
| `distributed-systems` | Partial failure, retries, idempotency, replication, consensus concepts, delivery semantics, clocks, observability | [curriculum/distributed-systems.md](distributed-systems.md) |
| `security` | Input validation, parsing safely, unsafe boundaries, authentication and authorisation, secrets, dependency and supply-chain risk, secure defaults | [curriculum/security.md](security.md) |
| `codebase-reading` | A repeatable method for reading unfamiliar repositories, tracing execution paths, building module and ownership maps | [curriculum/codebase-reading.md](codebase-reading.md) |
| `open-source-engineering` | Contribution guidelines, issue selection, reproducing bugs, minimal fixes, PR scope, review feedback, releases, semver | [curriculum/open-source-engineering.md](open-source-engineering.md) |

Cross-cutting, used throughout rather than taught in isolation:

| Area | Reference |
| :--- | :--- |
| Git and GitHub | [curriculum/git-github.md](git-github.md) |
| Engineering English | [curriculum/engineering-english.md](engineering-english.md) |
| Project-based learning | [curriculum/project-learning.md](project-learning.md) |

## Prerequisites

The graph, not a sequence. `requires` lists what must be at `practiced` or above before the objective is honest.

| Objective | Requires |
| :--- | :--- |
| Ownership and borrows | `rust-language` basics |
| Error handling with custom types | `rust-language`, borrows |
| Lifetimes written explicitly | borrows, generics |
| Traits and generics as design | `rust-language`, borrows |
| Iterators and closures | `rust-language`, traits |
| Data structures in practice | ownership, `rust-language`, generics |
| Algorithmic complexity reasoning | data structures |
| Concurrency with threads | ownership, `Arc`/`Mutex`, traits |
| Async Rust | concurrency, closures, `Send`/`Sync`, `Result` |
| Async networking | async Rust, networking |
| HTTP client | networking, `Result`, ownership |
| Production HTTP client | HTTP client, async Rust, testing, performance |
| TCP server | networking, concurrency or async |
| DNS client | networking, binary parsing |
| Binary format parser | ownership, slices, error handling |
| Cryptographic API use | byte handling, `Result`, security basics |
| Protocol design | networking, parsing, error handling |
| Operating-system interaction | `Path`/`OsStr`, ownership, error handling |
| Codebase reading method | `rust-language`, ownership, some project experience |
| Open-source contribution | codebase reading, Git and GitHub, testing |
| Software architecture | traits, modules, testing, some project experience |
| Design patterns | traits, generics, ownership |
| Performance work | measurement mindset, data structures |
| Databases | `Result`, error handling, ownership |
| Distributed systems | networking, concurrency, async, databases |

## Loading rules

- Load at most **one domain reference** per session, plus one **topic reference** if the objective needs it.
- Load a section, not a file, where the file covers more than the objective.
- Never load a reference because it exists: ask whether it changes the learner's next action.
- The current project decides relevance. A learner building a TCP server needs `networking` and `concurrency`;
  they do not need `cryptography` until a threat model makes it relevant.
- Cold material — old sessions, finished projects, `notes/`, historical evidence — is loaded only when the hot
  state explicitly says deeper evidence is needed.

## When a prerequisite turns out to be missing

Advanced work sometimes reveals a foundational gap. Do not push through and do not abandon the project:

1. Pause the advanced objective.
2. Design a small focused exercise for the prerequisite.
3. Record the dependency in `state/progress.md`: what was paused, why, and what resumes it.
4. Repair, then return.

The recorded link is what lets the next session pick the project back up instead of drifting.

## Coverage check

Roughly monthly, compare the domains in `state/progress.md` against this table. Anything still `unseen` after a
long period, and not blocked by a prerequisite, is a candidate for a broadening session. Coverage is a check, not
a target: a learner with three excellent projects and no `cryptography` is not behind.
