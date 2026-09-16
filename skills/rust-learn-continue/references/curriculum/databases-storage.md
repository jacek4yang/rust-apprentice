# Databases and storage

This domain covers how a Rust program keeps data across runs: the relational model and its query language, the
transactional guarantees that make concurrent access safe, and the storage formats and caches that sit underneath.

## What to teach

- The relational model: tables, rows, keys, relationships, and why the model is about sets of rows rather than
  about objects. Normalisation to the point where the schema stops lying.
- SQL basics through to intermediates: `SELECT`, `WHERE`, `JOIN` in its several forms, `GROUP BY`, aggregates,
  subqueries, `INSERT`/`UPDATE`/`DELETE`, and `RETURNING`.
- Query plans: `EXPLAIN` and `EXPLAIN ANALYZE`, reading a scan versus an index seek, and the fact that the
  database is guessing.
- Indexes: what a B-tree index does, covering indexes, composite column order, when an index is ignored, and the
  write cost of every index added.
- ACID, each letter separately, with a concrete failure it prevents. Atomicity and durability are the two that
  learners can see if you show them a crash mid-write.
- Transactions: explicit `BEGIN`/`COMMIT`/`ROLLBACK`, autocommit, savepoints, and the length of a transaction as a
  first-class design decision.
- Isolation levels: read committed, repeatable read, serialisable, and the anomalies each permits. Non-repeatable
  reads, phantom reads, and write skew, demonstrated rather than described.
- Connection pools: why they exist, pool size as a function of the database and the workload, checkout timeouts,
  and what happens when the pool is exhausted. Often the real cause of a production outage.
- Migrations: forward and backward, versioned files, idempotency, and the discipline of never editing a migration
  that has been applied anywhere.
- Serialisation and persistence formats: `serde` with JSON, TOML, and bincode; when a schema-less format is a
  mistake; versioning a persisted structure; and what happens to old data when a field is renamed.
- Key-value storage: `sled`, `redb`, embedded stores in general, and the embedded row store in `rusqlite`.
- Write-ahead logging concepts: append the intent, then apply; crash recovery; checkpointing; and why a WAL makes
  both durability and concurrent readers possible. Enough to read a database's documentation and understand it.
- Caching: in-process caches, TTL versus invalidation, cache keys, and negative caching. The consistency
  obligations a cache creates.
- Consistency: read-your-writes, eventual consistency, replicas, and staleness bounds. The conceptual bridge to
  `distributed-systems`.
- Rust specifics: `sqlx` versus `rusqlite` versus a pure query builder. `sqlx` compile-time query checking against
  a live or offline schema. `r2d2` or `deadpool` for pooling. `sqlx::FromRow` versus hand-written mapping. Async
  drivers and the runtime they need.

## Sequence

Start with the relational model and SQL, on `rusqlite` against a single file. SQLite is embedded, needs no server,
and lets the learner see the whole database as a file they can copy, which makes the mental model concrete. The
first project should be a schema they design themselves, with foreign keys, so that normalisation is learned by
running into a duplicated row.

Then transactions and ACID, using the file-based database to demonstrate rollback by killing the process mid-write.
This is the point where a database stops looking like a fancy hash map.

Indexes and query plans come next, and only after there is enough data to make them matter. An index lesson on a
fifty-row table teaches nothing; the same lesson on a million rows, with `EXPLAIN ANALYZE` before and after, teaches
it in one session. Teach measurement here, in the style of `performance`.

Migrations and schema evolution follow, and they unlock the moment the learner changes a field name in a struct
that was already persisted. Do migrations by hand first, with numbered SQL files, before reaching for a tool.

Isolation levels and concurrency anomalies come after `concurrency` has given the learner the vocabulary of races.
Demonstrate each anomaly with two connections, deliberately interleaved.

Connection pools and `sqlx` with an async runtime arrive when the project becomes a service. This is also where
the async and ownership interactions show up, and they should be taught as a Rust problem rather than a database
problem.

Serialisation formats and key-value stores are somewhat orthogonal and can be taught whenever the project needs
them. The lesson that unifies them is versioning: a persisted structure outlives the code that wrote it, so the
format needs a story for change.

Caching and consistency come last, because a cache is only a good idea after the learner knows what the source of
truth is and how expensive it actually is. Measure first.

## Teaching notes

**N+1 queries.** The classic and the one that recurs forever: fetch a list, then loop over it issuing one query per
item. It is invisible in development with ten rows and fatal with ten thousand. Teach the learner to count queries
per request, not just to write joins. A query counter in a test is the durable fix. It shows up in Rust as a loop
over `rows` with an `await` inside, which looks natural and is the bug.

**Holding a transaction or a connection across an await or a slow operation.** A transaction that is open while the
code calls an external API holds locks and blocks other writers; the same for a pooled connection held through a
long computation, which starves the pool. Teach the shape explicitly: acquire, do the smallest possible unit of
work, commit, release. In Rust this is sharper than in most languages because the borrow checker will not let the
learner casually hold a `Transaction` and a mutable connection at the same time, and the workaround they reach for
is often to clone a pool handle per task, which fixes the compile error and can still exhaust the pool. Name the
distinction between a handle and a checked-out connection, repeatedly, until it is instinct.

**Migrations applied without a rollback plan.** Every migration should have a stated answer to "what do we do if
this is wrong at 3 a.m.?" Some changes cannot be rolled back by reversing the SQL, such as a dropped column, so
the plan is a backup and a restore or a compensating forward migration. Ask for the plan before the migration is
applied, not after.

**Treating an ORM or query builder as a substitute for understanding the query.** A builder that generates SQL is
a convenience, not an excuse. The learner should be able to write the SQL the builder produces, and to say why it
performs the way it does. When a query is slow, the first step is always to make the generated SQL visible and run
`EXPLAIN` on it. Diesel, SeaORM, and `sqlx`'s macros all hide something; know what.

**Inconsistency between an in-memory cache and the source of truth.** Every cache is a copy that will diverge. Ask:
what invalidates it, what happens on a write, and how stale is acceptable. A cache with no invalidation strategy is
a bug with a delay. Teach `HashMap`-based caches as the dangerous default they are in a long-running process, and
prefer a bounded, explicitly invalidated cache with a metric for hits and misses.

Other traps worth naming:

- **Selecting more than needed.** `SELECT *` on a wide table, or fetching a large blob the code never reads.
- **Doing in the application what the database does well.** Sorting, filtering, and aggregating in a Rust loop
  after fetching every row.
- **Unbounded queries.** No `LIMIT` on a query whose table grows forever.
- **String-concatenated SQL.** Also the injection lesson; the parameter binding habit must be automatic.
- **Assuming a transaction is free.** Long transactions block vacuum, replication, and other writers.
- **Forgetting `COMMIT`.** Especially with a dropped handle in Rust, where a dropped transaction rolls back
  silently and the write appears to have succeeded.

On the Rust side, connect the language to the domain:

- `rusqlite` is synchronous, simple, and ideal for a single-threaded tool or a first project. Pooling is manual.
- `sqlx` is async, works with Postgres, MySQL, and SQLite, and its `query!` macros check SQL against a real schema
  at compile time. That compile-time checking is a genuine advantage and worth demonstrating, but it requires either
  a live database at build time or a checked-in offline metadata file, and the learner should set up whichever
  suits them and understand the trade-off. It also makes schema changes fail the build, which is a feature.
- `serde` for persistence: derive `Serialize`/`Deserialize`, and teach `#[serde(default)]`, `rename`, and `deny_unknown_fields`
  as versioning tools rather than decoration.
- The borrow checker's effect on database state across async boundaries. A `Transaction` borrows the connection,
  so it cannot be moved into a spawned task, which is why real code is either deliberately sequential or uses
  `'static` data with a fresh checkout per task. Do not paper over this with clones; explain the ownership reason.

## Evidence of mastery

- Designs a normalised schema for a described domain, with keys and constraints, and explains each relationship.
- Writes joins, aggregates, and subqueries unaided for questions phrased in English.
- Reads an `EXPLAIN ANALYZE` plan and identifies the difference between a scan and an index seek.
- Diagnoses a slow query, adds the appropriate index, and measures the improvement with the plan before and after.
- Explains each ACID property with a specific failure it prevents.
- Demonstrates an isolation anomaly with two concurrent connections and names the weakest level that permits it.
- Writes a migration that changes a schema with existing data, and states the rollback or compensating plan.
- Diagnoses an N+1 query pattern by counting queries per request and rewrites it as a single query or a bounded
  number of queries.
- Restructures code that holds a transaction across an await, and explains what was held and why it mattered.
- Sizes a connection pool from a stated workload and describes what happens when it is exhausted.
- Chooses between `rusqlite` and `sqlx` for a described project and justifies it from the concurrency model and
  the runtime, not from preference.
- Sets up compile-time checked queries and explains what breaks when the schema changes.
- Versions a persisted `serde` structure so that older data still deserialises, and demonstrates it with a fixture.
- Writes a cache with an explicit invalidation strategy and reports its hit rate.
- Describes what a write-ahead log does and why recovery is possible after a crash.

## Projects that teach this

- **Personal library or inventory tracker.** Schema design, CRUD through `rusqlite`, a search query that needs an
  index, and a CLI with real transactions. The first database project.
- **Order and inventory service with `sqlx` and Postgres.** Async, pooled, with migrations and an explicitly
  transactional checkout path that must not oversell. N+1 problems appear naturally in the listing endpoint.
- **Bookmark store with a hand-written WAL.** Append structured records to a log file, replay on startup, and
  checkpoint into a compacted file. Teaches durability and recovery without a database dependency.
- **Cache layer with invalidation.** Add an in-process cache in front of a slow query, with TTL, explicit
  invalidation on write, and a hit-rate counter; then write a test that catches the stale read.
- **Log ingestion and analysis tool.** Parse a large log into SQLite, build indexes, and answer analytical queries,
  with `EXPLAIN ANALYZE` used to justify each index. Cross-trains with `performance`.

## Related

`distributed-systems`, `performance`, `concurrency`, `async-rust`, `software-architecture`, `security`, `testing`,
`debugging`, `codebase-reading`.

See [index.md](index.md) for routing, [testing.md](testing.md) for testing against a database without flaky tests,
[../rust/rust-language.md](../rust/rust-language.md) for `serde` and error handling in storage code, and
[../rust/ownership.md](../rust/ownership.md) for why a transaction cannot be moved across an async boundary.
