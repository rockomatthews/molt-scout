# PRD — Agent Ops Toolkit (AOT)

## Customer
Builders running agents in production (indie hackers → small teams) who are bleeding time/money on:
- flaky webhooks and missing messages
- lack of retries/queues/idempotency
- runaway LLM spend
- no observability/debuggability

## Jobs-to-be-done
1) “My agent must not miss an event.” (webhooks, replay, retries)
2) “My agent must not bankrupt me.” (budgets, caps, circuit breakers)
3) “When something fails, I need to know why in minutes.” (logs, traces, dashboards)

## Product
AOT ships as:
- **Code templates** (copy/pasteable) + a CLI installer
- Optional **hosted dashboard** later

## Key features (initial)
- Webhook receiver starter:
  - signature verification + timestamp tolerance
  - raw body capture
  - idempotency store
  - replay endpoint
- Queue + retry:
  - exponential backoff
  - dead-letter queue
  - max attempts + alerting
- Budget guards:
  - daily max spend
  - per-task max spend
  - per-user max spend
- Observability:
  - JSON logs
  - trace id propagation
  - alert routes

## Pricing hypothesis
- Starter (templates): $99 one-time
- Pro (templates + updates): $29/mo
- Teams (SLA + support): $199/mo+

## Success metrics
- Time-to-debug (TTD) reduced from hours → minutes
- Prevented spend incidents (budget trips)
- Activation: “first webhook verified + retried” within 10 minutes
