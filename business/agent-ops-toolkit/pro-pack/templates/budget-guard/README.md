# Budget Guard Template (skeleton)

Goal: prevent runaway spend.

Patterns:
- per-job max cost
- per-day max cost
- circuit breaker when error rate spikes
- require explicit allowlist for expensive operations

Store spend counters in Redis/Postgres.
