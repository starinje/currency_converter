#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run a test
run_test() {
    local name=$1
    local command=$2
    local expected_status=$3
    local expected_pattern=$4

    echo "Running test: $name"
    
    # Run the command and capture both response body and status code separately
    local response_body=$(eval "$command" | sed \$d)  # Remove last line (status code)
    local status_code=$(eval "$command" | tail -n1)   # Get just the status code
    
    # Check status code if provided
    if [ ! -z "$expected_status" ]; then
        if [ "$status_code" != "$expected_status" ]; then
            echo -e "${RED}❌ Failed: Expected status $expected_status, got $status_code${NC}"
            echo "Response: $response_body"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return
        fi
    fi
    
    # Check response pattern if provided
    if [ ! -z "$expected_pattern" ]; then
        if ! echo "$response_body" | grep -q "$expected_pattern"; then
            echo -e "${RED}❌ Failed: Response did not match expected pattern${NC}"
            echo "Response: $response_body"
            echo "Expected pattern: $expected_pattern"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return
        fi
    fi
    
    echo -e "${GREEN}✓ Passed${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

# Wait for the application to be ready
echo "Waiting for application to be ready..."
until curl -s http://localhost:3000/api/convert > /dev/null 2>&1; do
    sleep 1
done

# Test successful conversion
run_test "Successful conversion" \
    "curl -s -w '\n%{http_code}' -X GET 'http://localhost:3000/api/convert?from=BTC&to=USD&amount=1' -H 'Authorization: Bearer user123'" \
    "200" \
    '"result":'

# Test missing authorization
run_test "Missing authorization" \
    "curl -s -w '\n%{http_code}' -X GET 'http://localhost:3000/api/convert?from=BTC&to=USD&amount=1'" \
    "401" \
    '"error":"No authorization token provided"'

# Test missing parameters
run_test "Missing parameters" \
    "curl -s -w '\n%{http_code}' -X GET 'http://localhost:3000/api/convert?from=BTC' -H 'Authorization: Bearer user123'" \
    "400" \
    '"error":"Missing required parameters"'

# Test invalid currency
run_test "Invalid currency" \
    "curl -s -w '\n%{http_code}' -X GET 'http://localhost:3000/api/convert?from=INVALID&to=USD&amount=1' -H 'Authorization: Bearer user123'" \
    "400" \
    '"error":"Invalid currency"'

# Print summary
echo "----------------------------------------"
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"
echo "----------------------------------------"

# Exit with failure if any tests failed
[ $TESTS_FAILED -eq 0 ] || exit 1 