#!/usr/bin/env bash
# Quick check: are currencies (especially NPR) returned by the demo backend?
BASE="http://localhost:8081/api/v1"
COOKIES=$(mktemp)

# Get CSRF token
CSRF=$(curl -sf -c "$COOKIES" "$BASE/auth/csrf-token" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)

# Login
curl -sf -b "$COOKIES" -c "$COOKIES" \
  -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"username":"demo","password":"Demo123!"}' > /dev/null 2>&1

# Fetch currencies
echo "=== Currencies from API ==="
curl -sf -b "$COOKIES" "$BASE/currencies" | python3 - << 'PYEOF'
import sys, json
data = json.load(sys.stdin)
print(f"Total currencies returned: {len(data)}")
codes = [c['code'] for c in data]
print("Codes:", sorted(codes))
print("NPR present:", "NPR" in codes)
if "NPR" in codes:
    npr = next(c for c in data if c['code'] == 'NPR')
    print(f"NPR details: {npr}")
PYEOF

rm -f "$COOKIES"
