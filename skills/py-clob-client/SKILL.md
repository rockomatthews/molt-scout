---
name: py-clob-client
description: |
  Polymarket official Python CLOB client playbook.
  Use for read-only orderbook snapshots and market microstructure analysis; execution remains approval-gated.
---

# py-clob-client — Polymarket CLOB (Python)

Upstream:
- https://github.com/Polymarket/py-clob-client

## Read-only quickstart
```bash
pip install py-clob-client
```

```python
from py_clob_client.client import ClobClient
client = ClobClient("https://clob.polymarket.com")
print(client.get_ok())
print(client.get_server_time())
```

## What we use it for
- Pull best bid/ask + depth snapshots
- Build **artifacts**: spreads over time, sub-$1 hedged windows, liquidity maps

## Guardrails
- No keys in chat.
- Do not place orders without explicit approval.
