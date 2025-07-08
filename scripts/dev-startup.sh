#!/bin/bash
# SaSarjan App Store Development Startup Script
# This script ensures consistent initialization of your development environment
# preventing VSCode Remote-WSL crashes and connection issues

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for a port to be available
wait_for_port() {
    local port=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    echo -n "Waiting for $service (port $port) to be ready..."
    while ! nc -z localhost $port 2>/dev/null; do
        if [ $attempt -eq $max_attempts ]; then
            echo " timeout!"
            return 1
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    echo " ready!"
    return 0
}

# Main startup sequence
echo "========================================="
echo "SaSarjan App Store Development Startup"
echo "========================================="

# 1. Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed or not in PATH"
    print_warning "Please ensure Docker Desktop is running on Windows"
    exit 1
fi

if ! command_exists pnpm; then
    print_error "pnpm is not installed"
    print_warning "Installing pnpm..."
    npm install -g pnpm
fi

if ! command_exists code; then
    print_warning "VSCode command 'code' not found in PATH"
    print_warning "You may need to install it from VSCode: Shell Command: Install 'code' command in PATH"
fi

# 2. Check Docker status
print_status "Checking Docker status..."
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running"
    print_warning "Please start Docker Desktop on Windows and wait for it to be ready"
    exit 1
fi

# 3. Clean up any stale VSCode server processes
print_status "Cleaning up stale VSCode server processes..."
pkill -f "vscode-server" 2>/dev/null || true
sleep 1

# 4. Navigate to project directory
cd ~/projects/SaSarjan-AppStore || {
    print_error "Project directory not found: ~/projects/SaSarjan-AppStore"
    exit 1
}

# 5. Start Docker services
print_status "Starting Docker services..."
if [ -f "docker-compose.dev.yml" ]; then
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services to be ready
    wait_for_port 6379 "Redis"
    wait_for_port 9000 "MinIO"
    wait_for_port 8025 "MailHog"
else
    print_warning "docker-compose.dev.yml not found, skipping Docker services"
fi

# 6. Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    print_status "Installing dependencies..."
    pnpm install
else
    print_status "Dependencies are up to date"
fi

# 6.5. Start Supabase Studio
print_status "Starting Supabase Studio..."
if command_exists supabase; then
    # Check if .env.local exists and has SUPABASE_URL
    if [ -f ".env.local" ] && grep -q "SUPABASE_URL" ".env.local"; then
        # Start Supabase Studio in background
        supabase start --db-url $(grep SUPABASE_URL .env.local | cut -d '=' -f2) &
        SUPABASE_PID=$!
        
        # Wait for Supabase Studio to be ready
        wait_for_port 54323 "Supabase Studio"
    else
        print_warning "Supabase configuration not found in .env.local"
        print_warning "Skipping Supabase Studio startup"
    fi
else
    print_warning "Supabase CLI not found, skipping Supabase Studio"
fi

# 7. Check for TypeScript errors
print_status "Running type check..."
pnpm typecheck || {
    print_warning "TypeScript errors found, but continuing..."
}

# 8. Start VSCode
print_status "Starting VSCode..."
code . &

# Wait a bit for VSCode to initialize
sleep 3

# 9. Start development servers
print_status "Starting development servers..."
echo ""
echo "Development servers will start on:"
echo "  - Main App:     http://localhost:3000"
echo "  - TalentExcel:  http://localhost:3005"
echo "  - SevaPremi:    http://localhost:3002"
echo "  - 10xGrowth:    http://localhost:3003"
echo "  - Admin:        http://localhost:3004"
echo ""
echo "Other services:"
echo "  - Supabase Studio: http://localhost:54323"
echo "  - MailHog UI:   http://localhost:8025"
echo "  - MinIO UI:     http://localhost:9001"
echo "  - Adminer:      http://localhost:8080"
echo ""

# Start dev servers
pnpm dev

# The script will continue running with pnpm dev
# Press Ctrl+C to stop all services