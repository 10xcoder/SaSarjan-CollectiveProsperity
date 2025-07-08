#!/bin/bash
# SaSarjan App Store Interactive Development Startup Script
# This script provides options for starting specific apps or all apps
# with the ability to run in background or foreground

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
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

# Function to show menu and get user choice
show_app_menu() {
    echo ""
    echo "========================================="
    echo "Select which app(s) to start:"
    echo "========================================="
    echo "1) All apps (Main, TalentExcel, SevaPremi, 10xGrowth, Admin)"
    echo "2) Main App Store only (port 3000)"
    echo "3) TalentExcel only (port 3005)"
    echo "4) SevaPremi only (port 3002)"
    echo "5) 10xGrowth only (port 3003)"
    echo "6) Admin only (port 3004)"
    echo "7) Custom selection (choose multiple)"
    echo "8) Infrastructure only (Docker services, no apps)"
    echo "0) Exit"
    echo ""
    read -p "Enter your choice (0-8): " choice
    echo ""
}

# Function to show run mode menu
show_run_mode_menu() {
    echo "========================================="
    echo "How would you like to run the apps?"
    echo "========================================="
    echo "1) Foreground (blocks terminal, shows all logs)"
    echo "2) Background (returns to prompt, logs in .logs/)"
    echo "3) New terminal windows (opens each app in new terminal)"
    echo ""
    read -p "Enter your choice (1-3): " run_mode
    echo ""
}

# Function to start apps based on selection
start_apps() {
    local apps="$1"
    local mode="$2"
    
    case $mode in
        1) # Foreground
            print_info "Starting apps in foreground (Ctrl+C to stop)..."
            if [ "$apps" = "all" ]; then
                pnpm dev
            else
                pnpm turbo dev --filter=$apps
            fi
            ;;
        2) # Background
            print_info "Starting apps in background..."
            mkdir -p .logs
            local log_file=".logs/dev-$(date +%Y%m%d-%H%M%S).log"
            
            if [ "$apps" = "all" ]; then
                nohup pnpm dev > "$log_file" 2>&1 &
            else
                nohup pnpm turbo dev --filter=$apps > "$log_file" 2>&1 &
            fi
            
            local pid=$!
            echo $pid > .logs/dev.pid
            print_status "Apps started in background (PID: $pid)"
            print_info "Logs: tail -f $log_file"
            print_info "Stop: kill $pid"
            ;;
        3) # New terminals
            print_info "Starting apps in new terminal windows..."
            if [ "$apps" = "all" ]; then
                # Start each app in its own terminal
                gnome-terminal --title="Main App" -- bash -c "pnpm dev:web; exec bash" 2>/dev/null || \
                wt.exe new-tab --title "Main App" bash -c "pnpm dev:web" 2>/dev/null || \
                print_warning "Could not open new terminal for Main App"
                
                gnome-terminal --title="TalentExcel" -- bash -c "pnpm dev:talentexcel; exec bash" 2>/dev/null || \
                wt.exe new-tab --title "TalentExcel" bash -c "pnpm dev:talentexcel" 2>/dev/null || \
                print_warning "Could not open new terminal for TalentExcel"
                
                gnome-terminal --title="SevaPremi" -- bash -c "pnpm dev:sevapremi; exec bash" 2>/dev/null || \
                wt.exe new-tab --title "SevaPremi" bash -c "pnpm dev:sevapremi" 2>/dev/null || \
                print_warning "Could not open new terminal for SevaPremi"
                
                gnome-terminal --title="10xGrowth" -- bash -c "pnpm dev:10xgrowth; exec bash" 2>/dev/null || \
                wt.exe new-tab --title "10xGrowth" bash -c "pnpm dev:10xgrowth" 2>/dev/null || \
                print_warning "Could not open new terminal for 10xGrowth"
                
                gnome-terminal --title="Admin" -- bash -c "pnpm dev:admin; exec bash" 2>/dev/null || \
                wt.exe new-tab --title "Admin" bash -c "pnpm dev:admin" 2>/dev/null || \
                print_warning "Could not open new terminal for Admin"
            else
                gnome-terminal --title="Dev Server" -- bash -c "pnpm turbo dev --filter=$apps; exec bash" 2>/dev/null || \
                wt.exe new-tab --title "Dev Server" bash -c "pnpm turbo dev --filter=$apps" 2>/dev/null || \
                print_warning "Could not open new terminal"
            fi
            print_info "Check your terminal windows/tabs"
            ;;
    esac
}

# Function to run initial setup (same as original script)
run_initial_setup() {
    # Check prerequisites
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
    
    # Check Docker status (once per day)
    DOCKER_CHECK_FILE="/tmp/.sas-docker-check-$(date +%Y%m%d)"
    if [ ! -f "$DOCKER_CHECK_FILE" ]; then
        print_status "Checking Docker status (daily check)..."
        if ! docker info >/dev/null 2>&1; then
            print_error "Docker daemon is not running"
            print_warning "Please start Docker Desktop on Windows and wait for it to be ready"
            exit 1
        fi
        # Create timestamp file for today
        touch "$DOCKER_CHECK_FILE"
        # Clean up old check files
        find /tmp -name ".sas-docker-check-*" -mtime +1 -delete 2>/dev/null || true
    else
        print_info "Skipping Docker check (already verified today)"
    fi
    
    # Clean up any stale VSCode server processes
    print_status "Cleaning up stale VSCode server processes..."
    pkill -f "vscode-server" 2>/dev/null || true
    sleep 1
    
    # Navigate to project directory
    cd ~/projects/SaSarjan-AppStore || {
        print_error "Project directory not found: ~/projects/SaSarjan-AppStore"
        exit 1
    }
    
    # Start Docker services
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
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install
    else
        print_status "Dependencies are up to date"
    fi
    
    # Check for TypeScript errors
    print_status "Running type check..."
    pnpm typecheck || {
        print_warning "TypeScript errors found, but continuing..."
    }
}

# Function to stop background processes
stop_background_apps() {
    if [ -f ".logs/dev.pid" ]; then
        local pid=$(cat .logs/dev.pid)
        if kill -0 $pid 2>/dev/null; then
            print_info "Stopping background apps (PID: $pid)..."
            kill $pid
            rm .logs/dev.pid
            print_status "Background apps stopped"
        else
            print_warning "No running background apps found"
            rm .logs/dev.pid
        fi
    else
        print_warning "No background apps PID file found"
    fi
}

# Main execution
echo "========================================="
echo "SaSarjan App Store Development Startup"
echo "========================================="

# Check if we should stop background apps
if [ "$1" = "stop" ]; then
    stop_background_apps
    exit 0
fi

# Run initial setup
run_initial_setup

# Show app selection menu
while true; do
    show_app_menu
    
    case $choice in
        0)
            print_info "Exiting..."
            exit 0
            ;;
        1)
            show_run_mode_menu
            start_apps "all" "$run_mode"
            break
            ;;
        2)
            show_run_mode_menu
            start_apps "@sasarjan/web" "$run_mode"
            break
            ;;
        3)
            show_run_mode_menu
            start_apps "@sasarjan/talentexcel" "$run_mode"
            break
            ;;
        4)
            show_run_mode_menu
            start_apps "@sasarjan/sevapremi" "$run_mode"
            break
            ;;
        5)
            show_run_mode_menu
            start_apps "@sasarjan/10xgrowth" "$run_mode"
            break
            ;;
        6)
            show_run_mode_menu
            start_apps "@sasarjan/admin" "$run_mode"
            break
            ;;
        7)
            # Custom selection
            print_info "Select apps to start (space-separated numbers):"
            echo "1) Main App"
            echo "2) TalentExcel"
            echo "3) SevaPremi"
            echo "4) 10xGrowth"
            echo "5) Admin"
            read -p "Enter choices (e.g., 1 3 5): " -a selections
            
            filters=""
            for sel in "${selections[@]}"; do
                case $sel in
                    1) filters="$filters --filter=@sasarjan/web";;
                    2) filters="$filters --filter=@sasarjan/talentexcel";;
                    3) filters="$filters --filter=@sasarjan/sevapremi";;
                    4) filters="$filters --filter=@sasarjan/10xgrowth";;
                    5) filters="$filters --filter=@sasarjan/admin";;
                esac
            done
            
            if [ -n "$filters" ]; then
                show_run_mode_menu
                print_info "Starting selected apps..."
                case $run_mode in
                    1) pnpm turbo dev $filters;;
                    2) 
                        mkdir -p .logs
                        log_file=".logs/dev-$(date +%Y%m%d-%H%M%S).log"
                        nohup pnpm turbo dev $filters > "$log_file" 2>&1 &
                        pid=$!
                        echo $pid > .logs/dev.pid
                        print_status "Apps started in background (PID: $pid)"
                        print_info "Logs: tail -f $log_file"
                        ;;
                    3) 
                        print_warning "Multiple terminals not implemented for custom selection"
                        print_info "Running in foreground instead..."
                        pnpm turbo dev $filters
                        ;;
                esac
            fi
            break
            ;;
        8)
            print_status "Infrastructure is ready. No apps started."
            echo ""
            echo "Services running:"
            echo "  - Redis:        http://localhost:6379"
            echo "  - MinIO UI:     http://localhost:9001"
            echo "  - MailHog UI:   http://localhost:8025"
            echo "  - Adminer:      http://localhost:8080"
            break
            ;;
        *)
            print_error "Invalid choice. Please try again."
            ;;
    esac
done

echo ""
print_status "Development environment is ready!"

# Show relevant URLs based on what was started
if [ "$choice" != "8" ]; then
    echo ""
    echo "Access your apps at:"
    case $choice in
        1) # All apps
            echo "  - Main App:     http://localhost:3000"
            echo "  - TalentExcel:  http://localhost:3005"
            echo "  - SevaPremi:    http://localhost:3002"
            echo "  - 10xGrowth:    http://localhost:3003"
            echo "  - Admin:        http://localhost:3004"
            ;;
        2) echo "  - Main App:     http://localhost:3000";;
        3) echo "  - TalentExcel:  http://localhost:3005";;
        4) echo "  - SevaPremi:    http://localhost:3002";;
        5) echo "  - 10xGrowth:    http://localhost:3003";;
        6) echo "  - Admin:        http://localhost:3004";;
    esac
fi

# Return to prompt if running in background
if [ "$run_mode" = "2" ]; then
    echo ""
    print_info "To stop background apps: ./scripts/dev-startup-interactive.sh stop"
fi