# Concurrency in Rust

Rust's concurrency story is distinctive because the type system carries part of the burden: data races are
rejected at compile time. This reference covers the Rust mechanics and the design decisions, and assumes the
systems-level concepts in `../curriculum/concurrency.md` are being taught alongside.

Teach `Send` and `Sync` from a failing example, never from a definition.

## What to teach

1. **`thread::spawn` and `move` closures.** Why the closure must own what it touches, and what the compiler is
   preventing.
2. **`JoinHandle`** and collecting results. Scoped threads for borrowing across threads without `Arc`.
3. **Channels.** `mpsc` for the common case, `crossbeam` when the standard channel is not enough. Message
   passing as a way to avoid shared mutable state entirely.
4. **Shared state.** `Arc<Mutex<T>>` and `Arc<RwLock<T>>`, and what each half contributes.
5. **`Send` and `Sync`.** What may cross a thread boundary and what may be shared. Derived automatically, and
   what that means for the learner's own types.
6. **Atomics.** `AtomicUsize` and friends, and `Ordering`. Start with `SeqCst` and explain that a weaker ordering
   is a performance decision requiring care.
7. **Thread pools.** `rayon` for data parallelism, and when a pool is the right shape.
8. **CPU-bound versus I/O-bound.** Which decides between threads and async, and why the answer is not
   ideological.
9. **Contention and lock granularity.** Why one hot mutex is a scalability wall, and what sharding looks like.

## Sequence

Prerequisites: ownership, `Arc`, closures, and a project with a genuine reason to run work in parallel. Threads
before async, always. `Send`/`Sync` after the learner has written one working threaded program.

Order: `spawn` with a `move` closure → joining and collecting → channels → `Arc<Mutex<T>>` → `Send`/`Sync` from a
failure → atomics when a counter is genuinely needed → `rayon` → contention discussion.

Do not introduce atomics before the learner has felt the cost of locking, and do not introduce async before this
reference is comfortable.

## Teaching notes

**Silencing a `Send` error with `Arc`.** A learner hits "cannot be sent between threads safely", adds `Arc`, and
the error moves rather than disappears, because the real problem was a non-`Send` type held across a boundary —
often an `Rc` or a `RefCell`. Ask what type is failing to cross, not what to wrap it in.

**`Send` and `Sync` as design information.** Learners read these bounds as compiler complaints. Reframe: the
bound is telling you what your type is safe to do. A type containing `Rc` is genuinely not safe to send, and the
compiler found that out without running anything. Teach the distinction: `Send` is about moving ownership to
another thread, `Sync` is about sharing a reference across threads.

**Lock ordering and deadlock.** Deadlocks are usually easy to explain and hard to notice. Two mutexes taken in
different orders in different functions is the canonical case. Ask the learner to write down the order their code
takes locks; if the answer is not consistent, that is the bug.

**Holding a lock across a long operation.** A `MutexGuard` held across I/O or a computation serialises everything
that wanted the lock. Ask how long the guard needs to live and whether the work could be done outside it. This is
also the origin of the classic async mistake covered in `async.md`.

**The cost of a hot mutex.** A counter shared across eight threads is usually slower than eight counters summed
at the end. Measure it rather than asserting it — this is a good first benchmarking exercise, and it teaches the
difference between correctness and scalability.

**`Rc` in a threaded context.** A learner who learned `Rc` first reaches for it and gets an unhelpful-looking
error. Explain that `Rc`'s reference count is not atomic, which is precisely why the compiler refuses.

**Channels instead of locks.** Many learners reach for a shared `Mutex<Vec<T>>` when a channel would express the
design more clearly. Ask who owns the data and whether the threads actually need to share it or just to hand it
on.

**Choosing between threads and async.** Give the rule of thumb rather than a doctrine: threads and `rayon` for
CPU-bound work, async for many concurrent I/O operations, threads for a small number of blocking operations. Say
that a program can reasonably use both.

**Do not teach unsafe concurrency tricks early.** Lock-free structures and manual `unsafe impl Send` are real
topics and are not where anyone should start.

## Evidence of mastery

- Writes a threaded program that compiles without needing to be told about `move`.
- Explains a `Send` error in terms of the type that cannot cross, not the fix that silences it.
- Chooses channels over shared state when the design is a pipeline, and says why.
- Identifies a potential deadlock in code by looking at lock ordering.
- Measures the cost of contention and adjusts the design rather than guessing.
- Explains what `Arc<Mutex<T>>` provides that neither half provides alone.
- Decides between threads, `rayon`, and async for a stated workload, with a reason.

## Related

`ownership.md`, `async.md`, `traits.md`

Conceptual background and the wider systems view are in `../curriculum/concurrency.md`; the hardware reasons for
contention cost are in `../curriculum/computer-architecture.md`. Scheduling and the OS-level thread model are in
`../curriculum/operating-systems.md`.
