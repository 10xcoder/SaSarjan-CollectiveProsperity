#!/bin/bash
# SaSarjan App Store Development Shutdown Script
# Cleanly stops all development services and processes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "========================================="
echo "SaSarjan App Store Development Shutdown"
echo "========================================="

# Navigate to project directory
cd ~/projects/SaSarjan-AppStore || {
    echo "Project directory not found"
    exit 1
}

# 1. Stop Node.js dev servers
print_status "Stopping development servers..."
pkill -f "turbo run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true

# 2. Stop Docker services
if [ -f "docker-compose.dev.yml" ]; then
    print_status "Stopping Docker services..."
    docker-compose -f docker-compose.dev.yml down
fi

# 3. Clean up VSCode server processes
print_status "Cleaning up VSCode server processes..."
pkill -f "vscode-server" 2>/dev/null || true

# 4. Optional: Clear temporary files
print_status "Clearing temporary files..."
rm -rf .next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

# 5. Show resource usage
print_status "Current resource usage:"
echo ""
free -h
echo ""
docker ps

echo ""
print_status "Shutdown complete!"
echo "To restart, run: ./scripts/dev-startup.sh"