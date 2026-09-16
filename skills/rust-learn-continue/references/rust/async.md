# Async Rust

Async Rust is the topic where learners most often write code that compiles and still fails. The mechanics are
learnable; the operational consequences are what take longer, and they are the point of this reference.

Prerequisites are not optional here. Teach async only after closures, `move`, threads, `Arc`, `Send`/`Sync` and
`Mutex` are comfortable.

## What to teach

1. **Futures are lazy.** An `async fn` returns a future that does nothing until it is polled. Creating it is not
   running it.
2. **The polling model.** A future is a state machine that is advanced by an executor, yielding at each await
   point that is not ready. Enough of the model to explain the behaviour, not the full `Future` trait
   implementation.
3. **`async`/`await`**, and what the desugaring does to control flow.
4. **Executors and runtimes.** Why a runtime exists, what it provides (an executor and a reactor), and why
   `main` cannot simply be `async`.
5. **Tokio basics.** `#[tokio::main]`, `spawn`, `join!`, `select!`, timers, and `tokio::fs`/`tokio::net` versus
   their blocking counterparts.
6. **Tasks.** `spawn` returns a handle; a task is a unit of concurrency that the runtime may move between
   threads.
7. **Cancellation.** Dropping a future cancels it at the next await point. Cancellation safety and why it
   matters for `select!`.
8. **Timeouts and retries.** Composing a timeout around an operation, and retry with backoff.
9. **Bounded concurrency and backpressure.** `Semaphore`, bounded channels, and why unbounded queues are a
   memory leak with extra steps.
10. **Streams.** Async iteration, and `StreamExt`.
11. **Graceful shutdown.** Propagating a shutdown signal, and letting in-flight work finish.
12. **Holding resources across awaits.** The rule that shapes most real async bugs.
13. **`Pin`**, conceptually, and only when genuinely required.

## Sequence

Prerequisites, explicitly: ownership, closures and `move`, `Send`/`Sync`, `Arc`, and at least one working
threaded program. If these are not in place, repair them first and record why — async composes all of them, so
gaps surface as confusing errors.

Order: futures are lazy → the polling model → `async`/`await` → runtime and `main` → `spawn` → timeouts → retries
→ `select!` and cancellation → bounded concurrency → streams → graceful shutdown → `Pin` if needed.

Do not introduce `Pin` to explain something else. Introduce it when a learner writes a type that needs it.

## Teaching notes

**The prerequisites are the lesson.** A learner who has not internalised `Send`/`Sync` will hit async errors that
look unrelated. Check the prerequisites before starting and say plainly that async is where those concepts get
combined. This is the most valuable thing to get right about this topic.

**Futures do nothing until awaited.** Learners write `let f = fetch(url);` and expect the request to start.
Demonstrate by showing that nothing happens until `f.await`, and that a dropped future cancels the work.

**Blocking inside async code.** Calling `std::thread::sleep`, blocking I/O, or a CPU-heavy computation inside a
task stalls the executor thread and everything queued behind it. This is the most common production failure in
async Rust and it does not show up in tests with one request. Show it with two concurrent tasks where one blocks.
Then show the fixes: `spawn_blocking` for blocking work, or yielding for long computations.

**Holding a lock across an await.** `std::sync::MutexGuard` is not `Send`, so holding one across an await produces
a compiler error — which is a gift, because the equivalent bug in other languages is a deadlock. Explain what the
error is preventing, then explain `tokio::sync::Mutex` and when it is actually needed (rarely; usually the fix is
to not hold the lock across the await).

**`std::sync::Mutex` versus `tokio::sync::Mutex`.** Give the decision rule: use the standard one unless the lock
genuinely must be held across an await point. The async mutex is slower and is often chosen by learners who think
"async code needs async primitives", which is not the rule.

**Compiles and still fails.** State this explicitly. Async bugs are usually operational: a task that is never
spawned, a `select!` branch that cancels work that should have finished, an unbounded queue growing without
limit, a shutdown that drops in-flight requests, a timeout that leaks a task. None appear at compile time.

**`select!` and cancellation safety.** A branch losing the race has its future dropped, which cancels it partway.
If that future had partially consumed a stream or written half a message, dropping it loses work. This is subtle
and worth a concrete demonstration.

**Timeouts around the right thing.** A timeout wrapped around a retry loop is different from a timeout per
attempt. Ask what the deadline is supposed to mean.

**Unbounded channels as a memory leak.** A fast producer and a slow consumer with an unbounded channel consumes
memory until the process dies. Push backpressure explicitly and show the bounded version.

**Do not teach `Pin` early.** It is a real and interesting mechanism, and it is not needed to write correct
application code. Introduce it when a learner writes a future by hand or uses a library that exposes it.

## Evidence of mastery

- Explains why an `async fn` call alone does no work.
- Predicts that blocking inside a task will stall other tasks, and says why.
- Recognises a lock held across an await, and knows the two legitimate fixes.
- Chooses `std::sync::Mutex` over `tokio::sync::Mutex` for a lock not held across an await.
- Adds bounded concurrency to a fan-out, rather than spawning unbounded tasks.
- Explains what happens to an in-flight request during shutdown, and handles it.
- Reads an async function in an unfamiliar crate and identifies its cancellation behaviour.
- Diagnoses an operational async failure from symptoms rather than from the compiler.

## Related

`concurrency.md`, `ownership.md`, `traits.md`, `errors.md`

Systems background for the polling models underneath is in `../curriculum/operating-systems.md`; async networking
builds on `../curriculum/networking.md`; measuring whether the concurrency actually helped is
`../curriculum/performance.md`.
