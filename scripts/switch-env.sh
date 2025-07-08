#!/bin/bash

# Environment Switching Script for SaSarjan Admin Panel
# Usage: ./scripts/switch-env.sh [local|production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADMIN_DIR="$PROJECT_ROOT/apps/admin"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [local|production|staging]"
    echo ""
    echo "Available environments:"
    echo "  local      - Switch to local Supabase development"
    echo "  production - Switch to cloud Supabase production"
    echo "  staging    - Switch to cloud Supabase staging"
    echo ""
    echo "Example: $0 local"
}

# Function to validate environment
validate_env() {
    local env=$1
    case $env in
        local|production|staging)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to check if environment file exists
check_env_file() {
    local env=$1
    # Map local to development
    if [[ "$env" == "local" ]]; then
        env="development"
    fi
    local env_file="$ADMIN_DIR/.env.local.$env"
    
    if [[ ! -f "$env_file" ]]; then
        print_error "Environment file not found: $env_file"
        print_info "Available environment files:"
        ls -la "$ADMIN_DIR"/.env.local.* 2>/dev/null || print_warning "No environment files found"
        exit 1
    fi
}

# Function to backup current environment
backup_current_env() {
    if [[ -f "$ADMIN_DIR/.env.local" ]]; then
        cp "$ADMIN_DIR/.env.local" "$ADMIN_DIR/.env.local.backup"
        print_info "Current environment backed up to .env.local.backup"
    fi
}

# Function to switch environment
switch_environment() {
    local env=$1
    # Map local to development
    if [[ "$env" == "local" ]]; then
        env="development"
    fi
    local env_file="$ADMIN_DIR/.env.local.$env"
    local target_file="$ADMIN_DIR/.env.local"
    
    local display_env=$1  # Keep original name for display
    print_info "Switching to $display_env environment..."
    
    # Check if source file exists
    check_env_file "$env"
    
    # Backup current environment
    backup_current_env
    
    # Copy the environment file
    cp "$env_file" "$target_file"
    
    print_success "Successfully switched to $display_env environment"
    print_info "Environment file: $target_file"
    
    # Show current environment info
    echo ""
    print_info "Current environment configuration:"
    echo "----------------------------------------"
    grep -E '^NEXT_PUBLIC_SUPABASE_URL|^NODE_ENV|^NEXT_PUBLIC_ENVIRONMENT' "$target_file" || true
    echo "----------------------------------------"
}

# Function to show current environment
show_current_env() {
    local env_file="$ADMIN_DIR/.env.local"
    
    if [[ ! -f "$env_file" ]]; then
        print_warning "No active environment file found (.env.local)"
        return 1
    fi
    
    print_info "Current environment configuration:"
    echo "----------------------------------------"
    grep -E '^NEXT_PUBLIC_SUPABASE_URL|^NODE_ENV|^NEXT_PUBLIC_ENVIRONMENT' "$env_file" || true
    echo "----------------------------------------"
    
    # Try to determine which environment is active
    local supabase_url=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$env_file" | cut -d'=' -f2)
    if [[ "$supabase_url" == *"127.0.0.1"* ]]; then
        print_info "Active environment: local"
    elif [[ "$supabase_url" == *"supabase.co"* ]]; then
        local env_marker=$(grep '^NEXT_PUBLIC_ENVIRONMENT=' "$env_file" | cut -d'=' -f2)
        print_info "Active environment: ${env_marker:-cloud}"
    else
        print_info "Active environment: unknown"
    fi
}

# Main script logic
main() {
    cd "$PROJECT_ROOT"
    
    # If no arguments, show current environment
    if [[ $# -eq 0 ]]; then
        show_current_env
        exit 0
    fi
    
    local env=$1
    
    # Handle help flag
    if [[ "$env" == "-h" || "$env" == "--help" ]]; then
        show_usage
        exit 0
    fi
    
    # Validate environment argument
    if ! validate_env "$env"; then
        print_error "Invalid environment: $env"
        echo ""
        show_usage
        exit 1
    fi
    
    # Switch to the specified environment
    switch_environment "$env"
    
    echo ""
    print_info "Don't forget to restart your development server:"
    print_info "  pnpm dev:admin"
}

# Run main function with all arguments
main "$@"