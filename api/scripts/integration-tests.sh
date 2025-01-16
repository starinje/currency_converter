#!/bin/sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL for the API
BASE_URL="http://localhost:3000/api"

# Authorization token
AUTH_TOKEN="test-token"

# Track test failures
FAILED_TESTS=0

# Function to check if it's a weekend
is_weekend() {
    local day=$(date +%u)
    [ "$day" -gt 5 ]
}

# Set rate limit based on day of week
if is_weekend; then
    RATE_LIMIT=200
    echo "Weekend detected - Rate limit is set to 200"
else
    RATE_LIMIT=100
    echo "Weekday detected - Rate limit is set to 100"
fi

# Test missing authorization
echo -e "\n${GREEN}Testing missing authorization...${NC}"
response=$(curl -s "$BASE_URL/convert?from=BTC&to=USD&amount=1")
echo "Response: $response"

if echo "$response" | jq -e 'select(.error == "No authorization token provided")' > /dev/null; then
    echo -e "${GREEN}✓ Missing authorization test passed${NC}"
else
    echo -e "${RED}✗ Missing authorization test failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test missing parameters
echo -e "\n${GREEN}Testing missing parameters...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/convert?from=BTC")
echo "Response: $response"

if echo "$response" | jq -e 'select(.error == "Missing required parameters")' > /dev/null; then
    echo -e "${GREEN}✓ Missing parameters test passed${NC}"
else
    echo -e "${RED}✗ Missing parameters test failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test invalid currency
echo -e "\n${GREEN}Testing invalid currency...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/convert?from=INVALID&to=USD&amount=1")
echo "Response: $response"

if echo "$response" | jq -e 'select(.error == "Invalid currency")' > /dev/null; then
    echo -e "${GREEN}✓ Invalid currency test passed${NC}"
else
    echo -e "${RED}✗ Invalid currency test failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test invalid amount
echo -e "\n${GREEN}Testing invalid amount...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/convert?from=BTC&to=USD&amount=invalid")
echo "Response: $response"

if echo "$response" | jq -e 'select(.error == "Invalid amount")' > /dev/null; then
    echo -e "${GREEN}✓ Invalid amount test passed${NC}"
else
    echo -e "${RED}✗ Invalid amount test failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test rate limiting
echo -e "\n${GREEN}Testing rate limit...${NC}"
echo "Making $RATE_LIMIT requests to reach the rate limit..."

for i in $(seq 1 $(($RATE_LIMIT))); do
    response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/convert?from=BTC&to=USD&amount=1")
    remaining=$(echo "$response" | jq -r '.remaining')
    
    if [ $((i % 20)) -eq 0 ]; then
        echo "Progress: $i/$RATE_LIMIT requests made (Remaining: $remaining)"
    fi
done

# Make one more request that should exceed the rate limit
echo -e "\n${GREEN}Making request that should exceed rate limit...${NC}"
response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$BASE_URL/convert?from=BTC&to=USD&amount=1")
echo "Response from rate-limited request:"
echo "$response" | jq '.'

# Check if we got the expected rate limit error
if echo "$response" | jq -e 'select(.error == "Rate limit exceeded")' > /dev/null; then
    echo -e "${GREEN}✓ Rate limit test passed${NC}"
else
    echo -e "${RED}✗ Rate limit test failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Print test summary
echo -e "\n${GREEN}Test Summary:${NC}"
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ $FAILED_TESTS test(s) failed${NC}"
    exit 1
fi 