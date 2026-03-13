---
name: agentcard-approved-purchase
description: Buy things online with an AI agent using AgentCard virtual cards, with strict guardrails and a chat-only APPROVE gate (no automatic spending). Use when the user wants the agent to purchase something online (Amazon, DoorDash, Instacart, etc.) safely with a capped budget.
---

# AgentCard “Approved Purchase” (chat gate)

This skill defines a **safe-by-default** purchasing workflow using AgentCard virtual cards.

## Safety rules (non‑negotiable)
- Never ask for or accept seed phrases / private keys / bank logins.
- Never use the user’s personal credit card.
- Every purchase must be protected by an explicit user approval message:
  - User must reply exactly: **APPROVE**
- Default cap: **$25** per purchase (unless the user explicitly sets a different cap).
- Create a **new card per purchase**.
- After a successful purchase, freeze/close the card if supported.

## Prereqs
The user must have AgentCard beta access and the CLI installed:

```bash
npm install -g agentcard
agentcard signup
```

## Workflow

### 1) Plan (no spending)
Gather:
- Merchant/site
- Item(s) + links
- Quantity/size/options
- Price estimate (item + tax + shipping)
- Proposed cap (default $25)

Send a single message with:
- **What will be bought** (links)
- **Max spend cap**
- **Why this is the best option** (1–2 bullets)
- Ask for: **Reply APPROVE to proceed**

### 2) Execute (only after APPROVE)
1) Create a new limited card (amount = cap)
2) Retrieve card details
3) Use the card to checkout
4) Return receipt/order confirmation
5) Freeze/close the card (best effort)

## CLI snippets (AgentCard)
> Note: exact commands may change; verify with `agentcard --help`.

```bash
agentcard cards create --amount 25
agentcard cards details <id>
```

## Recommended logging
Record:
- timestamp
- merchant
- cap
- card id
- final total
- order id
