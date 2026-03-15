---
name: crude-driller
description: |
  Drill/mine $CRUDE on Base using drillcrude.com coordinator calldata + Bankr (stake-gated rigs). Use when the user wants to set up or run the CRUDE drilling loop (check wallet/balances, buy $CRUDE, approve+stake, auth handshake, request challenges, submit receipts/claims) via Bankr.
---

# CRUDE Driller (drillcrude.com)

This skill wraps the public drillcrude.com flow into an operator-safe, repeatable procedure.

## Hard guardrails (always)

- **Do not send any onchain transaction** (swap/bridge/approve/stake/submit/claim/unstake/withdraw) without an explicit user confirmation in-chat.
- **Never ask for or accept seed phrases.** If a user pastes keys, treat them as compromised.
- Prefer **Base** only (chainId **8453**) unless the coordinator says otherwise.

## Inputs / env

- `BANKR_API_KEY` (required) — Bankr Agent API key with write access enabled.
- `COORDINATOR_URL` (optional) — default from the upstream doc.

If you need the canonical upstream spec, read:
- `references/upstream-skill.md`

## Workflow (operator checklist)

### 0) Identify the driller wallet

Use Bankr `/agent/me` to resolve the user’s EVM/Base address. Show it to the user and ask them to confirm they want to proceed.

### 1) Verify token + check balances

- Query coordinator `/v1/token` to get the **current $CRUDE token address**.
- Ask Bankr: “what are my balances on base?”
- Confirm the user has:
  - some **ETH on Base** for gas
  - enough **$CRUDE** to stake

### 2) Funding (only with approval)

If they’re short:
- bridge a small amount of ETH to Base for gas
- swap to $CRUDE using the token address from `/v1/token`

### 3) Stake (only with approval)

Minimum eligibility is stake-gated (tiered rigs). The coordinator provides pre-encoded transactions:

- `GET /v1/stake-approve-calldata?amount=<baseUnits>`
- `GET /v1/stake-calldata?amount=<baseUnits>`

Submit each transaction via Bankr `/agent/submit` with `waitForConfirmation=true`.

### 4) Auth handshake (nonce → sign → verify)

Obtain bearer token via:
- `POST /v1/auth/nonce` (message)
- Bankr `/agent/sign` (personal_sign)
- `POST /v1/auth/verify` (token)

Reuse token until expiry; re-auth on 401 or near-expiry.

### 5) Drilling loop (only with approval for each tx)

Repeatedly:
- request a drill/challenge from coordinator
- solve deterministically from the provided prose (no tools required)
- submit the receipt/solution transaction via Bankr (coordinator provides calldata)

### 6) Unstake/withdraw (only with approval)

- `GET /v1/unstake-calldata`
- (after cooldown) `GET /v1/withdraw-calldata`

## Suggested automation (optional)

If asked to automate, use the helper scripts in `scripts/` (they keep JSON handling robust with `jq`).
