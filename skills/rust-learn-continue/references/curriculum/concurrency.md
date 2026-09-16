# Concurrency

Concurrency teaches the learner to run work in parallel and to share state between threads safely, so
that they can reason about correctness and cost under real contention instead of hoping the schedule is
kind.

## What to teach

- Why concurrency exists: latency hiding versus throughput, and the fact that they call for different
  designs.
- Processes versus threads: address spaces, sharing, cost of creation, and what a context switch
  actually costs.
- The OS thread as the base unit in Rust: `std::thread::spawn`, `JoinHandle`, `join`, what happens when
  a thread panics, and scoped threads.
- Data races as a formal property: two unsynchronised accesses to the same location, at least one a
  write. Not the same thing as a logical race.
- Shared state: why `&mut` across threads cannot be allowed, and what the type system does about it.
- Mutexes: mutual exclusion, the lock guard as an RAII handle, poisoning, and why the mutex owns the data
  in Rust.
- `RwLock`: reader and writer semantics, when it helps, when it hurts, and why it is not a free upgrade
  over `Mutex`.
- `Arc`: shared ownership across threads, atomic reference counting, why `Rc` cannot cross a boundary,
  and what the clone actually costs.
- Atomics: `AtomicBool`, `AtomicUsize`, `compare_exchange`, `fetch_add`, and the fact that atomics give
  indivisibility, not mutual exclusion over a larger invariant.
- Memory ordering: `Relaxed`, `Acquire`, `Release`, `AcqRel`, `SeqCst`, the happens-before relationship,
  and the practical rule of "start relaxed, reason about it, and prefer the stronger ordering until you
  can justify otherwise".
- Message passing: channels, `mpsc`, `Send`ing values rather than sharing them, bounded versus unbounded,
  and why "share memory by communicating" is often the simpler design.
- `Send` and `Sync`: what may cross a thread boundary, what may be shared by reference, and which types
  opt out and why.
- Deadlock: the four conditions, lock ordering as the standard prevention, and how deadlock actually
  presents in a running program.
- Livelock: mutual retry, backoff, and why the process looks busy and makes no progress.
- Starvation: fairness, writer starvation in `RwLock`, and unbounded queues that never drain.
- Contention: how a hot lock serialises a program, and what the cost curve looks like as threads are
  added.
- Lock granularity: coarse versus fine, the sharding pattern, and the correctness cost of splitting a
  lock.
- Work queues: a shared queue plus workers as the canonical pattern, and its termination problem.
- Thread pools: why spawning per task does not scale, sizing, and what pool saturation looks like.
- Parallel iteration: `rayon` as the ergonomic entry point, `par_iter`, and the fact that the underlying
  model is still work stealing over a pool.
- CPU-bound versus I/O-bound work: the size of the pool, the fact that blocking I/O wastes a thread, and
  why the right answer differs.

## Sequence

1. **One thread, then two.** Spawn, join, and observe that output ordering is not guaranteed. Run the
   same program several times until the learner stops expecting a fixed order.
2. **The failure of naive sharing.** Two threads incrementing a shared counter without synchronisation.
   Show the wrong result, then explain data races as a property, not a bug class.
3. **`Arc<Mutex<T>>`.** Now the fix, discovered rather than announced. The learner meets `Mutex` because
   they needed exclusion and `Arc` because they needed two owners.
4. **`Send` and `Sync`, conceptually.** Taught here, once the learner has felt the problem: a value may
   move to another thread; a reference may be shared with another thread. `Rc` fails the first, `RefCell`
   fails the second, and the reasons are the same reasons the compiler gives.
5. **Channels.** Message passing as an alternative to shared state. Ask the learner to reimplement the
   counter with a channel and compare the two designs in writing.
6. **Atomics and ordering.** Only after there is a reason: a counter, a flag, a stop signal. Introduce
   `Relaxed` first, then `Acquire`/`Release` when the learner tries to publish data through a flag.
7. **Deadlock, livelock, starvation.** Best taught as a debugging exercise: give a program that hangs
   and ask for a diagnosis.
8. **Pools, queues, parallel iteration.** The scaling step. The learner now designs rather than patches.
9. **Performance of concurrency.** Contention, granularity, false sharing in outline. Hands off to
   `performance`.

Unlocks: `async-rust` (which assumes threads, `Arc`, `Send`/`Sync` and `Mutex` are already understood),
TCP servers, parallel data processing, and the concurrency half of `distributed-systems`.

## Teaching notes

**Teach `Send` and `Sync` as design facts, not as compiler errors to silence.** The failure mode is a
learner who learns the incantation `Arc<Mutex<T>>` and applies it wherever the borrow checker complains.
The fix is to always ask the question underneath:

| Question | The answer is about |
| :--- | :--- |
| May this value be moved to another thread? | `Send` — does it own anything with thread affinity or non-atomic shared state? |
| May a reference to this value be used from another thread? | `Sync` — is concurrent access through `&T` safe? |

Then the types become explicable rather than arbitrary: `Rc<T>` is neither, because the reference count
is a non-atomic integer; `RefCell<T>` is `Send` but not `Sync`, because its borrow flag is not
thread-safe; `Mutex<T>` is both, because it makes access to its contents exclusive; `Cell`-style types
and `*mut T` are outside the guarantees entirely. A learner who can derive these will stop guessing.

**The practical traps, and what to say when you see them:**

- **Holding a lock across a long operation.** The lock covers a file write, a network call, or a sleep.
  Ask what the other threads are doing meanwhile. The answer is "waiting", and the fix is almost always
  to compute under the lock and release before doing the slow thing.
- **Lock ordering.** Two locks acquired in different orders in different code paths is the classic
  deadlock. The prevention is a documented global ordering, and the habit of not calling out to unknown
  code while holding a lock. Enforce it by review, because nothing in the type system will.
- **Cloned `Arc`s mistaken for cloned data.** The learner writes `let local = Arc::clone(&shared);`,
  mutates through it, and expects the original to be unaffected, or the reverse. Draw the picture: two
  pointers, one value. Also correct the related assumption that `Arc::clone` is free — it is an atomic
  increment, which matters in a hot loop.
- **Contention on a hot mutex.** The program gets *slower* with more threads. Have them measure it:
  one lock, N threads, N increasing, and a chart that goes down. This is the single most valuable
  concurrency experiment and it is cheap to run. The follow-up is sharding or a different data
  structure, and the follow-up question is whether the shared state was needed at all.
- **`Mutex` poisoning treated as an unreachable case.** It is reachable whenever a thread panics while
  holding the lock. Ask what the learner's system should do; `unwrap()` is an answer only if they can
  defend it.
- **Assuming `RwLock` is faster.** Under a write-heavy or short-critical-section workload it is often
  slower. Measure before choosing.
- **Unbounded channels as a design.** They convert a slow consumer into an out-of-memory error. Bounded
  plus backpressure is the default; hand that to `async-rust` and `performance`.

**Teach debugging concurrency as its own skill.** A hang and a wrong answer are different investigations:
a hang needs lock ownership and thread states; a wrong answer needs the invariant that was violated and
which interleaving breaks it. Give the learner a deliberately broken program and ask for the diagnosis
before the fix. Note that some races only appear under load or on many cores, so a passing local run is
weak evidence — tie this back to `testing` and `debugging`.

**Do not start with atomics.** Learners who start with `compare_exchange` write lock-free code for
problems a `Mutex` would solve correctly. Atomics are for counters, flags, and building blocks; a
`Mutex` is for invariants.

## Evidence of mastery

- Implements a worker pool with a shared queue and clean termination, without help.
- Predicts, given a struct, whether it is `Send`, `Sync`, both, or neither, and justifies it from its
  fields rather than from memory.
- Diagnoses a deadlock in a provided program and names the lock ordering that would prevent it.
- Demonstrates contention empirically by measuring throughput as thread count rises, and explains the
  shape of the result.
- Rewrites a shared-mutable-state design as message passing, and states the trade-off in writing.
- Chooses between `Mutex` and `RwLock` for a described workload, and says what would change the choice.
- Uses atomics for a counter or flag with an ordering they can justify, and refuses to use them for a
  multi-field invariant.
- Releases a lock before a slow operation, reflexively, and can say why.
- Explains the difference between a data race and a logical race with an example of each.
- Distinguishes CPU-bound from I/O-bound work and selects an appropriate concurrency model for each.

## Projects that teach this

- **Parallel word counter.** Count occurrences across many files with a thread pool, then with `rayon`,
  and compare both against a single-threaded baseline with real measurements.
- **Multi-threaded port scanner or downloader.** Bounded concurrency, a work queue, and clean shutdown on
  the first error — a natural bridge to `networking`.
- **Bounded producer-consumer pipeline.** Bounded channel, backpressure, explicit termination, and a test
  for the case where the consumer is slower than the producer.
- **Bounded lock-free counter and ring buffer.** Atomics with written ordering justifications, plus a
  stress test. Suitable only after the `Mutex` material is solid.
- **Deliberately broken concurrency lab.** A program with a deadlock, a lost update, and a livelock in
  separate modes; the learner diagnoses each and writes the fix and the reasoning.

## Related

`async-rust`, `operating-systems`, `computer-architecture`, `performance`, `networking`,
`distributed-systems`, `debugging`, `testing`.

See [index.md](index.md) for routing, [testing.md](testing.md) for stress and determinism techniques,
[performance.md](performance.md) for contention measurement, [debugging.md](debugging.md) for hang and
race diagnosis, and [../rust/ownership.md](../rust/ownership.md) for the ownership model these designs
build on.
