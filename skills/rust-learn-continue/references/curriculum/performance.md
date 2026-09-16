# Performance

Performance work is applied measurement: the domain exists to replace opinions about what is slow with numbers
about what is slow, and to keep the engineer honest about the difference between the two.

## What to teach

- Measurement before optimisation. The rule that no change is made until a baseline exists, and no change is kept
  unless it moves the baseline reproducibly.
- Benchmarking with `criterion`: statistical treatment of noise, warm-up, `black_box`, and comparison against a
  saved baseline. Why `criterion` refuses to give a single number without an interval.
- The `#[bench]` unstable alternative and why `criterion` is the practical default on stable Rust.
- Profiling: `perf record` and `perf report`, `cargo flamegraph`, and the honest caveat that this tooling is
  weaker on Windows. What to do instead: WSL, `superluminal` or `VTune` on Windows, sampling profilers that do
  work, and instrumented timing when sampling is unavailable.
- CPU profiles: reading a flame graph, distinguishing self time from total time, and recognising a wide frame as
  the next thing to look at rather than the answer.
- Allocation profiling: counting allocations, `dhat`, `heaptrack` where available, allocator statistics, and the
  standard-library `GlobalAlloc` hook as a home-made counter.
- Memory use: resident versus virtual, peak versus steady state, and measuring the difference a `Vec` capacity
  hint makes.
- Latency distributions: why the mean is the least informative statistic in the file, and what a histogram shows
  that an average hides.
- Percentiles: p50, p95, p99, p999, how to compute them, and the trap of averaging percentiles across samples.
- Throughput: requests per second, items per second, and the fact that throughput and latency are different
  questions with different answers.
- Tail latency: why the tail is the user experience, and how queueing makes it non-linear as utilisation rises.
- Cache behaviour: locality, cache lines, prefetching, false sharing, and `cachegrind` or manual experiments as
  the ways to see it. Deep treatment lives in `computer-architecture`.
- Copy avoidance: `&str` over `String`, slices over `Vec`, iterators over intermediate collections, and `Cow`.
- The real cost of `.clone()`. It is not banned, but it must be measured; a clone in a cold path is free, and
  the same clone in a hot loop is the entire problem.
- Batching: amortising per-item cost, the standard trick for networks, files, and databases, and the latency
  penalty it introduces when it is designed badly.
- Buffering: `BufReader`, `BufWriter`, `read_to_end` versus byte-at-a-time, and flushing semantics.
- Contention and synchronisation cost: lock contention under load, atomic contention, channel overhead, and
  why a faster algorithm under a lock can be slower end to end. Connects to `concurrency`.
- Algorithmic complexity first: O(n²) in a loop beats any micro-optimisation, and the constant factor only
  matters once the exponent is right.
- Compiler optimisation basics: `--release`, opt levels, inlining, monomorphisation, `#[inline]` where it helps
  and where it does not, LTO, `codegen-units`, and the target CPU settings.
- SIMD concepts: vectorisation that the compiler performs by itself, and `std::simd` or `packed_simd` when it
  does not. Conceptual level: lanes, alignment, and why the memory layout decides whether it is possible.

## Sequence

Open with measurement, and with the discipline that nothing is optimised before it is measured. Learners arrive
believing performance work is a set of tricks; the first weeks are about dismantling that. Have them write a
benchmark before they write an optimisation.

Then `criterion` specifically, because a hand-rolled `Instant::now()` loop is the wrong tool and produces numbers
the learner will over-trust. Teach reading a benchmark report, including the confidence interval and the fact that
a two percent difference may be noise.

Then profiling, once the learner has a measured baseline worth explaining. A profile without a baseline answers a
question nobody asked. Start with `cargo flamegraph` on Linux or WSL, and take the Windows detour honestly: show
what is available, show what is not, and pick the substitute.

Allocation profiling and memory measurement come next, because in Rust these usually explain the surprises: the
program is not slow in the arithmetic, it is slow in the allocator, or in something that reallocates a `Vec` on
every push.

Cache behaviour, copy avoidance, and clone cost are a cluster, best taught against a real hot loop that the learner
already measured. They only land when the learner sees the number move. `computer-architecture` provides the depth;
this file provides the measurement.

Batching, buffering, and contention are taught when the project involves I/O or threads, which is most projects.
Batching and buffering unlock as soon as a loop touches a file, socket, or database. Contention unlocks after
`concurrency` gives the learner a shared state to contend over.

Algorithmic complexity is not last, it is first, and it is worth restating throughout: the sequence here is about
tools, and the ordering principle is always that the exponent beats the constant. If a learner is micro-tuning a
quadratic loop, stop them.

Compiler optimisation and SIMD come at the end, deliberately. A learner who reaches for `unsafe` intrinsics before
they can read a flame graph is optimising the wrong thing with the wrong tool. SIMD is conceptual at this level;
recognising when the compiler vectorises and when it cannot is the goal, not hand-writing intrinsics.

## Teaching notes

**"Looks fast" is not "measured fast".** This distinction is the core of the domain and should be stated in those
words. Code that looks fast has few lines, no allocations visible, an iterator chain, or a clever bit trick. Code
that is measured fast has a benchmark file, a saved baseline, and a delta that survived a rerun. The mentor should
say, whenever a learner asserts speed: where is the number? Not as a putdown, but as the standing request that
defines the discipline. The inverse also holds: code that looks slow is often not the bottleneck, and code that
looks elegant is often allocating in a loop.

**A benchmark run in debug mode is meaningless.** `cargo bench` uses the release profile, but a hand-written timing
loop run with `cargo run` does not. Unoptimised Rust can be ten to a hundred times slower than optimised Rust, and
the ratio is not uniform across code, so a debug-mode comparison can invert the real ranking of two
implementations. Check the profile before trusting the number, every time, and teach the learner to check it in
their own work.

Other traps, in the order they usually appear:

- **Optimising what looks slow rather than what is measured.** The learner rewrites a function that is three
  percent of runtime because it is the ugliest. Insist on the profile.
- **Micro-benchmarking something that is not the bottleneck.** A carefully tuned parser in a program that spends
  ninety percent of its time in a database call. The benchmark is real and the optimisation is worthless.
- **Ignoring allocation and cloning.** The most common actual cause in Rust. A `.clone()` on a `String` inside a
  loop, or a `Vec` that grows by reallocation, routinely beats every algorithmic change the learner attempts.
- **Confusing latency with throughput.** A change that improves throughput by batching may worsen per-request
  latency, and both numbers are correct. Ask which one the requirement is about before accepting either.
- **Reporting a good mean while the tail is terrible.** A p50 of two milliseconds with a p99 of two seconds is a
  broken service. Always ask for the distribution, and be suspicious of a single number.
- **Optimising without a saved baseline.** Without a baseline, "improvement" is a memory. `criterion` can save and
  compare baselines; use it.
- **Trusting one run.** Noise, thermal throttling, background processes, and the first-run filesystem cache all
  move numbers. Require repeats and look at the spread.
- **Benchmarking the wrong workload.** A benchmark on a ten-element input says nothing about a million-element
  input, and vice versa.

Also teach the meta-trap: performance work has no natural stopping point. Set a target before starting, expressed
as a requirement ("p99 under fifty milliseconds at a thousand requests per second" or "this batch job finishes in
under ten minutes"), and stop when it is met. Optimisation without a target is a way to avoid shipping.

When the learner proposes an optimisation, ask two questions in order: what does the profile say is hot, and what
number will tell us whether this helped? If either answer is missing, the change is not ready.

Windows-specific honesty: sampling profilers and flame graphs are a first-class experience on Linux and a
second-class one on Windows. Do not pretend otherwise. WSL is the pragmatic answer for most learners, and it is
worth the setup cost precisely because performance work is where the gap is widest.

## Evidence of mastery

- Measures a baseline before changing any code, and refuses to accept an optimisation that has no before number.
- Writes a `criterion` benchmark with a realistic input size and interprets the reported interval rather than
  quoting the point estimate alone.
- Reads a flame graph and identifies the dominant self-time frame, distinguishing it from a frame that merely
  calls it.
- Diagnoses an allocation problem by measuring allocations rather than by inspecting the source.
- States the difference between latency and throughput for a described workload, and says which one the requirement
  is actually about.
- Reports a latency distribution with percentiles, and explains why the mean is insufficient.
- Detects the debug-profile mistake in a benchmark, in their own work or someone else's, before trusting the number.
- Identifies a clone or an allocation in a hot loop as the bottleneck using measurement, and demonstrates the
  improvement against the saved baseline.
- Chooses a batching or buffering strategy for an I/O bound task and can state the latency cost it introduces.
- Measures contention by varying concurrency and explains the shape of the throughput curve.
- States the complexity of the code being optimised and rules out an algorithmic cause before tuning constants.
- Recognises when the compiler has vectorised a loop and when the data layout prevents it, and names a layout
  change that would allow vectorisation.
- Defines a numeric performance target before optimising, and stops when it is met.

## Projects that teach this

- **Benchmark a JSON parser three ways.** Hand-written, `serde_json`, and `simd-json`, with `criterion`, real
  payloads of several sizes, and a written comparison that separates parsing from allocation.
- **Log-processing pipeline.** Read, parse, aggregate, and write a few hundred megabytes, then profile and reduce
  the time. Allocation and I/O dominate, which is the intended lesson.
- **Allocation-hunting kata.** A program with a deliberately hidden allocation in a hot loop, measured with an
  allocator counter, reduced to zero allocations per iteration.
- **Latency harness for a local service.** Measure a small HTTP or in-process service under increasing concurrency
  and report the full distribution, including the tail, with an explanation of the shape.
- **Cache-experiment worksheet.** Matrix multiplication, or a linked-list versus `Vec` traversal, measured across
  sizes to expose cache effects and vectorisation thresholds empirically.

## Related

`computer-architecture`, `data-structures-algorithms`, `concurrency`, `async-rust`, `operating-systems`, `networking`,
`databases-storage`, `debugging`.

See [index.md](index.md) for routing, [testing.md](testing.md) for reproducible measurement harnesses,
[../rust/rust-language.md](../rust/rust-language.md) for iterator and ownership idioms that avoid copying, and
[../rust/ownership.md](../rust/ownership.md) for why `clone` is the usual suspect.
