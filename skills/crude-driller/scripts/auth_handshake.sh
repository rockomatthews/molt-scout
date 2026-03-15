#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   BANKR_API_KEY=... DRILLER_ADDRESS=0x... ./auth_handshake.sh [COORDINATOR_URL]
# Prints: TOKEN=<bearer>

COORDINATOR_URL=${1:-${COORDINATOR_URL:-https://coordinator-production-38c0.up.railway.app}}

: "${BANKR_API_KEY:?BANKR_API_KEY required}"
: "${DRILLER_ADDRESS:?DRILLER_ADDRESS required}"

NONCE_RESPONSE=$(curl -s -X POST "$COORDINATOR_URL/v1/auth/nonce" \
  -H "Content-Type: application/json" \
  -d "{\"miner\":\"$DRILLER_ADDRESS\"}")

MESSAGE=$(echo "$NONCE_RESPONSE" | jq -r '.message')
if [[ -z "$MESSAGE" || "$MESSAGE" == "null" ]]; then
  echo "Failed to get nonce message" >&2
  echo "$NONCE_RESPONSE" >&2
  exit 1
fi

SIGN_RESPONSE=$(curl -s -X POST "https://api.bankr.bot/agent/sign" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $BANKR_API_KEY" \
  -d "$(jq -n --arg msg "$MESSAGE" '{signatureType: "personal_sign", message: $msg}')")

SIGNATURE=$(echo "$SIGN_RESPONSE" | jq -r '.signature')
if [[ -z "$SIGNATURE" || "$SIGNATURE" == "null" ]]; then
  echo "Failed to sign" >&2
  echo "$SIGN_RESPONSE" >&2
  exit 1
fi

VERIFY_RESPONSE=$(curl -s -X POST "$COORDINATOR_URL/v1/auth/verify" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg miner "$DRILLER_ADDRESS" --arg msg "$MESSAGE" --arg sig "$SIGNATURE" '{miner: $miner, message: $msg, signature: $sig}')")

TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.token')
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Failed to verify" >&2
  echo "$VERIFY_RESPONSE" >&2
  exit 1
fi

echo "TOKEN=$TOKEN"