#!/bin/bash

# SaSarjan Auth Integration Test Script
# This script starts all apps and runs integration tests

set -e

echo "🚀 Starting SaSarjan Auth Integration Tests"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if all required env files exist
check_env_files() {
    echo -e "${YELLOW}Checking environment files...${NC}"
    
    local apps=("web" "admin" "talentexcel" "sevapremi" "10xgrowth")
    local missing=0
    
    for app in "${apps[@]}"; do
        if [ ! -f "apps/$app/.env.local" ]; then
            echo -e "${RED}❌ Missing .env.local for $app${NC}"
            missing=1
        else
            echo -e "${GREEN}✓ Found .env.local for $app${NC}"
        fi
    done
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Please create missing .env.local files before running tests${NC}"
        exit 1
    fi
}

# Start all apps in background
start_apps() {
    echo -e "\n${YELLOW}Starting all apps...${NC}"
    
    # Kill any existing processes on our ports
    for port in 3000 3001 3002 3003 3004; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    
    # Start each app
    echo "Starting web app on port 3000..."
    (cd apps/web && pnpm dev --port 3000) &
    WEB_PID=$!
    
    echo "Starting talentexcel app on port 3001..."
    (cd apps/talentexcel && pnpm dev --port 3001) &
    TALENT_PID=$!
    
    echo "Starting sevapremi app on port 3002..."
    (cd apps/sevapremi && pnpm dev --port 3002) &
    SEVA_PID=$!
    
    echo "Starting 10xgrowth app on port 3003..."
    (cd apps/10xgrowth && pnpm dev --port 3003) &
    GROWTH_PID=$!
    
    echo "Starting admin app on port 3004..."
    (cd apps/admin && pnpm dev --port 3004) &
    ADMIN_PID=$!
    
    # Store PIDs for cleanup
    echo "$WEB_PID $TALENT_PID $SEVA_PID $GROWTH_PID $ADMIN_PID" > .test-pids
    
    echo -e "${GREEN}Apps starting up...${NC}"
}

# Wait for apps to be ready
wait_for_apps() {
    echo -e "\n${YELLOW}Waiting for apps to be ready...${NC}"
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local all_ready=true
        
        for port in 3000 3001 3002 3003 3004; do
            if ! curl -s http://localhost:$port > /dev/null; then
                all_ready=false
                break
            fi
        done
        
        if [ "$all_ready" = true ]; then
            echo -e "${GREEN}✓ All apps are ready!${NC}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo -e "${RED}❌ Apps failed to start within 60 seconds${NC}"
    cleanup
    exit 1
}

# Run integration tests
run_tests() {
    echo -e "\n${YELLOW}Running integration tests...${NC}"
    
    cd packages/auth
    
    # Install test dependencies if needed
    if [ ! -d "node_modules/playwright" ]; then
        echo "Installing test dependencies..."
        pnpm add -D playwright @playwright/test
        npx playwright install chromium
    fi
    
    # Run the tests
    pnpm test:integration
    TEST_RESULT=$?
    
    cd ../..
    
    return $TEST_RESULT
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    
    if [ -f .test-pids ]; then
        while read -r pids; do
            for pid in $pids; do
                kill -9 $pid 2>/dev/null || true
            done
        done < .test-pids
        rm .test-pids
    fi
    
    # Kill any remaining processes on our ports
    for port in 3000 3001 3002 3003 3004; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
}

# Main execution
main() {
    # Trap to ensure cleanup on exit
    trap cleanup EXIT
    
    check_env_files
    start_apps
    wait_for_apps
    
    # Run tests
    if run_tests; then
        echo -e "\n${GREEN}✅ All integration tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Integration tests failed${NC}"
        exit 1
    fi
}

# Run main function
main