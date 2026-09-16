# Data structures and algorithms

Data structures and algorithms are how you decide what a program costs, before you run it — the vocabulary for
saying "this scales", "this does not", and "this is fast for a reason I can name".

## What to teach

| Area | Topics |
| :--- | :--- |
| Linear structures | Arrays, `Vec`, linked structures, stacks, queues, deques, ring buffers, bitsets |
| Mapping structures | Hash tables, open addressing vs chaining, bloom filter concepts, LRU-style structures |
| Trees | Binary trees, BSTs, balanced trees as a concept, heaps, priority queues, tries |
| Graphs | Representation, adjacency list vs matrix, union-find, DAGs |
| Algorithms | Searching, sorting, binary search, recursion, divide and conquer, greedy, dynamic programming |
| Graph algorithms | BFS, DFS, shortest path, topological sort |
| Strings | Searching, prefix matching, hashing, the shape of string algorithms |
| Analysis | Time and space complexity, amortised analysis, cache behaviour, allocation cost |

The analysis row is not a separate topic. It runs underneath every other row, from the first `Vec` push.

## Sequence

Nothing here is a rigid syllabus. What matters is what unlocks what.

1. **`Vec` and slices first.** Everything else is a variation on contiguous memory. Before the learner writes a
   linked list, they must be able to say why `Vec` is usually the right answer and what it costs when it is not.
2. **Complexity notation rides along with `Vec`.** Big-O is introduced against operations the learner has already
   used: indexing, push, insert-in-middle, `contains`. It is a description of a curve, not a badge.
3. **Stack and queue as constraints, not as code.** "Last in, first out" and "first in, first out" are design
   decisions. Implement each twice: once over `Vec`, once over a `VecDeque`. The comparison teaches.
4. **Hash tables next**, once the learner has felt a linear search. They need the motivation before the mechanism.
5. **Recursion before trees.** A learner who cannot trace a recursive call cannot reason about a tree traversal;
   they will memorise the traversal instead.
6. **Trees, then BSTs, then heaps.** Each depends on the previous invariant. `BinaryHeap` in `std` comes after the
   learner has maintained a sift-up and sift-down by hand.
7. **Sorting before binary search.** Binary search assumes order; the learner should have produced and questioned
   that order at least once.
8. **Graphs last among structures**, because they combine everything: traversal (recursion or a queue),
   visited-set (hashing or bitset), and a worklist (stack or heap).
9. **Dynamic programming after plain recursion**, and only after the learner has written a recursive solution that
   recomputes visibly. DP is memoisation first; the tabular form is an optimisation, not the concept.
10. **Union-find, tries, bloom filters, LRU** are taught when a project gives them a reason to exist, not as a tour.

## Teaching notes

**The competitive-programming trap.** This is the failure mode of the whole domain. A learner who has drilled
algorithm puzzles learns to classify a problem statement and emit the matching template. They can write Dijkstra
and cannot tell you what in their program is a graph. Symptoms: they ask "which algorithm is this?", they reach
for a `HashMap` in a tight loop because it "is O(1)", they have never profiled anything, and they think
asymptotics is the whole story.

The counter is to never introduce an algorithm without its real-software instantiation. Teach them together:

| Structure | Where it actually lives |
| :--- | :--- |
| Heap / priority queue | Task schedulers, timer wheels, rate limiters, top-k queries |
| Trie | HTTP router tables, autocomplete, IP prefix lookup, spell check |
| Graph traversal | Dependency resolvers, build systems, package managers, module cycles |
| Ring buffer | Network receive paths, audio and log buffers, lock-free queues |
| Hash map | Caches, indexes, deduplication, join tables |
| LRU | Bounded caches with eviction: browsers, CDNs, page caches |
| Union-find | Connected components, image segmentation, network reachability |
| Topological sort | Build order, migration ordering, spreadsheet cells |

When the learner solves a puzzle, ask immediately: "where would this appear in a real system, and what would
change about it there?" If they cannot answer, the algorithm has not been learned, only transcribed.

**Implement by hand once, then use the crate.** The rule is firm: any structure the learner relies on must be
built once from scratch, in Rust, badly, with tests. Then they throw it away and use `std` or a crate. The point is
that after building a hash map, `entry()` and load factor are obvious rather than magic. What they should *not* do
is keep the hand-rolled version in a real project.

**Misleading intuitions to expect:**

- *"O(1) means fast."* A `HashMap` lookup is slower than a `Vec` index by a large constant factor. O(1) with a bad
  constant, cache misses, and hashing cost can lose to O(log n) with locality. Make them measure.
- *"Linked lists are fast to insert into."* Finding the position is the cost, and every node is a cache miss plus
  an allocation. A `Vec` of a few thousand elements beats a linked list at almost everything. Let them prove it.
- *"Big-O is the whole story."* Amortised cost, allocation count, and cache behaviour often decide. `Vec::push` is
  amortised O(1) only because of reallocation strategy — ask them what happens with `with_capacity` removed.
- *"Recursion is slow."* Often the clearer option. What matters is depth, and in Rust, stack overflow on unbounded
  depth. Tail-call optimisation is not guaranteed here, unlike in some languages they may know.
- *"Binary search is trivial."* It is famously easy to get wrong at boundaries. Have them write it against a
  fuzz-like table of edge cases, or use `slice::binary_search_by` and read its contract carefully.
- *"More indirection is more flexible."* Every `Box`, `Rc`, and `RefCell` in a hot structure is a pointer chase.

**On Rust specifics.** Ownership makes some structures genuinely awkward — a doubly linked list or a tree with
parent pointers is hard for real reasons, and hitting that wall teaches more about ownership than any exercise.
Let them hit it, then show `Vec`-of-indices or an arena as the usual Rust answer. This is the bridge to
`../rust/ownership.md`.

**On complexity claims.** Require the learner to state complexity as a sentence with a variable, not a symbol
dump: "each element is inserted once and removed once, so the whole pass is linear in the number of elements".
A learner who writes "O(n)" without saying what n is has not understood it.

## Evidence of mastery

- Implements a hash map with open addressing, including resize and collision handling, without help, and explains
  why the load factor matters.
- Implements a binary heap from scratch with sift-up and sift-down, then uses `BinaryHeap` with `Reverse` for a
  min-heap without hesitating.
- Predicts the complexity of a function they just wrote, and is right, including the amortised case.
- Chooses between `Vec`, `VecDeque`, `HashMap`, `BTreeMap`, and a heap for a stated requirement and justifies the
  choice on access pattern rather than on habit.
- Diagnoses a slow function as quadratic and rewrites it to be linear, or explains why it cannot be.
- Writes a graph traversal for an unfamiliar problem and explains what the queue or stack represents.
- Reads a real project's code and identifies which structure is being used and why.
- Argues against using a linked list in a specific real case, with an argument about memory and cache rather than
  dogma.
- Recognises when a puzzle-shaped problem has a real-software shape and says so unprompted.
- Measures two implementations instead of asserting one is faster.

## Projects that teach this

1. **Text index and search.** Build an inverted index over a corpus: tokenise, map terms to posting lists, support
   phrase queries, add a trie-based autocomplete on top. Teaches hash maps, tries, sorting, and the gap between a
   correct index and a fast one.
2. **Task scheduler with priorities.** A small runtime that holds jobs in a binary heap, supports cancellation,
   and runs them on a worker pool. Teaches heaps, ordering, and the heap-to-scheduler mapping directly.
3. **Dependency resolver.** Parse package manifests with dependency edges, detect cycles, produce a topological
   build order, and report which packages a failure would block via union-find. Teaches graphs end to end.
4. **Bounded LRU cache with statistics.** Implement LRU by hand (map plus intrusive list over indices), add
   hit/miss counters, then compare against the hand-rolled version and a crate. Teaches eviction, ownership
   pressure, and measurement.
5. **Ring-buffer log or metrics pipeline.** A fixed-capacity ring buffer that overwrites the oldest entry, with a
   reader and writer and a throughput benchmark. Teaches fixed memory, wraparound indexing, and cache behaviour.

## Related

- `testing.md` — every hand-rolled structure gets tests, including edge cases and the boundary conditions above.
- `performance.md` — the measurement discipline that turns complexity reasoning into an empirical claim.
- `debugging.md` — for the cases where the structure is right and the bug is elsewhere.
- `../rust/ownership.md` — why trees and doubly linked lists fight the borrow checker, and the arena answers.
- `../rust/rust-language.md` — generics, traits, and iterators as the tools you build these with.
- `computer-architecture.md` — cache behaviour, the part of this domain that asymptotics hides.
- `index.md` — routing and prerequisites for this domain.
