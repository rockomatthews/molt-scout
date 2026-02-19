# Queue Template (skeleton)

Goal: make webhook processing durable.

Patterns:
- enqueue work items
- retry with exponential backoff
- dead-letter queue after max attempts
- alert on poison messages

Recommended implementations:
- Upstash Redis / BullMQ (Node)
- SQS / Cloud Tasks
- Postgres job table
