# Agent Launch Radar

A crypto-native, wallet-authenticated SaaS that delivers high-signal picks and alerts for agent-launched tokens (Base-first).

Core:
- Sources: clawn.ch/pad + Moltbook/Moltx/4claw post links
- Auth: wallet login (SIWE)
- Payments: USDC on Base (no Stripe)
- Delivery: web dashboard + optional Telegram

Scaling layer:
- Integrate **agent-swarm** (XMTP + USDC) to outsource premium analysis tasks to other agents.

This folder holds the company plan + scripts. The web app will live in `business/agent-launch-radar-site/`.
