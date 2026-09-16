# Distributed systems

Distributed systems teach the learner to reason about programs whose components fail independently, so that
they design for partial failure instead of discovering it in production.

## What to teach

| Area | Topics |
| :--- | :--- |
| Partial failure | A machine that cannot be seen can fail without you knowing; success, failure, and *unknown* |
| Retries | Backoff, jitter, retry budgets, amplification, when retrying is wrong |
| Idempotency | Idempotency keys, deduplication windows, at-least-once side effects |
| Timeouts | Deadlines versus timeouts, deadline propagation, timeout budgets across hops |
| Delivery semantics | At-most-once, at-least-once, exactly-once and why the last is subtle |
| Replication | Leader-follower, multi-leader, quorum reads and writes, read-your-writes, lag |
| Consistency | Linearisable, sequential, causal, eventual, monotonic reads; what each user-visible promise means |
| CAP and tradeoffs | Availability versus consistency under partition, PACELC in outline, why the choice is per-operation |
| Leader election | Terms, leases, split brain, why a majority is the usual answer, fencing tokens |
| Consensus | Raft and Paxos conceptually: replicated log, commit index, why consensus is for small state, not for data |
| Clocks and ordering | Wall clock versus monotonic clock, skew, drift, Lamport clocks, vector clocks, causality |
| Coordination | Locks with leases, service registration, configuration propagation, the failure modes of each |
| Backpressure | Bounded queues, load shedding, admission control, why unbounded buffering converts failure into latency |
| Service discovery | Static config, DNS-based, registry-based; health checks and the cost of a stale entry |
| Observability | Structured logs, metrics, traces, correlation IDs, and what a single machine's log cannot tell you |

## Sequence

Distributed systems is the last domain, not because it is hardest to explain but because everything it needs
must already be real to the learner. Do not open this file early.

1. **Networking first.** Timeouts and partial failure are meaningless without sockets, round trips, and the
   experience of a request that never answers.
2. **Concurrency, then async.** A single-node service with a thread pool or a Tokio runtime is the substrate.
   Without it, replication and backpressure have nothing to attach to.
3. **Storage and transactions.** Replication is replication *of something*. The learner must know what a commit
   is before they can reason about whether it survived.
4. **Partial failure as the first idea.** One client, one server, one timeout. The learner must sit with the fact
   that the client cannot distinguish "the server never got it" from "the server did it and the reply was lost".
5. **Idempotency before retries.** Teach the fix before the reflex. A learner who learns retries first writes
   duplicate-charging bugs and then learns idempotency the hard way.
6. **Clocks and ordering**, once the learner has asked "which write is newer?" and discovered the answer is not
   obvious from timestamps.
7. **Replication and consistency**, together. Replica lag is the mechanism; stale reads are the symptom.
8. **Leader election, then consensus.** Election is the problem; consensus is the toolbox. Raft before Paxos —
   the same ideas are more legible in Raft, and Paxos reads as a refinement afterwards.
9. **Coordination, discovery, backpressure**, as operational concerns once the theory has a shape.
10. **Observability last**, because it is how every earlier topic is debugged.

Unlocks: a two-node replicated store, then a small multi-node service, then reading a real system's design
document and identifying which guarantees it actually offers rather than which it claims.

## Teaching notes

**Do not teach this prematurely.** A learner who has not written a socket, not awaited a future, and not used a
database will memorise the vocabulary and recognise none of the failure. If the prerequisites are missing, say
so plainly and route to `networking`, `concurrency`, `async-rust` or `databases-storage`. Vocabulary without
the substrate is the most common way this domain is wasted.

**The central insight, stated once and then tested repeatedly: a distributed system is one in which a machine
you cannot see can fail without you knowing.** Almost every distributed bug is the local case wrongly assumed.
Locally, a call either returns or panics — failure is a fact you observe. Across a network, failure is a
*third* state, indistinguishable from slowness. Build the learner's reasoning around three outcomes, not two:

```
success        -> the work happened
failure        -> the work did not happen
unknown        -> the work may or may not have happened; you cannot tell
```

Every design question in this domain is really "what do we do about *unknown*?"

**Teach from real failure behaviour, not from theory.** Fifteen minutes of theory, then break something and
watch. The exercises that land:

- Kill the server mid-request. Ask the learner to name what the client knows. The answer is: nothing definite.
- Make the handler succeed but drop the reply. The learner sees a timeout on a write that was committed.
- Retry the timed-out write and show the duplicate. Now idempotency is not an abstraction.
- Set a timeout shorter than the server's own work. The client gives up; the server finishes anyway. Ask who
  owns the side effect now.
- Read from a replica immediately after writing to the leader. Show the stale value, then fix it with
  read-your-writes routing.
- Run two clients incrementing a counter read-modify-write style and count the lost updates.
- Fill a queue faster than it drains, with no bound. Watch latency climb while throughput stays flat — the
  standard signature of missing backpressure.

**Unlearn the fallacies in order.** The first is the one that matters most: *the network is reliable*. Every
other assumption the learner holds — that calls are fast, that bandwidth is infinite, that topology is stable,
that latency is zero, that there is one administrator — is a special case of it.

**Retries need three things before they are safe**, and the learner should be able to recite them: idempotency
of the operation, a backoff with jitter, and a bound (attempt count, deadline, or budget). Retries without a
bound turn a slow dependency into an outage. Retries without jitter synchronise every client into a thundering
herd. Retries without idempotency duplicate work.

**Exactly-once is a promise about effects, not about messages.** The honest statement is: at-least-once
delivery plus idempotent processing, or a transaction that makes the effect and the acknowledgement atomic.
Ask the learner to design a payment handler that can safely retry, and let them discover that deduplication
requires storage keyed by an identifier the client supplies.

**Clocks: wall clocks lie, monotonic clocks do not go backwards but are not comparable across machines.** Use
`Instant` for durations and timeouts in Rust — never `SystemTime` arithmetic. Use `SystemTime` only for
timestamps you display. Cross-machine ordering needs logical clocks or a service that assigns sequence numbers.
A learner who reaches for `SystemTime` to decide "which write won" has not understood the domain yet.

| Misleading intuition | Correction |
| :--- | :--- |
| "A timeout means the request failed." | It means no reply arrived in time. The work may have completed. |
| "Retries improve reliability." | Only with idempotency, backoff with jitter, and a bound. |
| "A monotonic counter is consistent across nodes." | Only within one process. Ordering across nodes is its own problem. |
| "We need consensus for our data." | Consensus is for small critical state — membership, leases, a log index. Bulk data uses replication. |
| "Eventual consistency means anything goes." | It means a stated convergence rule and a stated bound on how stale a read may be. |
| "More replicas means more availability." | More replicas means more availability if quorums are set correctly and less if they are not. |
| "A health check means the node is fine." | It means the health endpoint answered. Say what it checks and what it does not. |
| "Sleeping and retrying is a backoff." | A fixed sleep is a synchronised retry. Jitter is the point. |
| "The queue absorbs the burst." | An unbounded queue converts a throughput problem into a latency problem and then a memory problem. |
| "Two leaders is a config typo." | It is split brain, and the answer is fencing tokens, not vigilance. |

**Backpressure is the hardest topic to teach because the wrong answer feels like kindness.** Buffering looks
like it protects the downstream service. It does not; it moves the failure to a place with worse information.
Teach bounded queues, a load-shedding policy with a status code the caller can act on, and admission control at
the edge. Ask the learner what their service does when the queue is full. "It waits" is a design, and usually
not the intended one.

**Leader election: leases and fencing before the algorithm.** The learner should be able to explain why a leader
that has been paused can still believe it is leader, and why every write must carry a monotonically increasing
fencing token that the storage layer rejects when stale. This insight prevents more real incidents than Raft does.

**Raft and Paxos at a conceptual level only.** Terms, majority quorums, replicated log, commit index, elections
on leader failure, and the safety argument that two majorities cannot decide conflicting values. Do not make the
learner implement Raft before they have implemented a replicated log with retries; they will satisfy the paper
and miss the operational point.

**Observability is not dashboards.** Teach that a single machine's log cannot answer "was the write lost?" — only
a correlation ID stitched across services can. Structured logs, one trace per request, and metrics with a
latency *distribution* rather than a mean.

**Rust-specific notes.** Timeouts belong on the operation, expressed as `tokio::time::timeout` around the whole
attempt — not as a socket-level setting that leaves the retry loop running. Use `Instant` for durations and
`SystemTime` only for display. Prefer owned data crossing a task boundary over borrowed data. Retry logic
belongs in a typed policy, not an inline `for _ in 0..3`. And make "unknown" representable: a closed enum with
an `Unknown` variant, not an `Option` that means two different things.

## Evidence of mastery

- Diagnoses a timed-out write by naming all three possible outcomes, and says what evidence would separate them.
- Traces a request through a client, a service and a datastore, identifying every unhandled partial failure.
- Writes a retry policy unaided with backoff, jitter and a deadline, and justifies the bound.
- Designs an idempotent handler for a non-idempotent operation, including the deduplication key and its expiry.
- Explains read-your-writes and names the concrete routing change that provides it.
- Reads a system's description and says which consistency model it offers and what that costs during a partition.
- Describes leader election with leases, and explains what a paused leader can do wrong and how fencing stops it.
- Explains Raft's replicated log and commit index conceptually without hand-waving the safety argument.
- Chooses `Instant` over `SystemTime` in an argument about ordering, and explains why.
- Predicts queue growth under a load spike, then demonstrates it with a bounded queue and load shedding.
- Reads a trace spanning two services and localises a latency regression to one hop.

## Projects that teach this

- **Replicated key-value store with quorum reads and writes.** Three nodes, a simple replicated log, configurable
  `R` and `W`. Then partition one node and have the learner state what each read returns and why. Teaches
  replication, quorums, and consistency as an empirical property.
- **Job queue with at-least-once delivery and deduplication.** Workers claim jobs, a job may run twice by design,
  and an idempotency key makes the effect once-only. The learner sees the duplicate, not just reads about it.
- **Fault-injecting proxy in front of an HTTP service.** It can delay, drop, or duplicate responses on command.
  Have the learner write a client before it, then after it, and compare. The best exercise in this domain.
- **Leader election and a fenced resource.** Nodes elect a leader with leases; the resource rejects writes whose
  fencing token is stale. The learner induces a split brain deliberately and watches the token save them.
- **End-to-end trace collector.** Services emit spans with a correlation ID; the collector stitches a request
  across hops and prints a waterfall. Teaches observability by building the thing you would rely on.

## Related

`networking`, `concurrency`, `async-rust`, `databases-storage`, `performance`, `debugging`, `security`,
`software-architecture`.

See [index.md](index.md) for prerequisites and routing. [testing.md](testing.md) for testing retry and timeout
logic without flaky tests, [debugging.md](debugging.md) for trace-driven diagnosis, [performance.md](performance.md)
for latency distributions, and [../rust/ownership.md](../rust/ownership.md) for `Arc`, `Send` and shared state.
