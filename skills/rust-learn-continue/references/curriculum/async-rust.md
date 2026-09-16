# Async Rust

Async Rust teaches the learner to write concurrent programs that wait on many things at once without
spending a thread per wait, and to reason about the operational failure modes that compile cleanly and
still break in production.

## What to teach

- The problem async solves: many concurrent waits, mostly I/O, where threads are the wrong granularity.
- Futures as values: a computation that may not be finished yet, described as a state machine that can be
  polled.
- The `Future` polling model: `poll`, `Poll::Ready`, `Poll::Pending`, and the contract that a future must
  arrange its own wakeup before returning `Pending`.
- `async`/`await`: `async fn` desugaring to a future, `await` as a suspension point, and the fact that
  nothing runs until it is awaited.
- Executors and runtimes: what an executor does (poll, park, wake), why `Future` has no built-in
  scheduler, and why a runtime is a separate concern from the language.
- Tasks and wakeups: a task as the unit of scheduling, the `Waker`, and why a lost wakeup hangs silently.
- `Pin` concepts: why self-referential futures cannot move after being polled, and what `Pin` is a
  promise about. Taught only where it is genuinely required — see the notes.
- Tokio: `#[tokio::main]`, the multi-thread and current-thread runtimes, `tokio::spawn`, `JoinHandle`,
  and the blocking pool.
- Async I/O: `AsyncRead`/`AsyncWrite`, why readiness-based I/O differs from blocking I/O, and how the
  reactor fits with the executor.
- Cancellation: dropping a future cancels it, cancellation points are the awaits, and cancellation
  safety as a per-operation property.
- Timeouts and retries: `tokio::time::timeout`, `sleep`, backoff, jitter, and why retries need idempotency
  to be safe at all.
- `select!`: racing futures, the fairness caveat, and the cancelled branches.
- Task supervision: who owns a task, what happens when it panics, what detaches, and why "fire and
  forget" is a leak unless deliberate.
- Bounded concurrency: `Semaphore`, `buffer_unordered`, chunking, and why unbounded spawning is the
  default mistake.
- Backpressure: bounded channels, the cost of dropping versus blocking, and why an unbounded queue turns
  a slow consumer into an outage.
- Channels: `mpsc`, `oneshot`, `broadcast`, `watch`, and the different coordination problems each fits.
- Streams: `Stream` as the async iterator, combinators, adapters, and when a stream is the right shape.
- Graceful shutdown: a shutdown signal, draining in-flight work, refusing new work, and a deadline.
- Resource lifetime across awaits: a borrowed value held across an `await`, what that does to a future's
  lifetime, and why a lock guard must not survive an await.
- Async synchronisation: `tokio::sync::Mutex` versus `std::sync::Mutex`, and choosing between them.

## Sequence

The prerequisites are not optional. Before any async code, the learner must be comfortable with:

1. **Closures, including `move` closures and what they capture.** Every async block captures like a
   closure, and a learner who cannot predict captures cannot predict what a future owns.
2. **Threads and `Arc`.** Async is an alternative to threads, and the comparison is the point.
3. **`Send` and `Sync`, conceptually.** Because whether a future is `Send` decides whether it can be
   spawned on a multi-thread runtime.
4. **`Mutex` and lock discipline.** Because async adds a new way to hold one too long.
5. **`Result` and error handling.** Because `?` inside async has a lifetime dimension.

Then:

6. **Futures as values, with no runtime.** Call `poll` on something trivial and watch it return
   `Pending`. The learner must see the machinery before Tokio hides it.
7. **`async`/`await` and `#[tokio::main]`.** The first working program. Lazy futures are the lesson
   here — build one, never await it, and observe that nothing happens.
8. **`tokio::spawn` and tasks.** Ownership, `'static`, `Send`, and the first `JoinHandle`.
9. **Timeouts, cancellation and `select!`.** Introduced together, because they share the mechanism.
10. **Bounded concurrency and backpressure.** After the learner has written one unbounded loop and been
    asked what happens at scale.
11. **Streams and channels.** Once the learner has several producer-consumer shapes to choose between.
12. **Graceful shutdown.** The synthesis, and the point at which the design questions appear.
13. **`Pin`.** Only when a hand-written future, or a concrete compiler error, makes it necessary.

Unlocks: async networking, production HTTP clients, servers at scale, and the async half of
`distributed-systems`.

## Teaching notes

**Blocking inside async code is the single most common error, and it is invisible at compile time.** A
`std::thread::sleep`, a blocking file read, a synchronous HTTP client, or a CPU-heavy loop inside an
`async fn` blocks the executor thread, which is running many other tasks. Teach the symptom first: some
unrelated task stops responding, and the cause is nowhere near it. Then the fixes: `tokio::time::sleep`
for delays, `spawn_blocking` for genuinely blocking calls, and a separate pool or `rayon` for CPU-bound
work. Ask the learner to predict the symptom before you name the cause.

**Holding a lock across an `await`.** The `std::sync::MutexGuard` is not `Send`, and the compiler will
often catch it — which is why learners learn the wrong lesson from the error. The real lesson is what
the guard *means*: holding it across an await means the lock is held for an unbounded wall-clock
duration, with no thread actually needing it. `tokio::sync::Mutex` exists for exactly this case, but it
is not the right default: prefer to compute inside the lock, release, then await.

The rule to install: **the lock's scope must not cross an `await`.** If it must, use the async mutex and
say so in a comment.

**Futures are lazy until awaited.** Learners write `let f = do_work();` and are surprised that nothing
happens, or that their timeout never fires. Reiterate: building a future performs no work; it is a
description. Corollary traps: a future built but never awaited is dead code the compiler may warn about;
`select!` drops the losing branches; a future stored in a struct does nothing until polled.

**The crucial point: async code can compile cleanly and still fail operationally.** Nothing in the type
system prevents:

- an unbounded `spawn` loop that exhausts memory or file descriptors.
- a lost wakeup that hangs a task forever.
- a retry storm with no backoff.
- a cancelled request that left a half-written state behind.
- a shutdown that drops in-flight work.
- a single blocking call that degrades every task on the runtime.

Tell the learner this explicitly, and make review questions operational: what happens under load, what
happens when this fails halfway, what happens on shutdown, what is the bound.

**Cancellation safety deserves real attention.** Dropping a future stops it at the current await, and any
partial work is lost. Whether that is safe is a property of the operation: a read into a local buffer is
usually fine; a read that consumed bytes from a stream, or a partially completed multi-step update, is
not. Ask the learner to identify the cancellation points in their own code and say what state is left
behind.

**`Pin` is taught only when genuinely required.** It is not needed to write async application code, and
teaching it early adds difficulty without changing any decision the learner makes. Introduce it when: a
compiler error names `Unpin` and the learner needs to understand the message; or the learner writes a
manual `Future` implementation; or they need a self-referential structure. When it is taught, teach it as
a promise about not moving a value after it has been polled — not as a keyword to sprinkle.

**On `select!`:** always ask which branch lost and what happened to it. The answer — it was dropped,
possibly mid-operation — is the cancellation-safety discussion in one question.

## Evidence of mastery

- Implements a bounded-concurrency fetcher with a semaphore, timeouts, and retries with backoff, without
  help.
- Predicts the operational symptom of a blocking call inside an `async` task, and produces the fix.
- Identifies every cancellation point in a function and states what partial state each one leaves.
- Diagnoses a task that hangs because a wakeup was never signalled by reading the future's `poll` logic.
- Explains why a future built but not awaited performs no work, and demonstrates it.
- Writes a graceful shutdown that drains in-flight work and respects a deadline.
- Chooses between `std::sync::Mutex` and `tokio::sync::Mutex` for a given case and justifies the choice.
- Explains why a `MutexGuard` cannot be held across an await in terms of `Send`, not only in terms of the
  compiler message.
- Picks between spawn, channel and stream for a described producer-consumer problem, with a stated bound.
- Explains what `Pin` guarantees and why it exists, and does not use it where it is not required.
- Traces a non-`Send` future to the specific value held across an await.

## Projects that teach this

- **Concurrent downloader.** A bounded pool of in-flight requests with per-request timeouts, retries with
  jittered backoff, and a summary report. The canonical async project, and it connects directly to
  `networking`.
- **Async TCP chat server.** Rooms, broadcast channels, per-connection tasks, and a shutdown path. Pairs
  well with `concurrency` for a threaded comparison.
- **Rate-limited API client.** A token-bucket limiter, `Semaphore`-bounded concurrency, and a written
  decision on what happens when the limit is hit: queue, drop, or block.
- **Streaming pipeline.** Source, transforms and sink as streams with backpressure, plus a cancellation
  test that drops the consumer midway and asserts on the producer's behaviour.
- **Hand-rolled executor.** Poll a small set of futures with a wakeup queue. The point is not to ship it;
  it is to make `Future`, `Waker` and `Pin` concrete for a learner who needs them. Optional, and only
  after the application-level material is solid.

## Related

`concurrency`, `networking`, `performance`, `operating-systems`, `distributed-systems`, `debugging`,
`testing`.

See [index.md](index.md) for routing, [performance.md](performance.md) for latency measurement under
async, [debugging.md](debugging.md) for tracing a hung task, [testing.md](testing.md) for deterministic
async tests, and [../rust/ownership.md](../rust/ownership.md) for the ownership rules that make futures
`Send` or not.
