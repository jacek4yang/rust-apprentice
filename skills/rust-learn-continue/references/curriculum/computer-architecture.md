# Computer architecture

Computer architecture is taught here for one reason: to let the learner reason about *why* fast code is fast, and
to make performance claims they can check rather than assert.

## What to teach

| Area | Topics |
| :--- | :--- |
| Execution | CPU execution model, registers, instruction execution, the fetch-decode-execute loop as a mental model |
| Data movement | Memory hierarchy, cache lines, L1/L2/L3, latency vs bandwidth, main memory |
| Locality | Spatial and temporal locality, working sets, why access order dominates instruction count |
| Speculation | Branch prediction, misprediction cost, why unpredictable branches hurt |
| Parallelism | SIMD concepts, auto-vectorisation, data parallelism within a core |
| Addressing | Virtual memory as the hardware sees it, translation, TLB, why pointers are not physical |
| Concurrency at the metal | Atomics, memory ordering (relaxed, acquire, release, seqcst), fences, false sharing |
| Layout | Alignment, padding, `repr`, struct field ordering, endianness, ABI basics |

Every row must terminate in a Rust observation. If a topic cannot be tied to something the learner can see,
measure, or change in their own code, it is trivia and does not belong in this domain.

## Sequence

1. **Cache lines and locality first.** This is the single highest-yield concept, and it explains most surprising
   benchmark results. Teach it before anything else and revisit it constantly.
2. **Latency numbers as orders of magnitude**, not exact figures. Register, L1, L2, L3, RAM, disk, network — the
   learner needs ratios, and the ratios are stable even as the numbers move.
3. **Size and layout next**, because they are directly observable in Rust: `std::mem::size_of`, `align_of`, and
   field ordering. This is the first place the learner sees architecture in their own source code.
4. **Branch prediction after locality**, once they have a reason to trust that the machine is doing more than the
   source says. Teach it with the sorted-vs-unsorted conditional-sum experiment.
5. **SIMD concepts after loops.** Auto-vectorisation is best taught by showing that a simple loop compiled
   well beats a clever loop compiled badly.
6. **Virtual memory from the hardware side** — translation, TLB, page granularity — after the learner has the
   memory hierarchy in place. This is the bridge to `operating-systems.md`.
7. **Atomics and memory ordering last among the core topics.** They require everything above: caches, coherence,
   and the fact that two cores can disagree about the order of writes. Do not teach `Ordering::Acquire` before the
   learner has written a data race and seen it fail.
8. **False sharing immediately after atomics**, because it is the most common real-world consequence.
9. **ABI and endianness** when the learner touches FFI, binary formats, or network protocols — not before.

## Teaching notes

**This is a performance-reasoning domain, not hardware trivia.** The learner does not need to know pipeline stage
counts or microarchitecture codenames. They need to look at their own code and say "this walks memory in the wrong
order" or "these two counters share a cache line" or "this branch is data-dependent and unpredictable". Redirect
any conversation that drifts toward part numbers.

**Always land on a Rust observation.** The mapping is the curriculum:

| Concept | Rust observation |
| :--- | :--- |
| Struct layout and padding | Reorder fields, watch `size_of` shrink; `#[repr(C)]` when it must not change |
| Indirection cost | `Vec<T>` is contiguous and beats `Vec<Box<T>>` for scanning |
| Cache misses | Iterating a `Vec<Vec<T>>` row-major vs column-major, timed |
| Contention | A `Mutex<u64>` incremented by eight threads vs eight separate counters |
| False sharing | Two `AtomicU64`s adjacent in a struct vs padded apart |
| Branch prediction | Sorting input before a data-dependent conditional |
| Vectorisation | A bounds-check-free slice loop vs one with a branch inside |
| Zero-cost abstraction | An iterator chain producing the same assembly as the manual loop |
| Allocation cost | A hot loop with and without a per-iteration `Vec::new()` |

**How to actually see these effects.** Insist on observation over assertion:

- `std::mem::size_of::<T>()`, `align_of::<T>()`, and `std::mem::offset_of!` for layout questions. Immediate,
  no tooling required, and it turns a guess into a fact.
- `cargo bench` with `criterion` for any performance claim, and `#[inline(never)]` or `std::hint::black_box` to stop
  the optimiser from deleting the thing being measured.
- `perf stat`, `perf record`, and flamegraphs on Linux; on Windows, the equivalent profilers or `perf` under WSL.
  Teach the tool, but do not block the lesson when the tool is unavailable — `size_of` plus timing covers most of it.
- `cargo asm` or Compiler Explorer when the question is genuinely "what did the optimiser do".

**Misleading intuitions to expect:**

- *"The optimiser will fix it."* Sometimes. But optimisers do not fix pointer chasing, cache-unfriendly layouts, or
  contention. Make the learner measure rather than hope.
- *"More threads means faster."* Contention, false sharing, and synchronisation overhead routinely make it slower.
  Have them build the counter example and be surprised.
- *"Atomics are just thread-safe variables."* Atomics are about *ordering* and are not a substitute for a lock.
  A relaxed counter and a seqcst counter have different guarantees, and neither makes a multi-field update atomic.
- *"Reading two variables in order means another thread sees them in order."* Without ordering, no. The classic
  flag-plus-data race is the demonstration.
- *"Iterator chains are slow."* Usually they compile to the same code as the loop. Show the assembly once and the
  objection usually disappears permanently.
- *"Field order does not matter."* It does, for size, and therefore for a struct in an array. A few padding bytes
  per element is a cache-miss difference across a million elements.
- *"Bigger cache is better."* Not the learner's decision, and irrelevant to the code they write. Locality is the
  thing they control.

**On measurement hygiene.** Also teach what makes a benchmark meaningless: no warm-up, measuring debug builds,
measuring something the optimiser deleted, using a single run, using wall-clock in a noisy container, and drawing a
conclusion from one data point. A learner who produces a fast number from a broken benchmark has learned nothing.

**On the ordering ladder.** Teach `Relaxed`, `Acquire`, `Release`, `AcqRel`, `SeqCst` as a ladder of guarantees,
not as a list to memorise. The learner should be able to say which one they need and why, and should be encouraged
to reach for `SeqCst` when unsure and only relax it with a stated reason. Getting this wrong is a correctness bug,
not a performance trade-off.

## Evidence of mastery

- Predicts `size_of` for a small struct with mixed field types, then reorders the fields to shrink it.
- Explains why a `Vec` of structs can outrun a `Vec` of boxed structs without prompting, and demonstrates it.
- Diagnoses a slow loop as memory-bound rather than compute-bound, and says how they know.
- Predicts that a mutex-protected shared counter will scale worse than per-thread counters, and demonstrates the
  effect with a benchmark.
- Recognises false sharing in a struct definition and fixes it by padding or by splitting.
- Reads a loop and predicts whether the compiler is likely to vectorise it, and names the obstacle if not.
- Chooses between `Relaxed`, `Acquire`, and `Release` for a given synchronisation pattern and justifies it.
- Compares an iterator chain against a manual loop, finds them equivalent, and stops making the argument.
- Explains what a cache line is to a non-specialist in three sentences, using their own code as the example.
- Writes a benchmark that survives the optimiser, and says what would falsify their conclusion.

## Projects that teach this

1. **Layout laboratory.** A small CLI that prints size, alignment, and padding for a set of structs, plus a
   benchmark that iterates arrays of the original and optimised layouts. Teaches layout, padding, and locality
   with no external tooling.
2. **Contention benchmark suite.** Increment a shared counter under a mutex, an atomic, per-thread atomics, and
   padded atomics; report throughput against thread count. Teaches contention, false sharing, and benchmarking
   hygiene in one artifact.
3. **Cache-behaviour matrix walk.** Multiply a matrix with row-major and column-major traversal (and a blocked
   version), and benchmark all three on the same data. Teaches locality so clearly it is hard to unlearn.
4. **Branch-prediction experiment.** Sum a large array twice — once unsorted, once sorted — with a data-dependent
   conditional, and explain the difference. Small, memorable, and directly connected to scheduling and filtering
   code the learner writes later.
5. **SIMD-friendly pixel or vector kernel.** Brightness, blend, or dot-product over a large buffer; naive loop
   first, then bounds-check-free slices, then `std::simd` or a portable SIMD crate, benchmarked at each step.
   Teaches vectorisation and where the remaining time actually goes.

## Related

- `performance.md` — measurement, profiling, and the discipline that makes this domain useful rather than academic.
- `data-structures-algorithms.md` — where cache behaviour pulls against asymptotic reasoning.
- `operating-systems.md` — virtual memory, pages, and the kernel side of the same hierarchy.
- `../rust/ownership.md` — layout, `Box`, and the cost of indirection in Rust terms.
- `../rust/rust-language.md` — iterators and abstractions that cost nothing at runtime.
- `debugging.md` — for when the surprising number is caused by a bug, not by the machine.
- `index.md` — routing and prerequisites for this domain.
