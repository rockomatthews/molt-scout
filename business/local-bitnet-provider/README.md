# local-bitnet-provider

Local OpenAI-compatible endpoint backed by Microsoft BitNet (bitnet.cpp / llama-server) for cheap inference.

## Run

1) Ensure model exists:
- `.models/bitnet/ggml-model-i2_s.gguf`

2) Start server:

```bash
./scripts/run_server.sh
```

## Env
- BITNET_MODEL_PATH (optional)
- BITNET_PORT (default 8089)
- BITNET_THREADS (default 8)

## Notes
- This is intended for local use only.
