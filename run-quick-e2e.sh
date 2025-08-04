#!/bin/bash

echo "=== Quick E2E Test - Mutual Fund Manager UI ==="
echo "Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "Running key E2E tests..."

# Run only the most important tests
npx playwright test e2e/00-authentication.spec.ts e2e/01-app-initialization.spec.ts --project=chromium --reporter=line 2>&1 | tee quick-e2e-results.log

# Extract results
TOTAL_TESTS=$(grep -o "passed\|failed\|skipped" quick-e2e-results.log | wc -l)
PASSED_TESTS=$(grep -o "passed" quick-e2e-results.log | wc -l)
FAILED_TESTS=$(grep -o "failed" quick-e2e-results.log | wc -l)

print_status $GREEN "=== Quick E2E Results ==="
print_status $GREEN "Tests: $PASSED_TESTS passed, $FAILED_TESTS failed out of $TOTAL_TESTS total"

if [ "$FAILED_TESTS" -eq 0 ]; then
    print_status $GREEN "✅ All key tests passed!"
else
    print_status $YELLOW "⚠️  Some tests failed - checking details..."
    grep -A 2 -B 2 "failed" quick-e2e-results.log
fi
