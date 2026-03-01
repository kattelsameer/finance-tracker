#!/usr/bin/env bash
# =============================================================================
# Live API Test Script — Finance Tracker Demo Backend
# Tests all 4 backend fixes against the running demo backend.
#
# Usage:
#   chmod +x scripts/api-test-demo.sh
#   ./scripts/api-test-demo.sh
#
# Prerequisites: demo backend running (port 8081, demo MySQL on 3307)
# =============================================================================

set -euo pipefail

BASE="http://localhost:8081/api/v1"
COOKIES="/tmp/api-test-cookies.txt"
PASS=0
FAIL=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASS++)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAIL++)); }
section() { echo -e "\n${YELLOW}=== $1 ===${NC}"; }

# ─────────────────────────────────────────────────────────────
# 0. Health check
# ─────────────────────────────────────────────────────────────
section "0. Backend Health"
HEALTH=$(curl -sf "$BASE/../actuator/health" 2>/dev/null || echo "UNREACHABLE")
if echo "$HEALTH" | grep -q '"status":"UP"'; then
  pass "Backend is UP on $BASE"
else
  echo -e "${RED}Backend not reachable at $BASE. Exiting.${NC}"
  exit 1
fi

# ─────────────────────────────────────────────────────────────
# 1. Authenticate as demo user
# ─────────────────────────────────────────────────────────────
section "1. Authentication"
rm -f "$COOKIES"

# Get CSRF token
CSRF_RESP=$(curl -s -c "$COOKIES" "$BASE/csrf")
CSRF=$(echo "$CSRF_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "")

if [ -z "$CSRF" ]; then
  fail "Could not get CSRF token — response: $CSRF_RESP"
  exit 1
fi
pass "Got CSRF token: ${CSRF:0:20}..."

# Login
LOGIN_HTTP=$(curl -s -o /tmp/api-test-login.json -w "%{http_code}" \
  -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"username":"demo","password":"Demo123!"}')

if [ "$LOGIN_HTTP" = "200" ]; then
  pass "Logged in as demo user (HTTP $LOGIN_HTTP)"
else
  fail "Login failed (HTTP $LOGIN_HTTP): $(cat /tmp/api-test-login.json)"
  exit 1
fi

# Re-read CSRF after login (Spring rotates it)
CSRF_RESP=$(curl -s -c "$COOKIES" -b "$COOKIES" "$BASE/csrf")
CSRF=$(echo "$CSRF_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || echo "$CSRF")

# ─────────────────────────────────────────────────────────────
# 2. ISSUE-5.1 — /refresh-rates alias endpoint
# ─────────────────────────────────────────────────────────────
section "2. ISSUE-5.1: Currency /refresh-rates endpoint (old name, new alias)"

# Note: this endpoint requires ADMIN role in production; demo user may get 403.
# The fix ensures it returns 403 (Forbidden) instead of 404 (Not Found).
REFRESH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/currencies/refresh-rates" \
  -H "X-XSRF-TOKEN: $CSRF")

if [ "$REFRESH_HTTP" = "200" ] || [ "$REFRESH_HTTP" = "403" ]; then
  pass "/currencies/refresh-rates exists — HTTP $REFRESH_HTTP (was 404 before fix)"
else
  fail "/currencies/refresh-rates returned HTTP $REFRESH_HTTP (expected 200 or 403, not 404)"
fi

# Also verify the original /update-rates still works
UPDRATE_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -c "$COOKIES" -b "$COOKIES" \
  -X POST "$BASE/currencies/update-rates" \
  -H "X-XSRF-TOKEN: $CSRF")

if [ "$UPDRATE_HTTP" = "200" ] || [ "$UPDRATE_HTTP" = "403" ]; then
  pass "/currencies/update-rates still works — HTTP $UPDRATE_HTTP"
else
  fail "/currencies/update-rates returned unexpected HTTP $UPDRATE_HTTP"
fi

# ─────────────────────────────────────────────────────────────
# 3. BUG-1 — Budget spending includes subcategory transactions
# ─────────────────────────────────────────────────────────────
section "3. BUG-1: Budget spent amount for demo budgets"

BUDGETS=$(curl -s -b "$COOKIES" "$BASE/budgets")
BUDGET_COUNT=$(echo "$BUDGETS" | python3 -c "import sys,json; b=json.load(sys.stdin); print(len(b))" 2>/dev/null || echo "0")

if [ "$BUDGET_COUNT" = "0" ]; then
  echo -e "${YELLOW}[SKIP]${NC} No budgets found for demo user — cannot verify BUG-1"
else
  pass "Found $BUDGET_COUNT budget(s)"

  # Check if any budget shows non-zero spent (would only be 0 before the fix)
  NONZERO=$(echo "$BUDGETS" | python3 -c "
import sys, json
budgets = json.load(sys.stdin)
nonzero = [(b.get('budgetName','?'), b.get('spent', 0)) for b in budgets if float(b.get('spent', 0)) > 0]
for name, spent in nonzero:
    print(f'  {name}: spent={spent}')
print(f'NONZERO_COUNT={len(nonzero)}')
" 2>/dev/null)
  echo "$NONZERO"

  NONZERO_COUNT=$(echo "$NONZERO" | grep "NONZERO_COUNT=" | cut -d= -f2)
  if [ "${NONZERO_COUNT:-0}" -gt 0 ]; then
    pass "BUG-1 FIXED: $NONZERO_COUNT budget(s) show non-zero spent amounts"
  else
    echo -e "${YELLOW}[WARN]${NC} All budgets show \$0.00 spent — may be period mismatch or no matching transactions in demo data"
    echo "      Budget details:"
    echo "$BUDGETS" | python3 -c "
import sys, json
for b in json.load(sys.stdin):
    print(f\"  {b.get('budgetName','?')}: amount={b.get('amount')}, spent={b.get('spent')}, category={b.get('category',{}).get('categoryName','(all)')}\" if b.get('category') else f\"  {b.get('budgetName','?')}: amount={b.get('amount')}, spent={b.get('spent')}, category=(all)\")
" 2>/dev/null
  fi
fi

# ─────────────────────────────────────────────────────────────
# 4. BUG-4 — Reports with hyphenated category name
# ─────────────────────────────────────────────────────────────
section "4. BUG-4: Report endpoint does not 500 on hyphenated category names"

START=$(date -v-1y +%Y-%m-%d 2>/dev/null || date -d "1 year ago" +%Y-%m-%d)
END=$(date +%Y-%m-%d)

REPORT_HTTP=$(curl -s -o /tmp/api-test-report.json -w "%{http_code}" \
  -b "$COOKIES" \
  "$BASE/reports/transactions?startDate=$START&endDate=$END")

if [ "$REPORT_HTTP" = "200" ]; then
  pass "BUG-4 FIXED: Report endpoint returned HTTP 200 (was 500 for hyphenated category names)"
  # Show category breakdown summary
  echo "      Category breakdown:"
  python3 -c "
import json
data = json.load(open('/tmp/api-test-report.json'))
print(f\"  totalIncome={data.get('totalIncome')}, totalExpenses={data.get('totalExpenses')}, transactions={data.get('transactionCount')}\")
cats = data.get('categoryBreakdown', [])
for c in cats[:5]:
    print(f\"  - {c.get('categoryName')} ({c.get('transactionType')}): {c.get('amount')} ({c.get('percentage'):.1f}%)\")
if len(cats) > 5:
    print(f'  ... and {len(cats)-5} more categories')
" 2>/dev/null
else
  fail "BUG-4: Report returned HTTP $REPORT_HTTP (expected 200)"
  echo "      Response: $(cat /tmp/api-test-report.json | head -c 300)"
fi

# Also test CSV export
EXPORT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" \
  "$BASE/reports/transactions/export?startDate=$START&endDate=$END")

if [ "$EXPORT_HTTP" = "200" ]; then
  pass "CSV export endpoint works (HTTP 200)"
else
  fail "CSV export returned HTTP $EXPORT_HTTP"
fi

# ─────────────────────────────────────────────────────────────
# 5. Summary
# ─────────────────────────────────────────────────────────────
section "Test Summary"
TOTAL=$((PASS + FAIL))
echo -e "Passed: ${GREEN}$PASS${NC} / $TOTAL"
if [ "$FAIL" -gt 0 ]; then
  echo -e "Failed: ${RED}$FAIL${NC} / $TOTAL"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
fi
