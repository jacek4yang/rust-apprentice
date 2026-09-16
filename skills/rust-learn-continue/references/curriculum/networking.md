# Networking

Networking teaches the learner how data actually gets from one process to another across unreliable
links, so that they can reason about latency, failure, and protocol behaviour instead of treating a
client library as a black box.

## What to teach

- Layering: what each layer promises, what it does not, and why the separation exists.
- Link layer concepts: frames, Ethernet addresses, MTU, why ARP exists and what it resolves.
- IP: addresses, prefixes, the v4 versus v6 split, why v6 matters, header fields that carry behaviour.
- Routing: default gateways, longest-prefix match, hop-by-hop forwarding, traceroute as a consequence.
- Subnetting: why a mask exists, what "same subnet" means, when traffic is routed instead of switched.
- ICMP: errors, `ping`, `traceroute`, fragmentation-needed, why ICMP is not a nuisance protocol.
- UDP: datagrams, no ordering, no delivery guarantee, no connection, where it is the right choice.
- TCP: the connection, the three-way handshake, sequence and acknowledgement numbers, windows, the
  four-way close, `TIME_WAIT`, and why the state machine exists.
- Sockets: the API surface (`bind`, `listen`, `accept`, `connect`), blocking versus non-blocking modes,
  `SO_REUSEADDR` and friends, and the difference between a socket and a connection.
- Congestion control concepts: slow start, congestion avoidance, loss-based versus delay-based signals,
  what happens to a connection on a lossy link.
- Retransmission and timeouts: RTO estimation, duplicate acknowledgements, fast retransmit, why a fixed
  timeout is a design bug.
- MTU, path MTU discovery and fragmentation: why the learner's 1500-byte assumption breaks.
- DNS: resolution, record types, caching and TTLs, the difference between a name and an address, why
  DNS latency is often the dominant cost in a first request.
- HTTP/1.1: request and response structure, methods, status classes, headers, persistence, pipelining's
  failure, the request-per-connection cost.
- HTTP/2 concepts: binary framing, streams, multiplexing, header compression, one connection many
  requests, and why flow control returns at the stream level.
- HTTP/3 and QUIC concepts: QUIC over UDP, streams without head-of-line blocking at the transport
  layer, connection migration, why the handshake is faster.
- TLS handshakes, at the level of round trips and what is negotiated, not the cryptographic detail.
- Proxies: forward versus reverse, what a proxy can and cannot see, and how that shapes debugging.
- NAT: how it works, why a server cannot normally connect to a client, hole punching in outline.
- Connection establishment cost: DNS, TCP, TLS, request — count the round trips.
- Latency versus throughput: why they are different problems, and why more bandwidth does not fix a
  distant server.
- Head-of-line blocking at the HTTP/1.1, HTTP/2 (TCP) and QUIC layers — the same name for three
  different problems.
- Connection pooling and keepalive: what a pool preserves, what it must not preserve, and what a stale
  pooled connection looks like when it fails.
- Multiplexing: what it buys, what it costs, and where it moves the HOL problem.

## Sequence

1. **The framing.** What is a packet, what is a stream, what is a message. Establish that the network
   delivers *bytes*, not messages.
2. **Addressing and routing.** IP addresses, prefixes, gateways, and one traceroute the learner runs and
   explains hop by hop. This unlocks everything above it.
3. **UDP first, then TCP.** UDP is the honest baseline; TCP's complexity then reads as a set of answers
   to specific problems UDP does not solve. Introducing TCP first makes reliability look free.
4. **Sockets.** One blocking TCP echo client and server. This is where they first meet the API and, more
   importantly, the lifecycle: `connect`, write, read until EOF, close.
5. **DNS.** Now that an address is meaningful, teach names. Then revisit the echo client using a name,
   and let the learner see the extra round trip.
6. **HTTP/1.1 over raw TCP and then over a client library.** The order matters: a hand-written request
   written into a socket, parsed back, then the same thing with a client. The learner must be able to
   say which parts the client did for them.
7. **TLS.** Round trips and negotiation only; `cryptography` carries the detail.
8. **HTTP/2, then HTTP/3.** Both are motivated by the problems the learner has just felt: many requests,
   connection setup cost, and blocking.
9. **Quality of service concepts.** Latency, throughput, tail behaviour, timeouts, retries, pooling,
   keepalive. This is where networking merges back into systems thinking.

Unlocks: reliable TCP clients, then HTTP clients, then production HTTP clients, then protocol work. The
`concurrency` and `async-rust` domains unlock servers and concurrent clients; until then, one connection
at a time is a fine place to be.

## Teaching notes

**Pair every protocol concept with a Rust API, and say which is which.** The learner should always be
able to answer: "is this a fact about HTTP, or a convenience the crate provides?" A session on HTTP/1.1
that never mentions `reqwest` is a success if the learner then reads the `reqwest` docs and recognises
what is being managed for them.

**The classic error is treating `reqwest` as the subject.** Learners will ask "how do I do a GET in
Rust" and expect the answer to be about the crate. Redirect: a GET is a request line, a path, headers,
and a body-less response. Then show the crate as one way to emit those bytes. If a learner can write a
valid HTTP/1.1 request by hand into a `TcpStream`, they will never again be confused by a client
library.

**Teach the connection lifecycle by making the learner observe it, not by describing it.** Give them a
server whose responses they can change, and ask them to:

- explain a `404` versus a `500` in terms of who decided.
- set a deliberate timeout on a slow endpoint and describe the failure mode they see.
- retry a request and count how many connections were opened, using the server's log as evidence.
- enable keepalive, send several requests, and observe that the connection count stays at one.
- force a stale pooled connection (restart the server while the client holds the pool) and see the
  first request after the restart fail in a distinctive way.

That last experiment teaches more about connection pooling than any diagram.

**Misleading intuitions to correct, in the order they usually appear:**

| Intuition | Correction |
| :--- | :--- |
| "TCP delivers messages." | It delivers a byte stream. Message boundaries are the application's job. |
| "`read` returns what the peer wrote." | It returns what has arrived, up to the buffer size. |
| "A closed connection is always an error." | Half-close is normal; a zero-length read means EOF. |
| "More bandwidth means faster." | Latency and round trips usually dominate. |
| "A timeout means the server is down." | It means no response arrived in time; the cause may be DNS, TCP, TLS, or the server. |
| "Retries make it reliable." | Retries without idempotency duplicate work; retries without backoff amplify outages. |
| "HTTP/2 is always faster." | It fixes HTTP/1.1's head-of-line blocking and can lose to TCP-level blocking. |
| "TLS is the same as HTTPS." | TLS is a layer; HTTPS is HTTP carried over it. |

**Do not let the learner write a protocol parser from memory without a spec open.** Teach reading RFCs
and MDN as a skill in itself: find the section, quote the sentence, implement that sentence.

**Latency arithmetic is worth an entire session.** Ask the learner to count round trips for a first
HTTPS request to a distant host and estimate the total from a plausible RTT. Making them do the
multiply-and-add once is more effective than any statement that "connection setup is expensive".

**Packet capture is the ground truth.** Teach one capture tool, one filter syntax, and one workflow:
capture, filter to the conversation, follow the stream, then explain what you see. Learners who can read
a capture stop arguing with their own assumptions. Note that on Windows they may need a capture driver
installed; do not let that become the lesson.

## Evidence of mastery

- Explains, unprompted, what happens between typing a URL and seeing a response, naming DNS, TCP, TLS
  and HTTP separately and counting the round trips.
- Writes and parses a minimal HTTP/1.1 request over a raw `TcpStream` without help.
- Diagnoses a failing request by deciding, in order, which layer failed, and says what evidence would
  distinguish them.
- Predicts, before running, whether a given change will open one connection or many.
- Explains `TIME_WAIT`, `SO_REUSEADDR`, and why a restarted server may fail to bind, without looking it up.
- Distinguishes latency from throughput in a concrete scenario, and proposes the right fix for each.
- Reads a packet capture and narrates the handshake, the request, the response and the close.
- Chooses UDP or TCP for a described workload and defends the choice with the failure model, not with
  familiarity.
- Explains head-of-line blocking at the HTTP/1.1, TCP and QUIC layers as three distinct phenomena.
- Sets a timeout, and explains what a timeout does not tell them.

## Projects that teach this

- **Raw echo client and server.** TCP first, then UDP. Never more than a few hundred lines; the point is
  the lifecycle, EOF handling, and partial reads.
- **Hand-written HTTP client.** A GET over `TcpStream` that parses the status line and headers, then
  follows one redirect. Then the same client rewritten on a crate, with a written comparison of what
  moved where.
- **DNS resolver.** Send a query over UDP, parse the response with `nom` or manual byte handling, follow
  a name to an address, then measure the difference a cached TTL makes. Excellent cross-training with
  binary parsing.
- **Latency and connection-pool experiment.** A small harness that issues N requests with and without
  pooling, with and without keepalive, and reports the distribution rather than the mean.
- **HTTP/1.1 and HTTP/2 comparison harness.** One server, two protocol versions, concurrent requests,
  and a report of how response times change under a slow first response — the head-of-line blocking
  demonstration made empirical.

## Related

`concurrency`, `async-rust`, `cryptography`, `operating-systems`, `distributed-systems`, `performance`,
`debugging`, `security`.

See [index.md](index.md) for routing, [testing.md](testing.md) for how to test network code without
flaky tests, [debugging.md](debugging.md) for capture-driven diagnosis, [performance.md](performance.md)
for latency measurement, and [../rust/ownership.md](../rust/ownership.md) for why socket and buffer
handling looks the way it does in Rust.
