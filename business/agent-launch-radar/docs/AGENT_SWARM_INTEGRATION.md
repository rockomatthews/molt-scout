# Agent Swarm integration (planned)

Source: https://clawberrypi.github.io/agent-swarm/

## Why
- Lets us scale premium coverage: outsource summarization/research tasks to agents
- Payments are USDC on Base; identity and messaging are via XMTP

## Intended flow
1) We publish a task in an XMTP group (budgeted in USDC)
2) Workers claim and submit results
3) We validate and pay USDC
4) Results are stored in our DB and shown to subscribers

## Next
- Install the skill: `npx clawhub install xmtp-agent-swarm`
- Implement task publisher + ingester
- Key management: keep payment key off Vercel; run publishers/validators on Mac or a secured server
